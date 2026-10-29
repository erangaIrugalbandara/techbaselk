'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };
type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  youtube_url: string | null;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) setCategories(cats);

      // Fetch prompts with category info via view
      let query = supabase
        .from('prompts_with_category')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category_slug', activeCategory);
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data: promptData } = await query;
      if (promptData) setPrompts(promptData as Prompt[]);
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.page}>
      {/* ===== PAGE HEADER ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderBg}>
          <div className={styles.headerGrid}></div>
          <div className={styles.headerGlow}></div>
        </div>
        <div className={`${styles.pageHeaderContent} container`}>
          <div className="tbl-section-badge">Free Access</div>
          <h1 className={styles.pageTitle}>
            Master <span className="tbl-neon-word">Prompt</span> Library
          </h1>
          <p className={styles.pageDesc}>
            Professional AI prompts curated for creators, marketers, and AI enthusiasts. Copy and use instantly — 100% free.
          </p>
        </div>
      </div>

      {/* ===== FILTERS & SEARCH ===== */}
      <div className={styles.filtersBar}>
        <div className={`${styles.filtersInner} container`}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              id="prompt-search"
            />
          </div>

          {/* Category Filters */}
          <div className={styles.categoryFilters}>
            <button
              id="cat-all"
              className={`${styles.catBtn} ${activeCategory === 'all' ? styles.catBtnActive : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                id={`cat-${cat.slug}`}
                className={`${styles.catBtn} ${activeCategory === cat.slug ? styles.catBtnActive : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PROMPTS GRID ===== */}
      <div className={styles.promptsSection}>
        <div className="container">
          {/* Count */}
          <div className={styles.promptsCount}>
            <span className={styles.countNum}>{prompts.length}</span>
            <span className={styles.countLabel}>prompts found</span>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <span>Loading prompts...</span>
            </div>
          ) : prompts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>◈</div>
              <h3>No prompts found</h3>
              <p>Try a different category or search term</p>
            </div>
          ) : (
            <div className={styles.promptsGrid}>
              {prompts.map((prompt, i) => (
                <div
                  key={prompt.id}
                  className={`${styles.promptCard} tbl-card`}
                  id={`prompt-card-${prompt.id}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardMeta}>
                      {prompt.category_name && (
                        <span className={styles.cardCategory}>{prompt.category_name}</span>
                      )}
                      <span className={styles.cardDate} suppressHydrationWarning>{formatDate(prompt.created_at)}</span>
                    </div>
                    <div className={styles.cardTopGlow}></div>
                  </div>

                  {/* Title */}
                  <h3 className={styles.cardTitle}>{prompt.title}</h3>

                  {/* Prompt Text Preview */}
                  <div className={`${styles.promptTextWrapper} ${expandedId === prompt.id ? styles.promptTextExpanded : ''}`}>
                    <p className={styles.promptText}>{prompt.prompt_text}</p>
                  </div>

                  {/* Expand/Collapse if long */}
                  {prompt.prompt_text.length > 200 && (
                    <button
                      className={styles.expandBtn}
                      onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                    >
                      {expandedId === prompt.id ? '▲ Show less' : '▼ Read full prompt'}
                    </button>
                  )}

                  {/* YouTube Video */}
                  {prompt.youtube_url && getYouTubeId(prompt.youtube_url) && (
                    <div className={styles.videoWrapper}>
                      <iframe
                        className={styles.videoFrame}
                        src={`https://www.youtube.com/embed/${getYouTubeId(prompt.youtube_url)}`}
                        title={`Preview: ${prompt.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className={styles.cardActions}>
                    <button
                      id={`copy-btn-${prompt.id}`}
                      className={`${styles.copyBtn} ${copiedId === prompt.id ? styles.copyBtnSuccess : ''}`}
                      onClick={() => handleCopy(prompt.prompt_text, prompt.id)}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <span>✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                    {prompt.youtube_url && (
                      <a
                        href={prompt.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.ytBtn}
                        id={`yt-btn-${prompt.id}`}
                      >
                        <span>▶</span>
                        <span>Watch Preview</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
