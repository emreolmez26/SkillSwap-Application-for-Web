const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },   // Kullanıcı adı
  email: { type: String, required: true, unique: true },      // Mail
  password: { type: String, required: true },                 // Hashlenecek
  bio: { type: String },                                      // Kısa açıklama
  location: { type: String },                                 // Şehir/Bölge
  skillsToTeach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }], // Öğreteceği skill’ler
  skillsToLearn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }], // Öğrenmek istediği skill’ler
  createdAt: { type: Date, default: Date.now }                // Kayıt tarihi
});

module.exports = mongoose.model("User", userSchema);