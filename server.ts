import express from "express";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Load env vars early
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("🚨 Missing environment variable: MONGO_URI");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is missing. Email sending may fail.");
}

if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️  ADMIN_PASSWORD is missing. Admin dashboard will not be protected.");
}

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://rakibul-riyel-site.vercel.app",
    "http://localhost:5000"
  ],
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

// ================= MONGOOSE SCHEMA =================
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// ================= RESEND SETUP =================
const resend = new Resend(process.env.re_PeBaSdfv_MRZh3WasD17G3UCugf2R8iUW);

// ================= ADMIN AUTH MIDDLEWARE =================
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

// ================= CONTACT ROUTE =================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Save to MongoDB
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Send email WITHOUT awaiting — fire and forget
    console.log("Attempting to send email to:", process.env.EMAIL_USER);
    console.log("Resend API key exists:", !!process.env.RESEND_API_KEY);
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.EMAIL_USER as string,
      subject: `📬 New message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    }).catch(err => console.error("Email failed:", err)); // ← no await, just log error

    // Return success immediately after saving — don't wait for email
    return res.json({ success: "Message sent successfully!" });

  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "Failed to save message" });
  }
});

// ================= ADMIN ROUTES (protected) =================

// Get all messages
app.get("/api/admin/messages", adminAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Mark message as read
app.post("/api/admin/messages/:id/read", adminAuth, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete a message
app.delete("/api/admin/messages/:id", adminAuth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Admin login (just validates password)
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// ================= PRODUCTION FRONTEND =================
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
