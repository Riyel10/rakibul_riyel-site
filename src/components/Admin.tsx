import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Mail, MailOpen, LogOut, Loader2, ShieldCheck, Inbox } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("admin_token")
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Fetch messages when logged in
  useEffect(() => {
    if (token) fetchMessages();
  }, [token]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/messages`, {
        headers: authHeaders,
      });
      setMessages(res.data);
    } catch {
      setToken(null);
      localStorage.removeItem("admin_token");
    } finally {
      setLoading(false);
    }
  }

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

  async function markRead(id: string) {
    await axios.post(`${BACKEND_URL}/api/admin/messages/${id}/read`, {}, { headers: authHeaders });
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, read: true } : m))
    );
    if (selected?._id === id) setSelected({ ...selected, read: true });
  }

  async function deleteMessage(id: string) {
    await axios.delete(`${BACKEND_URL}/api/admin/messages/${id}`, { headers: authHeaders });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  function handleSelect(msg: Message) {
    setSelected(msg);
    if (!msg.read) markRead(msg._id);
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setMessages([]);
    setSelected(null);
  }

  const unread = messages.filter((m) => !m.read).length;

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
            {loginError && (
              <p className="text-red-400 text-sm text-center">{loginError}</p>
            )}
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — message list */}
        <aside className="w-80 border-r border-white/10 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Inbox size={16} /> {messages.length} messages
            </span>
            <button
              onClick={fetchMessages}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
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
                  onClick={() => handleSelect(msg)}
                  className={`px-4 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5 ${
                    selected?._id === msg._id ? "bg-indigo-600/20 border-l-2 border-l-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read ? (
                        <Mail size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <MailOpen size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                      )}
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

        {/* Main — message detail */}
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
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-indigo-400 hover:underline text-sm"
                  >
                    {selected.email}
                  </a>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteMessage(selected._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
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
      </div>
    </div>
  );
}
