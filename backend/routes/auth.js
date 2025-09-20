const express = require("express");
const bcrypt = require("bcryptjs"); // Şifre hashleme için
const jwt = require("jsonwebtoken"); // JWT token oluşturma için
const User = require("../models/user"); // User modeli
const router = express.Router();

// JWT Secret anahtarı (normalde .env'de olmalı)
const JWT_SECRET = process.env.JWT_SECRET || "skillswap_secret_key";

// POST /api/auth/register - Yeni kullanıcı kaydı
// Amaç: Sisteme yeni kullanıcı kaydetmek
// Giriş: { username, email, password, bio?, location? }
// Çıkış: { success, message, token, user }
// İşlem Adımları:
// 1. Gelen verileri validate et
// 2. Kullanıcı zaten var mı kontrol et
// 3. Password'ü hashle
// 4. Yeni kullanıcı oluştur
// 5. JWT token oluştur ve döndür
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, bio, location } = req.body;

    // ADIM 1: Temel validation kontrolü
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email ve password zorunludur",
      });
    }

    // ADIM 2: Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir email adresi giriniz",
      });
    }

    // ADIM 3: Password uzunluk kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password en az 6 karakter olmalı",
      });
    }

    // ADIM 4: Kullanıcı zaten var mı kontrol et (email veya username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu email veya username zaten kullanılıyor",
      });
    }

    // ADIM 5: Password'ü güvenli şekilde hashle (bcrypt ile)
    const saltRounds = 10; // Hash güçlülük seviyesi
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ADIM 6: Yeni kullanıcı objesi oluştur ve veritabanına kaydet
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Hashlenmiş password
      bio: bio || "", // Opsiyonel alan
      location: location || "", // Opsiyonel alan
    });

    await newUser.save(); // MongoDB'ye kaydet

    // ADIM 7: Kullanıcı için JWT token oluştur (7 gün geçerli)
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username }, // Token içeriği
      JWT_SECRET, // Gizli anahtar
      { expiresIn: "7d" } // Geçerlilik süresi
    );

    res.status(201).json({
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        location: newUser.location,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// POST /api/auth/login - Kullanıcı girişi
// Amaç: Mevcut kullanıcıyı sisteme giriş yaptırmak
// Giriş: { email, password }
// Çıkış: { success, message, token, user }
// İşlem Adımları:
// 1. Email ve password'ü validate et
// 2. Email ile kullanıcıyı bul
// 3. Password'ü kontrol et
// 4. JWT token oluştur ve döndür
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ADIM 1: Temel validation kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve password zorunludur",
      });
    }

    // ADIM 2: Email ile kullanıcıyı veritabanında bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya password",
      });
    }

    // ADIM 3: Girilen password ile hashlenmiş password'ü karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya password",
      });
    }

    // ADIM 4: Başarılı giriş - JWT token oluştur
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// GET /api/auth/me - Mevcut kullanıcı bilgilerini getir
// Amaç: JWT token ile giriş yapmış kullanıcının profil bilgilerini döndürmek
// Giriş: Authorization header'ında Bearer token
// Çıkış: { success, user }
// İşlem Adımları:
// 1. Authorization header'dan token'ı çıkar
// 2. Token'ı doğrula
// 3. Kullanıcıyı bul ve skill'leriyle birlikte döndür
router.get("/me", async (req, res) => {
  try {
    // ADIM 1: Authorization header kontrolü ve token çıkarma
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token gerekli",
      });
    }

    const token = authHeader.substring(7); // "Bearer " kısmını çıkar (7 karakter)

    // ADIM 2: Token'ı doğrula ve içindeki bilgileri çıkar
    const decoded = jwt.verify(token, JWT_SECRET);

    // ADIM 3: Token'dan gelen userId ile kullanıcıyı bul
    // populate() ile skill'leri de birlikte getir
    const user = await User.findById(decoded.userId)
      .populate("skillsToTeach", "name category") // Öğreteceği skill'ler
      .populate("skillsToLearn", "name category"); // Öğrenmek istediği skill'ler

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }
    console.error("Me endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

module.exports = router;
