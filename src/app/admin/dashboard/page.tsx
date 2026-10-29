'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };
type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  youtube_url: string | null;
  category_name: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  const [form, setForm] = useState({
    title: '',
    prompt_text: '',
    youtube_url: '',
    category_id: '',
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/admin/login');
    });
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    if (cats) setCategories(cats);

    const { data: promptData } = await supabase
      .from('prompts_with_category')
      .select('*')
      .order('created_at', { ascending: false });

    if (promptData) setPrompts(promptData as Prompt[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.prompt_text.trim()) {
      showToast('error', 'Title and Prompt Text are required.');
      return;
    }

    setFormLoading(true);
    const { error } = await supabase.from('prompts').insert({
      title: form.title.trim(),
      prompt_text: form.prompt_text.trim(),
      youtube_url: form.youtube_url.trim() || null,
      category_id: form.category_id || null,
    });

    if (error) {
      showToast('error', 'Failed to upload prompt. Please try again.');
    } else {
      showToast('success', 'Prompt uploaded successfully!');
      setForm({ title: '', prompt_text: '', youtube_url: '', category_id: '' });
      fetchData();
      setActiveTab('manage');
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) {
      showToast('error', 'Failed to delete prompt.');
    } else {
      showToast('success', 'Prompt deleted.');
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={`${styles.headerInner} container`}>
          <div className={styles.headerBrand}>
            <span className={styles.headerIcon}>◈</span>
            <div>
              <h1 className={styles.headerTitle}>Admin Dashboard</h1>
              <p className={styles.headerSub}>Tech Base LK — Prompt Management</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <a href="/prompts" target="_blank" className={styles.viewSiteBtn} id="admin-view-site">
              View Site ↗
            </a>
            <button onClick={handleLogout} className={styles.logoutBtn} id="admin-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles.content} container`}>
        {/* Stats Bar */}
        <div className={styles.statsBar}>
          {[
            { icon: '📝', label: 'Total Prompts', value: prompts.length },
            { icon: '📁', label: 'Categories', value: categories.length },
            { icon: '🆕', label: 'Added Today', value: prompts.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length },
          ].map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            id="admin-tab-upload"
            className={`${styles.tab} ${activeTab === 'upload' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            ＋ Upload Prompt
          </button>
          <button
            id="admin-tab-manage"
            className={`${styles.tab} ${activeTab === 'manage' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Prompts ({prompts.length})
          </button>
        </div>

        {/* ===== UPLOAD FORM ===== */}
        {activeTab === 'upload' && (
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.uploadForm} id="admin-upload-form">
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="upload-title">Prompt Title *</label>
                  <input
                    id="upload-title"
                    type="text"
                    placeholder="e.g. Viral AI Video Script Generator"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="upload-category">Category</label>
                  <select
                    id="upload-category"
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="upload-prompt">Prompt Text *</label>
                <textarea
                  id="upload-prompt"
                  rows={8}
                  placeholder="Enter the full master prompt here..."
                  value={form.prompt_text}
                  onChange={e => setForm({ ...form, prompt_text: e.target.value })}
                  required
                />
                <span className={styles.charCount}>{form.prompt_text.length} characters</span>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="upload-youtube">YouTube Video URL (optional)</label>
                <input
                  id="upload-youtube"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtube_url}
                  onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                />
                <span className={styles.fieldHint}>Link to the tutorial video for this prompt</span>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setForm({ title: '', prompt_text: '', youtube_url: '', category_id: '' })}
                  className={styles.clearBtn}
                  id="admin-clear-form"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  id="admin-submit-prompt"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className={styles.btnSpinner}></span>
                  ) : (
                    '⬆ Upload Prompt'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== MANAGE PROMPTS ===== */}
        {activeTab === 'manage' && (
          <div className={styles.manageSection}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <span>Loading prompts...</span>
              </div>
            ) : prompts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>◈</div>
                <h3>No prompts yet</h3>
                <p>Upload your first prompt using the Upload tab</p>
              </div>
            ) : (
              <div className={styles.promptsList}>
                {prompts.map((prompt) => (
                  <div key={prompt.id} className={styles.promptRow} id={`admin-prompt-${prompt.id}`}>
                    <div className={styles.promptRowInfo}>
                      <div className={styles.promptRowMeta}>
                        {prompt.category_name && (
                          <span className={styles.promptRowCategory}>{prompt.category_name}</span>
                        )}
                        <span className={styles.promptRowDate} suppressHydrationWarning>{formatDate(prompt.created_at)}</span>
                      </div>
                      <h3 className={styles.promptRowTitle}>{prompt.title}</h3>
                      <p className={styles.promptRowPreview}>
                        {prompt.prompt_text.slice(0, 120)}{prompt.prompt_text.length > 120 ? '...' : ''}
                      </p>
                      {prompt.youtube_url && (
                        <a href={prompt.youtube_url} target="_blank" rel="noopener noreferrer" className={styles.promptRowYT}>
                          ▶ Preview Video
                        </a>
                      )}
                    </div>
                    <div className={styles.promptRowActions}>
                      {deleteConfirm === prompt.id ? (
                        <div className={styles.confirmDelete}>
                          <span>Delete?</span>
                          <button onClick={() => handleDelete(prompt.id)} className={styles.confirmYes} id={`confirm-delete-${prompt.id}`}>Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className={styles.confirmNo}>No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(prompt.id)}
                          className={styles.deleteBtn}
                          id={`delete-btn-${prompt.id}`}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
