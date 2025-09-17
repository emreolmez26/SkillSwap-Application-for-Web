const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Skill adı (örn: "JavaScript", "Gitar")
  category: { type: String },                          // (örn: "Yazılım", "Müzik")
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Skill", skillSchema);