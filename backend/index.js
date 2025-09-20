const express = require("express");
const app = express();
require("dotenv").config();

const mongoose = require("mongoose");

const cors = require("cors");

const homeRouter = require("./routes/home");
const authRouter = require("./routes/auth");
const skillsRouter = require("./routes/skills");
const matchesRouter = require("./routes/matches");
const usersRouter = require("./routes/users");
const conversationsRouter = require("./routes/conversations");

// Models'i import et (populate için gerekli)
require("./models/user");
require("./models/skill");
require("./models/match");
require("./models/message");
require("./models/conversation");

app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(express.json());

app.use("/api", homeRouter);
app.use("/api/auth", authRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/users", usersRouter);
app.use("/api/conversations", conversationsRouter);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
