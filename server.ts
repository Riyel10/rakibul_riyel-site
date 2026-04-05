import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Load env vars early
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("🚨 Missing environment variable: MONGO_URI");
  process.exit(1);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  EMAIL_USER or EMAIL_PASS is missing. Email sending may fail.");
}

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

// ✅ FIXED PORT (Render compatible)
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://rakibul-riyel-site.vercel.app",
    "http://localhost:5000"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// ================= API ROUTE =================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    res.json({ success: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// ================= GET MESSAGES ROUTE =================
app.get("/api/messages", async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// ================= PRODUCTION FRONTEND =================

// Serve frontend build
const distPath = path.join(process.cwd(), "dist");

app.use(express.static(distPath));

// Handle React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
