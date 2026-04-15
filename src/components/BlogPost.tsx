import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, ArrowLeft, BookOpen } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

interface BlogPostType {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverColor: string;
  createdAt: string;
  readTime: number;
}

export default function BlogPost({ id }: { id: string }) {
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/blog/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <BookOpen size={48} className="text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <a href="/#blog" className="text-primary hover:underline flex items-center gap-1 mt-4">
          <ArrowLeft size={16} /> Back to blog
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Cover */}
      <div
        className="w-full h-64 md:h-80 flex items-center justify-center"
        style={{ background: post.coverColor || "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
      >
        <BookOpen size={64} className="text-white opacity-70" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <a href="/#blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </a>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {post.readTime} min read
          </span>
        </div>

        {/* Content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
