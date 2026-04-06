import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { Resend } from "resend";

// Load env vars early
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("🚨 Missing environment variable: MONGO_URI");
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️  ADMIN_PASSWORD is missing.");
}

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Increase limit for base64 PDF uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({
  origin: [
    "https://rakibul-riyel-site.vercel.app",
    "http://localhost:5000"
  ],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= SCHEMAS =================
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  html_url: String,
  live_url: String,
  language: String,
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model("Project", projectSchema);

const resumeSchema = new mongoose.Schema({
  data: String, // base64 encoded PDF
  filename: String,
  updatedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model("Resume", resumeSchema);

// ================= ADMIN AUTH MIDDLEWARE =================
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
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
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    if (process.env.RESEND_API_KEY) {
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
      }).then(data => console.log("Email sent:", JSON.stringify(data)))
        .catch(err => console.error("Email failed:", JSON.stringify(err)));
    }

    return res.json({ success: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "Failed to save message" });
  }
});

// ================= ADMIN LOGIN =================
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// ================= ADMIN: MESSAGES =================
app.get("/api/admin/messages", adminAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/admin/messages/:id/read", adminAuth, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update message" });
  }
});

app.delete("/api/admin/messages/:id", adminAuth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ================= PROJECTS (public) =================
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ================= ADMIN: PROJECTS =================
app.post("/api/admin/projects", adminAuth, async (req, res) => {
  try {
    const { name, description, html_url, live_url, language } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required." });
    const project = new Project({ name, description, html_url, live_url, language });
    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.delete("/api/admin/projects/:id", adminAuth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ================= RESUME (public) =================
app.get("/api/resume", async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ updatedAt: -1 });
    if (!resume) return res.status(404).json({ error: "No resume uploaded" });
    res.json({ data: resume.data, filename: resume.filename });
  } catch {
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// ================= ADMIN: RESUME =================
app.post("/api/admin/resume", adminAuth, async (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data) return res.status(400).json({ error: "No file data provided." });
    await Resume.deleteMany({});
    const resume = new Resume({ data, filename });
    await resume.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to upload resume" });
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
