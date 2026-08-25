'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  CornerDownRight,
  Send,
  User,
  Lock,
  Calendar,
  Search,
  UploadCloud,
  X,
  Clock,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Reply {
  id: string;
  commentId: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface Comment {
  id: string;
  diseaseId: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: string;
  replies: Reply[];
}

interface Disease {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  expiresAt: string;
  comments: Comment[];
}

export default function Home() {
  // User Session State (Name-Only Login)
  const [user, setUser] = useState<{ id: string; name: string; token: string } | null>(null);
  const [inputName, setInputName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Disease Feed State
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Submission Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<{ file: File; preview: string; isVideo: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active Comment & Reply States
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check stored user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('health_hub_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    } else {
      setShowLoginModal(true);
    }
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disease');
      const data = await res.json();
      if (data.success && data.diseases) {
        setDiseases(data.diseases);
      }
    } catch (err) {
      console.error('Error fetching diseases feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('health_hub_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        setInputName('');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Authentication server error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('health_hub_user');
    setUser(null);
    setShowLoginModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    const newMedia = selected.map((file) => {
      const isVideo = file.type.startsWith('video/');
      const preview = URL.createObjectURL(file);
      return { file, preview, isVideo };
    });

    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert('Please enter a title/disease name and symptoms description.');
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      // 1. Upload files first if present
      const uploadedUrls: string[] = [];
      for (const item of mediaFiles) {
        const formData = new FormData();
        formData.append('file', item.file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.mediaUrl) {
          uploadedUrls.push(uploadData.mediaUrl);
        }
      }

      setUploading(false);

      // 2. Submit disease report with 2-year retention timestamp
      const postRes = await fetch('/api/disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          mediaUrls: uploadedUrls,
          userId: user.id,
          authorName: user.name,
        }),
      });

      const postData = await postRes.json();
      if (postData.success) {
        setTitle('');
        setDescription('');
        setMediaFiles([]);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
        fetchDiseases();
      } else {
        alert(postData.error || 'Failed to submit entry');
      }
    } catch (err) {
      alert('An error occurred while submitting report.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleAddComment = async (diseaseId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const text = commentInputs[diseaseId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseId,
          userId: user.id,
          authorName: user.name,
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentInputs((prev) => ({ ...prev, [diseaseId]: '' }));
        fetchDiseases();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          userId: user.id,
          authorName: user.name,
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
        setActiveReplyId(null);
        fetchDiseases();
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const filteredDiseases = diseases.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-emerald-700 text-white shadow-md border-b border-emerald-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl text-emerald-700 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Community Health Awareness Hub</h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-200" />
                <span>Zero Email Required • Anonymous & Secure Health Portal</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-emerald-800/80 border border-emerald-600/50 px-3 py-1.5 rounded-full text-sm">
                <User className="w-4 h-4 text-emerald-200" />
                <span className="font-medium text-emerald-50">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-xs text-emerald-200 hover:text-white underline decoration-emerald-400"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                Join / Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submission Form & Health Badges */}
        <section className="lg:col-span-5 space-y-6">
          {/* Privacy & Retention Guarantee Banner */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <Database className="w-5 h-5 text-emerald-600" />
              <h2>Data Retention & Security Policy</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All health reports, symptoms, and uploaded media are permanently retained for a minimum of <strong>2 years</strong> with automated daily replication.
            </p>
            <div className="flex items-center gap-4 text-xs text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2-Year Retention
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Email Tracking
              </span>
            </div>
          </div>

          {/* Disease Submission Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Report Disease or Symptoms
            </h2>

            {submitSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Disease entry published successfully and stored securely for 2 years!</span>
              </div>
            )}

            <form onSubmit={handleSubmitDisease} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Disease Name / Main Symptoms *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dengue Fever, Viral Rash, Respiratory Distress"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Symptoms & Observations *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe onset, temperature, pain locations, duration, and any observed symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              {/* Upload Images/Videos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attach Images or Videos (Optional)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600 font-medium">
                    Click to upload photos or videos
                  </p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, MP4, WebM (Max 50MB)</p>
                </div>

                {/* Media Preview Thumbnails */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {mediaFiles.map((item, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                        {item.isVideo ? (
                          <video src={item.preview} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Publishing Entry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Health Awareness Report</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Disease Awareness Feed */}
        <section className="lg:col-span-7 space-y-6">
          {/* Feed Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Public Awareness Feed
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symptoms or diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading community health reports...</p>
            </div>
          ) : filteredDiseases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No disease entries found matching search.</p>
              <p className="text-xs text-slate-400">Be the first to share a health awareness report above.</p>
            </div>
          ) : (
            filteredDiseases.map((disease) => {
              const formattedDate = new Date(disease.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const expiryDate = new Date(disease.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <article key={disease.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 hover:border-slate-300 transition-colors">
                  {/* Article Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{disease.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          {disease.authorName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>Expires: {expiryDate}</span>
                    </div>
                  </div>

                  {/* Description / Symptoms */}
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {disease.description}
                  </p>

                  {/* Media Gallery */}
                  {disease.mediaUrls && disease.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {disease.mediaUrls.map((url, i) => {
                        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
                        return (
                          <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                            {isVideo ? (
                              <video src={url} controls className="w-full h-full object-contain" />
                            ) : (
                              <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Comment & Threaded Reply System */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        Comments ({disease.comments?.length || 0})
                      </span>
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={user ? "Write a comment..." : "Sign in to comment"}
                        value={commentInputs[disease.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [disease.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(disease.id)}
                        disabled={!user}
                        className="flex-grow px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(disease.id)}
                        disabled={!user || !commentInputs[disease.id]?.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Comment
                      </button>
                    </div>

                    {/* Comment List & Nested Replies */}
                    <div className="space-y-3 pt-2">
                      {disease.comments?.map((comment) => {
                        const isOriginalUploader = comment.userId === disease.authorId;

                        return (
                          <div key={comment.id} className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{comment.authorName}</span>
                                {isOriginalUploader && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Original Uploader
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-slate-700 leading-normal">{comment.text}</p>

                            {/* Reply Action */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() =>
                                  setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                                }
                                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                              >
                                <CornerDownRight className="w-3 h-3" /> Reply
                              </button>
                            </div>

                            {/* Active Reply Input Box */}
                            {activeReplyId === comment.id && (
                              <div className="flex items-center gap-2 pl-4 pt-2 border-l-2 border-emerald-300">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyInputs[comment.id] || ''}
                                  onChange={(e) =>
                                    setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                                  className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button
                                  onClick={() => handleAddReply(comment.id)}
                                  className="bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Nested Replies Rendering */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="pl-4 pt-2 border-l-2 border-slate-200 space-y-2">
                                {comment.replies.map((reply) => {
                                  const isReplyUploader = reply.userId === disease.authorId;

                                  return (
                                    <div key={reply.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-slate-800">{reply.authorName}</span>
                                          {isReplyUploader && (
                                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                              Uploader Reply
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                          {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 leading-normal">{reply.text}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* Name-Only Privacy Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Welcome to Health Hub</h2>
              <p className="text-xs text-slate-500">
                To protect user security & privacy, <strong>no email or password</strong> is required. Simply enter your Name or preferred Alias.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Display Name / Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe or Health Observer"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Continue & Share Health Reports</span>
              </button>
            </form>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Privacy Protected
              </div>
              <p>Your session will store reports securely with automated backup and 2-year retention.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
