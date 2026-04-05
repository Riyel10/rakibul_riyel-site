import React, { useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Send, Mail, MapPin, Phone, Loader2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "";
      const response = await axios.post(`${BACKEND_URL}/api/contact`, formData);

      if (response.status === 200 || response.status === 201) {
        setStatus("success");
        setResponseMsg(response.data.success);
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setResponseMsg(response.data.error || "Something went wrong.");
      }
    } catch (err: any) {
      setStatus("error");
      setResponseMsg(err.response?.data?.error || "Failed to connect to the server.");
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">Get In Touch</h2>
          <h3 className="text-4xl font-bold">Contact Me</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h4 className="text-2xl font-bold mb-6">Let's discuss your project</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-60">Email</p>
                  <p className="font-bold">rakibulriyel1171@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-full bg-secondary/10 text-secondary">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-60">Location</p>
                  <p className="font-bold">Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-full bg-accent/10 text-accent">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-60">Phone</p>
                  <p className="font-bold">+880 1639851559</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl glass"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="How can I help you?"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Send size={20} /> Send Message
                  </>
                )}
              </button>

              {status === "success" && (
                <p className="text-green-500 text-center font-medium">{responseMsg}</p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-center font-medium">{responseMsg}</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}