import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Trash2, Mail, MailOpen, LogOut, Loader2, ShieldCheck,
  Inbox, FolderGit2, FileText, Plus, ExternalLink, Github,
  Upload, CheckCircle2, X
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  html_url: string;
  live_url: string;
  language: string;
}

type Tab = "messages" | "projects" | "resume";

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("messages");

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", html_url: "", live_url: "", language: "" });
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState("");

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [currentResume, setCurrentResume] = useState<{ filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) {
      fetchMessages();
      fetchProjects();
      fetchCurrentResume();
    }
  }, [token]);

  // Auto logout when user leaves the page
useEffect(() => {
  if (!token) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      handleLogout();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [token]);

  // ===== AUTH =====
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, { password });
      localStorage.setItem("admin_token", res.data.token);
      setToken(res.data.token);
    } catch {
      setLoginError("Invalid password. Try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setMessages([]);
    setProjects([]);
    setSelected(null);
  }

  // ===== MESSAGES =====
  async function fetchMessages() {
    setMessagesLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/messages`, { headers: authHeaders });
      setMessages(res.data);
    } catch {
      setToken(null);
      localStorage.removeItem("admin_token");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function markRead(id: string) {
    await axios.post(`${BACKEND_URL}/api/admin/messages/${id}/read`, {}, { headers: authHeaders });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    if (selected?._id === id) setSelected({ ...selected, read: true });
  }

  async function deleteMessage(id: string) {
    await axios.delete(`${BACKEND_URL}/api/admin/messages/${id}`, { headers: authHeaders });
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  function handleSelectMessage(msg: Message) {
    setSelected(msg);
    if (!msg.read) markRead(msg._id);
  }

  // ===== PROJECTS =====
  async function fetchProjects() {
    setProjectsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/projects`);
      setProjects(res.data);
    } finally {
      setProjectsLoading(false);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setProjectSaving(true);
    setProjectError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/projects`, projectForm, { headers: authHeaders });
      setProjects(prev => [res.data, ...prev]);
      setProjectForm({ name: "", description: "", html_url: "", live_url: "", language: "" });
      setShowProjectForm(false);
    } catch (err: any) {
      setProjectError(err.response?.data?.error || "Failed to add project");
    } finally {
      setProjectSaving(false);
    }
  }

  async function deleteProject(id: string) {
    await axios.delete(`${BACKEND_URL}/api/admin/projects/${id}`, { headers: authHeaders });
    setProjects(prev => prev.filter(p => p._id !== id));
  }

  // ===== RESUME =====
  async function fetchCurrentResume() {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/resume`);
      setCurrentResume({ filename: res.data.filename });
    } catch {
      setCurrentResume(null);
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;
    setResumeUploading(true);
    setResumeError("");
    setResumeSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await axios.post(`${BACKEND_URL}/api/admin/resume`, {
          data: base64,
          filename: resumeFile.name
        }, { headers: authHeaders });
        setResumeSuccess(true);
        setCurrentResume({ filename: resumeFile.name });
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setResumeUploading(false);
      };
      reader.readAsDataURL(resumeFile);
    } catch (err: any) {
      setResumeError(err.response?.data?.error || "Failed to upload resume");
      setResumeUploading(false);
    }
  }

  const unread = messages.filter(m => !m.read).length;

  // ===================== LOGIN PAGE =====================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">Portfolio Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-indigo-400" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-bold">
              {unread} new
            </span>
          )}
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6">
        {([
          { id: "messages", label: "Messages", icon: Inbox },
          { id: "projects", label: "Projects", icon: FolderGit2 },
          { id: "resume", label: "Resume", icon: FileText },
        ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={16} /> {label}
            {id === "messages" && unread > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{unread}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex">

        {/* ===== MESSAGES TAB ===== */}
        {activeTab === "messages" && (
          <>
            <aside className="w-80 border-r border-white/10 overflow-y-auto flex-shrink-0">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm text-slate-400 font-medium">{messages.length} messages</span>
                <button onClick={fetchMessages} className="text-xs text-indigo-400 hover:text-indigo-300">Refresh</button>
              </div>
              {messagesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-indigo-400" size={28} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Inbox size={40} className="mx-auto mb-3 opacity-40" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <ul>
                  {messages.map((msg) => (
                    <li
                      key={msg._id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`px-4 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5 ${
                        selected?._id === msg._id ? "bg-indigo-600/20 border-l-2 border-l-indigo-500" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {!msg.read
                            ? <Mail size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                            : <MailOpen size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />}
                          <span className={`truncate text-sm ${!msg.read ? "font-bold text-white" : "text-slate-400"}`}>
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1 ml-5">{msg.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
              {!selected ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MailOpen size={56} className="mb-4 opacity-30" />
                  <p className="text-lg">Select a message to read</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selected.name}</h2>
                      <a href={`mailto:${selected.email}`} className="text-indigo-400 hover:underline text-sm">{selected.email}</a>
                      <p className="text-slate-500 text-xs mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => deleteMessage(selected._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your message&body=Hi ${selected.name},%0A%0A`}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Mail size={16} /> Reply via Email
                  </a>
                </div>
              )}
            </main>
          </>
        )}

        {/* ===== PROJECTS TAB ===== */}
        {activeTab === "projects" && (
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Custom Projects</h2>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {showProjectForm ? <X size={16} /> : <Plus size={16} />}
                  {showProjectForm ? "Cancel" : "Add Project"}
                </button>
              </div>

              {/* Add Project Form */}
              {showProjectForm && (
                <form onSubmit={handleAddProject} className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <h3 className="font-semibold text-lg">New Project</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Project Name *</label>
                      <input
                        required
                        value={projectForm.name}
                        onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                        placeholder="My Awesome Project"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={projectForm.description}
                        onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                        placeholder="What does this project do?"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">GitHub URL</label>
                      <input
                        value={projectForm.html_url}
                        onChange={e => setProjectForm({ ...projectForm, html_url: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Live URL</label>
                      <input
                        value={projectForm.live_url}
                        onChange={e => setProjectForm({ ...projectForm, live_url: e.target.value })}
                        placeholder="https://myproject.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Language / Stack</label>
                      <input
                        value={projectForm.language}
                        onChange={e => setProjectForm({ ...projectForm, language: e.target.value })}
                        placeholder="React, Node.js..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  {projectError && <p className="text-red-400 text-sm">{projectError}</p>}
                  <button
                    type="submit"
                    disabled={projectSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {projectSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Add Project
                  </button>
                </form>
              )}

              {/* Project List */}
              {projectsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-indigo-400" size={28} />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <FolderGit2 size={40} className="mx-auto mb-3 opacity-40" />
                  <p>No custom projects yet. Add your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project._id} className="flex items-start justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.name}</h3>
                          {project.language && (
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-slate-400">{project.language}</span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          {project.html_url && (
                            <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                              <Github size={12} /> GitHub
                            </a>
                          )}
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                              <ExternalLink size={12} /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="ml-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ===== RESUME TAB ===== */}
        {activeTab === "resume" && (
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-lg">
              <h2 className="text-xl font-bold mb-6">Update Resume</h2>

              {/* Current resume */}
              {currentResume && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Current resume</p>
                    <p className="text-xs text-slate-400">{currentResume.filename}</p>
                  </div>
                </div>
              )}

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-indigo-500/50 rounded-2xl p-10 text-center cursor-pointer transition-colors group"
              >
                <Upload size={36} className="mx-auto mb-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <p className="text-slate-300 font-medium">Click to select PDF</p>
                <p className="text-slate-500 text-sm mt-1">Only PDF files accepted</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => {
                    setResumeFile(e.target.files?.[0] || null);
                    setResumeSuccess(false);
                    setResumeError("");
                  }}
                />
              </div>

              {resumeFile && (
                <div className="mt-4 flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-slate-400">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setResumeFile(null)} className="text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              )}

              {resumeError && <p className="mt-3 text-red-400 text-sm">{resumeError}</p>}
              {resumeSuccess && (
                <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 size={16} /> Resume updated successfully!
                </div>
              )}

              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || resumeUploading}
                className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resumeUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {resumeUploading ? "Uploading..." : "Upload Resume"}
              </button>

              <p className="text-slate-500 text-xs mt-4 text-center">
                Uploading a new resume will replace the current one on your portfolio instantly — no redeployment needed.
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
