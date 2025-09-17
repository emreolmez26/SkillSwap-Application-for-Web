const express = require("express");
const jwt = require("jsonwebtoken"); // JWT token doğrulama için
const User = require("../models/user"); // User modeli
const Match = require("../models/match"); // Match modeli
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "skillswap_secret_key";

// MIDDLEWARE: JWT Token doğrulama
// Amaç: Eşleşme işlemlerinde kullanıcı kimliğini doğrulamak
// Tüm match endpoint'leri korumalı olduğu için bu middleware gerekli
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token gerekli",
    });
  }

  const token = authHeader.substring(7); // "Bearer " kısmını çıkar (7 karakter)

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Token'ı doğrula
    req.user = decoded; // Sonraki işlemlerde kullanılmak üzere
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz token",
    });
  }
};

// GET /api/matches/find - Mevcut kullanıcı için potansiyel eşleşmeleri bul
// Amaç: SkillSwap'in kalbi - eşleşme algoritması
// Giriş: JWT token (kullanıcı kimliği için)
// Çıkış: { success, message, matches: [] }
// Algoritma:
// 1. Kullanıcının öğrenmek istediği her skill için
// 2. Bu skill'i öğretebilen diğer kullanıcıları bul
// 3. Bu kullanıcılar bizim öğretebildiğimiz bir skill öğrenmek istiyor mu?
// 4. Varsa: MUTUAL MATCH, yoksa: ONE-WAY MATCH
router.get("/find", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // ADIM 1: Mevcut kullanıcıyı skill'leriyle birlikte getir
    const currentUser = await User.findById(userId).populate(
      "skillsToTeach skillsToLearn"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // ADIM 2: Kullanıcı öğrenmek istediği skill belirtmiş mi kontrol et
    if (currentUser.skillsToLearn.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "Eşleşme bulmak için önce öğrenmek istediğiniz skill'leri ekleyin",
        matches: [],
      });
    }

    // ADIM 3: Potansiyel eşleşmeleri bulmak için ana döngü
    const potentialMatches = [];

    // Her öğrenmek istediği skill için eşleşme arayışı
    for (const learnSkill of currentUser.skillsToLearn) {
      // ADIM 4: Bu skill'i öğretebilen diğer kullanıcıları bul
      const teachersOfThisSkill = await User.find({
        _id: { $ne: userId }, // Kendisi hariç
        skillsToTeach: learnSkill._id,
      }).populate("skillsToTeach skillsToLearn");

      // ADIM 5: Her potansiyel öğretmen için mutual match kontrolü
      for (const teacher of teachersOfThisSkill) {
        // Bu öğretmen bizim öğretebildiğimiz bir skill öğrenmek istiyor mu?
        const mutualMatch = teacher.skillsToLearn.find((teacherWantsToLearn) =>
          currentUser.skillsToTeach.some(
            (weCanTeach) =>
              weCanTeach._id.toString() === teacherWantsToLearn._id.toString()
          )
        );

        if (mutualMatch) {
          // ADIM 6a: İki yönlü eşleşme bulundu! (MÜKEMMEL DURUM)
          // Örnek: A JavaScript öğretebilir + Gitar öğrenmek ister
          //        B Gitar öğretebilir + JavaScript öğrenmek ister
          potentialMatches.push({
            matchedUser: {
              id: teacher._id,
              username: teacher.username,
              bio: teacher.bio,
              location: teacher.location,
            },
            youWantToLearn: learnSkill.name, // Senin öğrenmek istediğin
            theyCanTeach: learnSkill.name, // Onun öğretebildiği
            youCanTeach: mutualMatch.name, // Senin öğretebildiğin
            theyWantToLearn: mutualMatch.name, // Onun öğrenmek istediği
            matchType: "mutual", // İki yönlü eşleşme
          });
        } else {
          // ADIM 6b: Tek yönlü eşleşme (sadece onlar bizim istediğimizi öğretebiliyor)
          potentialMatches.push({
            matchedUser: {
              id: teacher._id,
              username: teacher.username,
              bio: teacher.bio,
              location: teacher.location,
            },
            youWantToLearn: learnSkill.name,
            theyCanTeach: learnSkill.name,
            matchType: "one-way", // Tek yönlü eşleşme
          });
        }
      }
    }

    // ADIM 7: Duplicate eşleşmeleri temizle
    // (Aynı kullanıcıyla birden fazla skill eşleşmesi olabilir, en iyisini tut)
    const uniqueMatches = potentialMatches.reduce((acc, current) => {
      const existingMatch = acc.find(
        (match) =>
          match.matchedUser.id.toString() === current.matchedUser.id.toString()
      );

      if (!existingMatch) {
        acc.push(current); // İlk eşleşmeyi ekle
      } else if (
        current.matchType === "mutual" &&
        existingMatch.matchType === "one-way"
      ) {
        // Mutual match'i tek yönlüye tercih et
        const index = acc.indexOf(existingMatch);
        acc[index] = current;
      }

      return acc;
    }, []);

    res.status(200).json({
      success: true,
      message: `${uniqueMatches.length} potansiyel eşleşme bulundu`,
      matches: uniqueMatches,
    });
  } catch (error) {
    console.error("Find matches error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// POST /api/matches/create - Eşleşme talebi gönder
// Amaç: Potansiyel eşleşmeyi gerçek talebe dönüştürmek
// Giriş: { targetUserId, skillOfferedId, skillRequestedId }
// Çıkış: { success, message, match }
// İşlem Adımları:
// 1. Parametreleri validate et
// 2. Mevcut eşleşme var mı kontrol et
// 3. Yeni Match kaydı oluştur (status: pending)
// 4. Match bilgilerini döndür
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { targetUserId, skillOfferedId, skillRequestedId } = req.body;
    const userId = req.user.userId; // Talep gönderen kullanıcı

    // ADIM 1: Tüm parametrelerin varlığını kontrol et
    if (!targetUserId || !skillOfferedId || !skillRequestedId) {
      return res.status(400).json({
        success: false,
        message: "targetUserId, skillOfferedId ve skillRequestedId zorunludur",
      });
    }

    // ADIM 2: Kendisine talep göndermeye çalışıyor mu kontrol et
    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "Kendinize eşleşme talebi gönderemezsiniz",
      });
    }

    // ADIM 3: Bu kullanıcılar arasında zaten bir eşleşme var mı kontrol et
    const existingMatch = await Match.findOne({
      $or: [
        { userA: userId, userB: targetUserId }, // A→B yönünde talep
        { userA: targetUserId, userB: userId }, // B→A yönünde talep
      ],
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        message: "Bu kullanıcıyla zaten bir eşleşme talebiniz var",
        existingMatch: {
          status: existingMatch.status,
          createdAt: existingMatch.createdAt,
        },
      });
    }

    // ADIM 4: Yeni Match kaydı oluştur
    const newMatch = new Match({
      userA: userId, // Talebi gönderen (ben)
      userB: targetUserId, // Talebi alan (hedef kullanıcı)
      skillOffered: skillOfferedId, // A'nın (benim) sunduğu skill
      skillRequested: skillRequestedId, // A'nın (benim) istediği skill
      status: "pending", // Başlangıç durumu: beklemede
    });

    await newMatch.save(); // Veritabanına kaydet

    // ADIM 5: Match'i ilgili verilerle populate et (detayları getir)
    await newMatch.populate("userA userB skillOffered skillRequested");

    res.status(201).json({
      success: true,
      message: "Eşleşme talebi başarıyla gönderildi",
      match: {
        id: newMatch._id,
        targetUser: newMatch.userB.username,
        yourOffer: newMatch.skillOffered.name,
        yourRequest: newMatch.skillRequested.name,
        status: newMatch.status,
        createdAt: newMatch.createdAt,
      },
    });
  } catch (error) {
    console.error("Create match error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// GET /api/matches - Kullanıcının tüm eşleşme taleplerini listele
// Amaç: Gönderilen ve alınan tüm eşleşme taleplerini görmek
// Giriş: JWT token
// Çıkış: { success, sent: [], received: [] }
// sent: Kullanıcının gönderdiği talepler (userA = userId)
// received: Kullanıcının aldığı talepler (userB = userId)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // ADIM 1: Kullanıcının gönderdiği talepleri bul (userA = userId)
    const sentMatches = await Match.find({ userA: userId })
      .populate("userB", "username bio location") // Hedef kullanıcı bilgileri
      .populate("skillOffered skillRequested") // Skill detayları
      .sort({ createdAt: -1 }); // Yeniden eskiye

    // ADIM 2: Kullanıcının aldığı talepleri bul (userB = userId)
    const receivedMatches = await Match.find({ userB: userId })
      .populate("userA", "username bio location") // Gönderen kullanıcı bilgileri
      .populate("skillOffered skillRequested") // Skill detayları
      .sort({ createdAt: -1 }); // Yeniden eskiye

    // ADIM 3: Response format'ını düzenle ve döndür
    res.status(200).json({
      success: true,
      sent: sentMatches.map((match) => ({
        // Gönderdiğim talepler
        id: match._id,
        targetUser: match.userB.username, // Kime gönderdiğim
        yourOffer: match.skillOffered.name, // Ben ne öğreteceğim
        yourRequest: match.skillRequested.name, // Ben ne öğrenmek istiyorum
        status: match.status, // pending/accepted/rejected
        createdAt: match.createdAt,
      })),
      received: receivedMatches.map((match) => ({
        // Aldığım talepler
        id: match._id,
        fromUser: match.userA.username, // Kim gönderdi
        theirOffer: match.skillOffered.name, // Onlar ne öğretecek
        theirRequest: match.skillRequested.name, // Onlar ne öğrenmek istiyor
        status: match.status, // pending/accepted/rejected
        createdAt: match.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// PUT /api/matches/:matchId - Eşleşme talebini onayla veya reddet
// Amaç: Gelen eşleşme talebini kabul etmek veya reddetmek
// Giriş: matchId (URL'de), { action } - action: "accept" veya "reject"
// Çıkış: { success, message, match }
// Yetki: Sadece talebi alan kullanıcı (userB) bu işlemi yapabilir
// İşlem Adımları:
// 1. Action validation (accept/reject)
// 2. Match'i bul ve yetki kontrol et
// 3. Status'u güncelle
router.put("/:matchId", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params; // URL'den match ID'si
    const { action } = req.body; // "accept" veya "reject"
    const userId = req.user.userId; // Mevcut kullanıcı ID'si

    // ADIM 1: Action parametresini validate et
    if (!action || (action !== "accept" && action !== "reject")) {
      return res.status(400).json({
        success: false,
        message: "action 'accept' veya 'reject' olmalıdır",
      });
    }

    // ADIM 2: Match'i bul ve populate et
    const match = await Match.findById(matchId).populate(
      "userA userB skillOffered skillRequested"
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Eşleşme talebi bulunamadı",
      });
    }

    // ADIM 3: Yetki kontrolü - Sadece talep alan kişi (userB) onaylayabilir/reddedebilir
    if (match.userB._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bu eşleşme talebini sadece alıcı onaylayabilir/reddedebilir",
      });
    }

    // ADIM 4: Talep zaten işlenmiş mi kontrol et
    if (match.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Bu talep zaten ${match.status} durumunda`,
      });
    }

    // ADIM 5: Status'u güncelle ve kaydet
    match.status = action === "accept" ? "accepted" : "rejected";
    await match.save();

    res.status(200).json({
      success: true,
      message: `Eşleşme talebi ${
        action === "accept" ? "onaylandı" : "reddedildi"
      }`,
      match: {
        id: match._id,
        fromUser: match.userA.username,
        status: match.status,
      },
    });
  } catch (error) {
    console.error("Update match error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

module.exports = router;
