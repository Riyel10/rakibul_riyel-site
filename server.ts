import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// ✅ FIXED PORT (Render compatible)
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ================= API ROUTE =================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "rakibulriyel1171@gmail.com",
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
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
