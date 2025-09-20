const User = require("../models/user"); // User modeli
const express = require("express");
const router = express.Router();

// GET /api/users - Tüm kullanıcıları getir
router.get("/", async (req, res) => {
  try {
    const { excludeUserId } = req.query; // Giriş yapan kullanıcının ID'si

    let query = {};
    if (excludeUserId) {
      query._id = { $ne: excludeUserId }; // Bu ID'yi hariç tut
    }

    const users = await User.find(query)
      .select("-password") // Şifreyi response'a dahil etme
      .populate("skillsToTeach", "name") // Skill name'lerini getir
      .populate("skillsToLearn", "name"); // Skill name'lerini getir
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/users/:id - Tekil kullanıcıyı getir
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password") // Şifreyi response'a dahil etme
      .populate("skillsToTeach", "name") // Skill name'lerini getir
      .populate("skillsToLearn", "name"); // Skill name'lerini getir

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
