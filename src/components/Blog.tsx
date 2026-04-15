import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverColor: string;
  createdAt: string;
  readTime: number;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/blog`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">Writing</h2>
          <h3 className="text-4xl font-bold">Latest Blog Posts</h3>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.a
                key={post._id}
                href={`/blog/${post._id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:neon-border transition-all overflow-hidden cursor-pointer"
              >
                {/* Cover */}
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ background: post.coverColor || "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
                >
                  <BookOpen size={40} className="text-white opacity-80" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime} min read
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
