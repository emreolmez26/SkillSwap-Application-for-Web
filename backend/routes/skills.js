const express = require("express");
const jwt = require("jsonwebtoken"); // JWT token doğrulama için
const User = require("../models/user"); // User modeli
const Skill = require("../models/skill"); // Skill modeli
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "skillswap_secret_key";

// MIDDLEWARE: JWT Token doğrulama
// Amaç: Korumalı endpoint'lerde kullanıcı kimliğini doğrulamak
// Çalışma: Authorization header'dan token alır, doğrular, req.user'a bilgileri ekler
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token gerekli",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Sonraki middleware'lerde kullanılmak üzere
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz token",
    });
  }
};

// GET /api/skills - Tüm skill'leri listele
// Amaç: Sistemdeki tüm skill'leri alfabetik sırayla döndürmek
// Giriş: Yok
// Çıkış: { success, skills: [] }
// Yetki: Herkese açık (token gerektirmez)
// Kullanım: Dropdown'larda, arama sayfalarında skill listesi için
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      skills: skills,
    });
  } catch (error) {
    console.error("Skills list error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// GET /api/skills/categories - Skill kategorilerini listele
// Amaç: Sistemdeki benzersiz skill kategorilerini döndürmek
// Giriş: Yok
// Çıkış: { success, categories: [] }
// Yetki: Herkese açık
// Kullanım: Kategori filtreleme için
router.get("/categories", async (req, res) => {
  try {
    const categories = await Skill.distinct("category");

    res.status(200).json({
      success: true,
      categories: categories.filter((cat) => cat), // null değerleri filtrele
    });
  } catch (error) {
    console.error("Categories list error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// POST /api/skills - Yeni skill oluştur
// Amaç: Sisteme yeni bir yetenek eklemek
// Giriş: { name, category? }
// Çıkış: { success, message, skill }
// Yetki: JWT token gerekli
// İşlem Adımları:
// 1. Skill adı validation
// 2. Aynı isimde skill var mı kontrol
// 3. Yeni skill oluştur ve kaydet
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, category } = req.body;

    // ADIM 1: Skill adı validation kontrolü
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill adı zorunludur",
      });
    }

    // ADIM 2: Aynı isimde skill var mı kontrol et (büyük/küçük harf duyarsız)
    const existingSkill = await Skill.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") }, // Case-insensitive arama
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Bu skill zaten mevcut",
        existingSkill: existingSkill,
      });
    }

    // ADIM 3: Yeni skill objesi oluştur ve veritabanına kaydet
    const newSkill = new Skill({
      name: name.trim(), // Boşlukları temizle
      category: category ? category.trim() : "Diğer", // Kategori yoksa "Diğer" ata
    });

    await newSkill.save(); // MongoDB'ye kaydet

    res.status(201).json({
      success: true,
      message: "Skill başarıyla oluşturuldu",
      skill: newSkill,
    });
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// POST /api/skills/add-to-user - Kullanıcıya skill ekle
// Amaç: Giriş yapmış kullanıcının "öğretebileceği" veya "öğrenmek istediği" skill listesine ekleme
// Giriş: { skillId, type } - type: "teach" veya "learn"
// Çıkış: { success, message, user: { skillsToTeach, skillsToLearn } }
// Yetki: JWT token gerekli
// İşlem Adımları:
// 1. skillId ve type validation
// 2. Skill var mı kontrol
// 3. Kullanıcıyı bul
// 4. Skill zaten ekli mi kontrol
// 5. Type'a göre doğru listeye ekle
router.post("/add-to-user", authenticateToken, async (req, res) => {
  try {
    const { skillId, type } = req.body; // type: "teach" veya "learn"
    const userId = req.user.userId; // JWT token'dan gelen kullanıcı ID'si

    // ADIM 1: Giriş parametrelerini validate et
    if (!skillId || !type) {
      return res.status(400).json({
        success: false,
        message: "skillId ve type (teach/learn) zorunludur",
      });
    }

    if (type !== "teach" && type !== "learn") {
      return res.status(400).json({
        success: false,
        message: "type 'teach' veya 'learn' olmalıdır",
      });
    }

    // ADIM 2: Skill'in varlığını kontrol et
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill bulunamadı",
      });
    }

    // ADIM 3: Kullanıcıyı veritabanından bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // ADIM 4: Skill zaten ekli mi kontrol et (duplicate prevention)
    const targetArray =
      type === "teach" ? user.skillsToTeach : user.skillsToLearn;
    const isAlreadyAdded = targetArray.some((id) => id.toString() === skillId);

    if (isAlreadyAdded) {
      return res.status(400).json({
        success: false,
        message: `Bu skill zaten ${
          type === "teach" ? "öğretebileceğiniz" : "öğrenmek istediğiniz"
        } listesinde`,
      });
    }

    // ADIM 5: Type'a göre skill'i uygun listeye ekle
    if (type === "teach") {
      user.skillsToTeach.push(skillId); // Öğretebildiği skill'ler listesine ekle
    } else {
      user.skillsToLearn.push(skillId); // Öğrenmek istediği skill'ler listesine ekle
    }

    await user.save(); // Değişiklikleri veritabanına kaydet

    // ADIM 6: Güncellenmiş kullanıcıyı skill detaylarıyla birlikte getir
    await user.populate("skillsToTeach skillsToLearn");

    res.status(200).json({
      success: true,
      message: `Skill başarıyla ${
        type === "teach" ? "öğretebileceğiniz" : "öğrenmek istediğiniz"
      } listeye eklendi`,
      user: {
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
      },
    });
  } catch (error) {
    console.error("Add skill to user error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// DELETE /api/skills/remove-from-user - Kullanıcıdan skill çıkar
// Amaç: Kullanıcının skill listesinden belirli bir skill'i kaldırmak
// Giriş: { skillId, type } - type: "teach" veya "learn"
// Çıkış: { success, message, user: { skillsToTeach, skillsToLearn } }
// Yetki: JWT token gerekli
// İşlem Adımları:
// 1. skillId ve type validation
// 2. Kullanıcıyı bul
// 3. Type'a göre skill'i doğru listeden kaldır
router.delete("/remove-from-user", authenticateToken, async (req, res) => {
  try {
    const { skillId, type } = req.body; // type: "teach" veya "learn"
    const userId = req.user.userId; // JWT token'dan gelen kullanıcı ID'si

    // ADIM 1: Giriş parametrelerini validate et
    if (!skillId || !type) {
      return res.status(400).json({
        success: false,
        message: "skillId ve type (teach/learn) zorunludur",
      });
    }

    // ADIM 2: Kullanıcıyı veritabanından bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // ADIM 3: Type'a göre skill'i uygun listeden kaldır (filter kullanarak)
    if (type === "teach") {
      user.skillsToTeach = user.skillsToTeach.filter(
        (id) => id.toString() !== skillId
      );
    } else if (type === "learn") {
      user.skillsToLearn = user.skillsToLearn.filter(
        (id) => id.toString() !== skillId
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "type 'teach' veya 'learn' olmalıdır",
      });
    }

    await user.save(); // Değişiklikleri veritabanına kaydet

    // ADIM 4: Güncellenmiş kullanıcıyı skill detaylarıyla birlikte getir
    await user.populate("skillsToTeach skillsToLearn");

    res.status(200).json({
      success: true,
      message: `Skill başarıyla ${
        type === "teach" ? "öğretebileceğiniz" : "öğrenmek istediğiniz"
      } listeden kaldırıldı`,
      user: {
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
      },
    });
  } catch (error) {
    console.error("Remove skill from user error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

module.exports = router;
