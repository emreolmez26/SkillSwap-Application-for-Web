const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillOffered: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },  // A'nın öğreteceği skill
  skillRequested: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" }, // A'nın öğrenmek istediği skill
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }, // Durum
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Match", matchSchema);