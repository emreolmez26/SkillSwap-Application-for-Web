const express = require("express");
const router = express.Router();

// GET /api/ - Ana sayfa endpoint'i
// Amaç: API'nin çalıştığını test etmek
// Giriş: Yok
// Çıkış: Hoş geldin mesajı
// Yetki: Herkese açık
router.get("/", (req, res) => {
  res.send("Welcome to the SkillSwap App!");
});

module.exports = router;
