'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import PromptDetailModal, { Prompt, UserCategory } from '@/components/prompts/PromptDetailModal';
import styles from './page.module.css';

// Number of prompts visible in full preview to guests before requiring free registration
const GUEST_PREVIEW_LIMIT = 3;

export default function PromptsPage() {
  const { user, openAuthModal } = useAuth();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyWarning, setCopyWarning] = useState<string | null>(null);

  // Selected prompt for the full-screen split modal
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // User personal favorites & category lists
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [promptCategoryMap, setPromptCategoryMap] = useState<Record<string, string[]>>({});

  // Active Filter: 'all' | 'favorites' | 'saved'
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'saved'>('all');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [stagedCollectionIds, setStagedCollectionIds] = useState<string[]>([]);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [collectionLimitMsg, setCollectionLimitMsg] = useState<string | null>(null);
  const MAX_COLLECTION_FILTERS = 5;

  // Fetch prompts by keyword (searches title, prompt text, and niche)
  const fetchPrompts = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('prompts_with_category')
        .select('*')
        .order('created_at', { ascending: false });

      if (keyword.trim()) {
        const cleanTerm = keyword.trim().replace(/[,()]/g, '');
        // Search across title, prompt_text, and niche/category
        query = query.or(
          `title.ilike.%${cleanTerm}%,prompt_text.ilike.%${cleanTerm}%,category_name.ilike.%${cleanTerm}%`
        );
      }

      const { data: promptData, error } = await query;
      if (error) {
        console.error('Error querying prompts:', error);
      } else if (promptData) {
        setPrompts(promptData as Prompt[]);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user favorites and user categories
  const fetchUserData = useCallback(async () => {
    const userKey = user ? user.id : 'guest';

    // 1. Instant local restore
    try {
      const localCats = localStorage.getItem(`tbl_cats_${userKey}`);
      if (localCats) {
        setUserCategories(JSON.parse(localCats));
      }
      const localCatPrompts = localStorage.getItem(`tbl_cat_prompts_${userKey}`);
      if (localCatPrompts) {
        setPromptCategoryMap(JSON.parse(localCatPrompts));
      }
      const localFavs = localStorage.getItem(`tbl_favs_${userKey}`);
      if (localFavs) {
        setUserFavorites(JSON.parse(localFavs));
      }
    } catch (e) {
      console.warn('localStorage read error', e);
    }

    if (!user) return;

    // 2. Fetch from Supabase if tables exist
    try {
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('prompt_id')
        .eq('user_id', user.id);
      if (favs && favs.length > 0) {
        const favIds = favs.map(f => f.prompt_id);
        setUserFavorites(favIds);
        localStorage.setItem(`tbl_favs_${userKey}`, JSON.stringify(favIds));
      }

      const { data: cats } = await supabase
        .from('user_categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (cats && cats.length > 0) {
        setUserCategories(cats);
        localStorage.setItem(`tbl_cats_${userKey}`, JSON.stringify(cats));
      }

      const { data: catPrompts } = await supabase
        .from('user_category_prompts')
        .select('category_id, prompt_id')
        .eq('user_id', user.id);
      if (catPrompts && catPrompts.length > 0) {
        const map: Record<string, string[]> = {};
        catPrompts.forEach(cp => {
          if (!map[cp.prompt_id]) map[cp.prompt_id] = [];
          map[cp.prompt_id].push(cp.category_id);
        });
        setPromptCategoryMap(map);
        localStorage.setItem(`tbl_cat_prompts_${userKey}`, JSON.stringify(map));
      }
    } catch (err) {
      console.warn('Supabase sync note (tables may not be created yet):', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchPrompts('');
  }, [fetchPrompts]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Lock background body scrolling & handle Escape key when saved collections pop-up is open
  useEffect(() => {
    if (!savedModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSavedModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [savedModalOpen]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    setActiveKeyword(query);
    fetchPrompts(query);
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchInput('');
    setActiveKeyword('');
    fetchPrompts('');
  };

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    if (!user) {
      setCopyWarning('Please sign in or create a free account to copy prompts.');
      openAuthModal('signin', 'Sign in for free to copy prompts and access the full master prompt library.');
      setTimeout(() => setCopyWarning(null), 3500);
      return;
    }

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (promptId: string) => {
    const userKey = user ? user.id : 'guest';
    const isFav = userFavorites.includes(promptId);

    // Immediate state & local storage update
    const updatedFavs = isFav
      ? userFavorites.filter(id => id !== promptId)
      : [...userFavorites, promptId];

    setUserFavorites(updatedFavs);
    try {
      localStorage.setItem(`tbl_favs_${userKey}`, JSON.stringify(updatedFavs));
    } catch {}

    if (user) {
      try {
        if (isFav) {
          await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('prompt_id', promptId);
        } else {
          await supabase
            .from('user_favorites')
            .insert({ user_id: user.id, prompt_id: promptId });
        }
      } catch (err) {
        console.warn('Could not sync favorite to database:', err);
      }
    }
  };

  // Create Category / Collection
  const handleCreateCategory = async (name: string, promptIdToAssign?: string) => {
    const userKey = user ? user.id : 'guest';
    const tempId = 'coll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newCat: UserCategory = { id: tempId, name: name.trim() };

    // 1. Immediately update collections in state and localStorage
    const updatedCats = [...userCategories, newCat];
    setUserCategories(updatedCats);
    try {
      localStorage.setItem(`tbl_cats_${userKey}`, JSON.stringify(updatedCats));
    } catch {}

    // 2. If promptIdToAssign provided, immediately assign this prompt to the new collection
    if (promptIdToAssign) {
      const existing = promptCategoryMap[promptIdToAssign] || [];
      const updatedMap = {
        ...promptCategoryMap,
        [promptIdToAssign]: [...existing, newCat.id],
      };
      setPromptCategoryMap(updatedMap);
      try {
        localStorage.setItem(`tbl_cat_prompts_${userKey}`, JSON.stringify(updatedMap));
      } catch {}
    }

    // 3. If user is logged in, attempt to persist to Supabase
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_categories')
          .insert({ user_id: user.id, name: name.trim() })
          .select('id, name')
          .single();

        if (!error && data) {
          // Replace tempId with actual db id
          setUserCategories(prev => {
            const synced = prev.map(c => c.id === tempId ? data : c);
            try {
              localStorage.setItem(`tbl_cats_${userKey}`, JSON.stringify(synced));
            } catch {}
            return synced;
          });

          if (promptIdToAssign) {
            setPromptCategoryMap(prev => {
              const current = (prev[promptIdToAssign] || []).filter(id => id !== tempId);
              const syncedMap = {
                ...prev,
                [promptIdToAssign]: [...current, data.id],
              };
              try {
                localStorage.setItem(`tbl_cat_prompts_${userKey}`, JSON.stringify(syncedMap));
              } catch {}
              return syncedMap;
            });

            await supabase
              .from('user_category_prompts')
              .insert({
                user_id: user.id,
                prompt_id: promptIdToAssign,
                category_id: data.id,
              });
          }
        }
      } catch (err) {
        console.warn('Could not sync collection to Supabase:', err);
      }
    }
  };

  // Toggle Prompt in Category / Collection
  const handleTogglePromptCategory = async (promptId: string, categoryId: string) => {
    const userKey = user ? user.id : 'guest';
    const currentCats = promptCategoryMap[promptId] || [];
    const isAssigned = currentCats.includes(categoryId);

    // Immediate state & local storage update
    const updatedList = isAssigned
      ? currentCats.filter(id => id !== categoryId)
      : [...currentCats, categoryId];

    const updatedMap = {
      ...promptCategoryMap,
      [promptId]: updatedList,
    };
    setPromptCategoryMap(updatedMap);
    try {
      localStorage.setItem(`tbl_cat_prompts_${userKey}`, JSON.stringify(updatedMap));
    } catch {}

    if (user) {
      try {
        if (isAssigned) {
          await supabase
            .from('user_category_prompts')
            .delete()
            .eq('user_id', user.id)
            .eq('prompt_id', promptId)
            .eq('category_id', categoryId);
        } else {
          await supabase
            .from('user_category_prompts')
            .insert({
              user_id: user.id,
              prompt_id: promptId,
              category_id: categoryId,
            });
        }
      } catch (err) {
        console.warn('Could not sync prompt collection toggle to Supabase:', err);
      }
    }
  };

  // Selected prompt locked status
  const selectedPromptIndex = selectedPrompt ? prompts.findIndex(p => p.id === selectedPrompt.id) : -1;
  const isSelectedPromptLocked = !user && selectedPromptIndex >= GUEST_PREVIEW_LIMIT;

  // Collection filter handlers (staged in modal, only applied when clicking "Done")
  const handleOpenSavedModal = () => {
    setStagedCollectionIds(selectedCollectionIds);
    setCollectionLimitMsg(null);
    setSavedModalOpen(true);
  };

  const handleToggleStagedCollection = (catId: string) => {
    if (stagedCollectionIds.includes(catId)) {
      setStagedCollectionIds(prev => prev.filter(id => id !== catId));
      setCollectionLimitMsg(null);
    } else {
      if (stagedCollectionIds.length >= MAX_COLLECTION_FILTERS) {
        setCollectionLimitMsg("Can't add more than 5 collections to the filter.");
        setTimeout(() => setCollectionLimitMsg(null), 3500);
        return;
      }
      setStagedCollectionIds(prev => [...prev, catId]);
      setCollectionLimitMsg(null);
    }
  };

  const handleApplySavedFilter = () => {
    setSelectedCollectionIds(stagedCollectionIds);
    setActiveFilter('saved');
    setSavedModalOpen(false);
  };

  const handleCloseSavedModal = () => {
    setCollectionLimitMsg(null);
    setSavedModalOpen(false);
  };

  const handleRemoveCollectionTag = (catId: string) => {
    setSelectedCollectionIds(prev => prev.filter(id => id !== catId));
    setCollectionLimitMsg(null);
  };

  // Filter calculations
  const favCount = prompts.filter(p => userFavorites.includes(p.id)).length;
  const savedCount = prompts.filter(p => (promptCategoryMap[p.id] || []).length > 0).length;

  const displayedPrompts = prompts.filter(prompt => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favorites') {
      return userFavorites.includes(prompt.id);
    }
    if (activeFilter === 'saved') {
      const cats = promptCategoryMap[prompt.id] || [];
      if (selectedCollectionIds.length === 0) {
        return cats.length > 0;
      }
      return selectedCollectionIds.some(catId => cats.includes(catId));
    }
    return true;
  });

  // Saved collection sections (when activeFilter === 'saved')
  const savedCategoriesToRender = (
    selectedCollectionIds.length > 0
      ? userCategories.filter(cat => selectedCollectionIds.includes(cat.id))
      : userCategories
  )
    .map(cat => ({
      ...cat,
      prompts: displayedPrompts.filter(p => (promptCategoryMap[p.id] || []).includes(cat.id)),
    }))
    .filter(cat => cat.prompts.length > 0);

  const uncategorizedSavedPrompts =
    activeFilter === 'saved'
      ? displayedPrompts.filter(p => {
          const cats = promptCategoryMap[p.id] || [];
          return !userCategories.some(c => cats.includes(c.id));
        })
      : [];

  // Helper to render prompt cards uniformly
  const renderPromptCard = (prompt: Prompt, index: number) => {
    const isFav = userFavorites.includes(prompt.id);

    return (
      <div
        key={prompt.id}
        className={`${styles.promptCard} tbl-card`}
        id={`prompt-card-${prompt.id}`}
        style={{ animationDelay: `${(index % 12) * 0.05}s` }}
        onClick={() => setSelectedPrompt(prompt)}
      >
        {/* Card Header (Clean: no category, no date) */}
        <div className={styles.cardHeader}>
          <div className={styles.cardTopGlow}></div>
          {isFav ? (
            <span className={styles.cardStarBadge} title="Favorited">★</span>
          ) : (
            <span style={{ height: '18px' }} />
          )}
        </div>

        {/* Title */}
        <h3 className={styles.cardTitle}>{prompt.title}</h3>

        {/* Action Bar: View Prompt Button */}
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.viewPromptBtn}
            id={`view-prompt-btn-${prompt.id}`}
            onClick={e => {
              e.stopPropagation();
              setSelectedPrompt(prompt);
            }}
          >
            <span>View Prompt</span>
            <span className={styles.viewPromptArrow}>→</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      {/* Toast Notice for copy attempt when not logged in */}
      {copyWarning && (
        <div className={styles.copyNotice} role="status">
          <span>🔒</span>
          <span>{copyWarning}</span>
        </div>
      )}

      {/* Filter Limit Notice Toast */}
      {collectionLimitMsg && (
        <div className={styles.copyNotice} style={{ borderColor: '#facc15', color: '#facc15' }} role="alert">
          <span>⚠️</span>
          <span>{collectionLimitMsg}</span>
        </div>
      )}

      {/* ===== PAGE HEADER ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderBg}>
          <div className={styles.headerGrid}></div>
          <div className={styles.headerGlow}></div>
        </div>
        <div className={`${styles.pageHeaderContent} container`}>
          <div className="tbl-section-badge">Master Collection</div>
          <h1 className={styles.pageTitle}>
            Master <span className="tbl-neon-word">Prompt</span> Library
          </h1>
          <p className={styles.pageDesc}>
            Precision-engineered AI prompts for modern creators.
          </p>
        </div>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className={styles.searchBarSection}>
        <div className="container">
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Search prompts by keyword or niche"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className={styles.searchInput}
                id="prompt-search"
                autoComplete="off"
              />
              {searchInput && (
                <button
                  type="button"
                  className={styles.clearInputBtn}
                  onClick={() => setSearchInput('')}
                  aria-label="Clear input text"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchBtn} id="search-submit-btn">
              <span>⌕</span>
              <span>Search</span>
            </button>
          </form>

          {/* Quick Filters: All, Favorites, Saved & Selected Collection Tags */}
          <div className={styles.filtersRow}>
            <div className={styles.filterPills}>
              {/* All Prompts (NO count) */}
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedCollectionIds([]);
                }}
              >
                <span>All Prompts</span>
              </button>

              {/* Favorites (NO count) */}
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'favorites' ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setActiveFilter(activeFilter === 'favorites' ? 'all' : 'favorites');
                }}
              >
                <span className={styles.filterStarIcon}>★</span>
                <span>Favorites</span>
              </button>

              {/* Saved Button (NO dropdown caret, clicking pops up Saved Collections window) */}
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'saved' ? styles.filterPillActive : ''}`}
                onClick={handleOpenSavedModal}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>Saved</span>
              </button>

              {/* Selected Collection Tags (in front of / next to Saved) */}
              {selectedCollectionIds.map(catId => {
                const cat = userCategories.find(c => c.id === catId);
                if (!cat) return null;
                return (
                  <div key={cat.id} className={styles.selectedCollectionTag}>
                    <span className={styles.tagIcon}>📁</span>
                    <span className={styles.tagLabel}>{cat.name}</span>
                    <button
                      type="button"
                      className={styles.tagCloseBtn}
                      onClick={() => handleRemoveCollectionTag(cat.id)}
                      title={`Remove ${cat.name} filter`}
                      aria-label={`Remove ${cat.name} filter`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PROMPTS GRID ===== */}
      <div className={styles.promptsSection}>
        <div className="container">
          {/* Access Banner (Guests only) */}
          {!user && (
            <div className={styles.guestBanner}>
              <div className={styles.guestBannerLeft}>
                <div className={styles.guestBannerIcon}>⚡</div>
                <div>
                  <div className={styles.guestBannerTitle}>
                    Guest Preview Active ({GUEST_PREVIEW_LIMIT} Free Previews)
                  </div>
                  <div className={styles.guestBannerDesc}>
                    Sign in with Google or Email for free to unlock clipboard copying and browse all 100+ master prompts.
                  </div>
                </div>
              </div>
              <button
                className={styles.guestBannerBtn}
                onClick={() => openAuthModal('signup', 'Create a free account to unlock all prompts and instant copy.')}
              >
                Sign In / Sign Up Free →
              </button>
            </div>
          )}

          {/* Active Search Result Notice */}
          {activeKeyword && (
            <div className={styles.activeSearchNotice}>
              <span>
                Showing results for <span className={styles.activeSearchQuery}>&quot;{activeKeyword}&quot;</span> ({displayedPrompts.length} found)
              </span>
              <button
                type="button"
                className={styles.resetSearchBtn}
                onClick={handleClearSearch}
              >
                ✕ Clear Search
              </button>
            </div>
          )}



          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <span>Searching prompts...</span>
            </div>
          ) : displayedPrompts.length === 0 ? (
            <div className={styles.emptyState}>
              {activeFilter === 'favorites' ? (
                <>
                  <div className={styles.emptyIcon} style={{ color: '#facc15' }}>★</div>
                  <h3>No favorite prompts yet</h3>
                  <p>Click the star icon (★) in any prompt modal to add it to your favorites</p>
                  <button
                    type="button"
                    className={styles.resetSearchBtn}
                    onClick={() => setActiveFilter('all')}
                    style={{ marginTop: '1.25rem', padding: '8px 18px', fontSize: '0.88rem' }}
                  >
                    View All Prompts
                  </button>
                </>
              ) : activeFilter === 'saved' ? (
                <>
                  <div className={styles.emptyIcon}>🔖</div>
                  <h3>
                    {selectedCollectionIds.length === 0
                      ? 'No saved prompts yet'
                      : 'No prompts found in the selected collections'}
                  </h3>
                  <p>
                    {selectedCollectionIds.length === 0
                      ? 'Click the bookmark icon on any prompt to save it to your collections'
                      : 'Open any prompt and save it into these collections'}
                  </p>
                  <button
                    type="button"
                    className={styles.resetSearchBtn}
                    onClick={() => {
                      setActiveFilter('all');
                      setSelectedCollectionIds([]);
                    }}
                    style={{ marginTop: '1.25rem', padding: '8px 18px', fontSize: '0.88rem' }}
                  >
                    View All Prompts
                  </button>
                </>
              ) : activeKeyword ? (
                <>
                  <div className={styles.emptyIcon}>◈</div>
                  <h3>No prompts found matching &quot;{activeKeyword}&quot;</h3>
                  <p>Try searching with another keyword or niche</p>
                  <button
                    type="button"
                    className={styles.resetSearchBtn}
                    onClick={handleClearSearch}
                    style={{ marginTop: '1.25rem', padding: '8px 18px', fontSize: '0.88rem' }}
                  >
                    View All Prompts
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.emptyIcon}>◈</div>
                  <h3>No prompts available yet</h3>
                  <p>Check back soon for new master prompts</p>
                </>
              )}
            </div>
          ) : activeFilter === 'saved' ? (
            <div className={styles.savedSectionsContainer}>
              {savedCategoriesToRender.map(cat => (
                <section key={cat.id} className={styles.collectionSection}>
                  <div className={styles.collectionSectionHeader}>
                    <div className={styles.collectionSectionTitleRow}>
                      <span className={styles.collectionSectionIcon}>📁</span>
                      <h2 className={styles.collectionSectionTitle}>{cat.name}</h2>
                    </div>
                    <span className={styles.collectionSectionCount}>
                      {cat.prompts.length} {cat.prompts.length === 1 ? 'prompt' : 'prompts'}
                    </span>
                  </div>
                  <div className={styles.promptsGrid}>
                    {cat.prompts.map((prompt, i) => renderPromptCard(prompt, i))}
                  </div>
                </section>
              ))}

              {uncategorizedSavedPrompts.length > 0 && (
                <section className={styles.collectionSection}>
                  <div className={styles.collectionSectionHeader}>
                    <div className={styles.collectionSectionTitleRow}>
                      <span className={styles.collectionSectionIcon}>🔖</span>
                      <h2 className={styles.collectionSectionTitle}>Other Saved Prompts</h2>
                    </div>
                    <span className={styles.collectionSectionCount}>
                      {uncategorizedSavedPrompts.length} {uncategorizedSavedPrompts.length === 1 ? 'prompt' : 'prompts'}
                    </span>
                  </div>
                  <div className={styles.promptsGrid}>
                    {uncategorizedSavedPrompts.map((prompt, i) => renderPromptCard(prompt, i))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className={styles.promptsGrid}>
              {displayedPrompts.map((prompt, i) => renderPromptCard(prompt, i))}
            </div>
          )}
        </div>
      </div>

      {/* ===== SAVED COLLECTIONS POP-UP MODAL ===== */}
      {savedModalOpen && (
        <div
          className={styles.savedModalOverlay}
          onClick={e => {
            if (e.target === e.currentTarget) handleCloseSavedModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-modal-title"
        >
          <div className={styles.savedModalWindow}>
            {/* Pop-up Header */}
            <div className={styles.savedModalHeader}>
              <div className={styles.savedModalTitleRow}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ color: 'var(--tbl-neon)' }}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <h3 id="saved-modal-title" className={styles.savedModalTitle}>
                  Saved Collections
                </h3>
              </div>
              <button
                type="button"
                className={styles.savedModalCloseBtn}
                onClick={handleCloseSavedModal}
                aria-label="Close saved collections pop-up"
              >
                ✕
              </button>
            </div>

            {/* Subheader */}
            <div className={styles.savedModalSubheader}>
              <span className={styles.savedModalSubtitle}>
                Select collections to filter prompts
              </span>
            </div>

            {/* Limit Warning Banner */}
            {collectionLimitMsg && (
              <div className={styles.popupLimitBanner}>
                <span>⚠️</span>
                <span>{collectionLimitMsg}</span>
              </div>
            )}

            {/* Collections List */}
            <div className={styles.savedModalList}>
              {/* View All Saved option (NO count display) */}
              <button
                type="button"
                className={`${styles.popupCollectionItem} ${
                  stagedCollectionIds.length === 0 ? styles.popupCollectionItemSelected : ''
                }`}
                onClick={() => {
                  setStagedCollectionIds([]);
                }}
              >
                <span className={styles.popupItemCheck}>
                  {stagedCollectionIds.length === 0 ? '✓' : ''}
                </span>
                <span className={styles.popupItemText}>All Saved Prompts</span>
              </button>

              <div className={styles.popupDivider} />

              {userCategories.length === 0 ? (
                <div className={styles.emptyPopupMessage}>
                  No collections created yet. Open any prompt modal and click the bookmark ribbon to save it into a new collection.
                </div>
              ) : (
                userCategories.map(cat => {
                  const isSelected = stagedCollectionIds.includes(cat.id);
                  const count = prompts.filter(p =>
                    (promptCategoryMap[p.id] || []).includes(cat.id)
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.popupCollectionItem} ${
                        isSelected ? styles.popupCollectionItemSelected : ''
                      }`}
                      onClick={() => handleToggleStagedCollection(cat.id)}
                    >
                      <span className={styles.popupItemCheck}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className={styles.popupItemText}>{cat.name}</span>
                      <span className={styles.popupItemCount}>({count})</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.savedModalFooter}>
              {stagedCollectionIds.length > 0 ? (
                <button
                  type="button"
                  className={styles.clearSelectionsBtn}
                  onClick={() => setStagedCollectionIds([])}
                >
                  Clear Selection
                </button>
              ) : (
                <div />
              )}
              <div className={styles.modalRightActions}>
                <button
                  type="button"
                  className={styles.cancelModalBtn}
                  onClick={handleCloseSavedModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.applyFilterBtn}
                  onClick={handleApplySavedFilter}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FULL-SCREEN SPLIT PROMPT DETAIL MODAL ===== */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        isLocked={isSelectedPromptLocked}
        onCopy={handleCopy}
        copied={copiedId === selectedPrompt?.id}
        isFavorite={selectedPrompt ? userFavorites.includes(selectedPrompt.id) : false}
        onToggleFavorite={handleToggleFavorite}
        userCategories={userCategories}
        promptCategoryIds={selectedPrompt ? promptCategoryMap[selectedPrompt.id] || [] : []}
        onTogglePromptCategory={handleTogglePromptCategory}
        onCreateCategory={handleCreateCategory}
        onUnlockRequest={() => {
          setSelectedPrompt(null);
          openAuthModal('signin', 'Sign in for free to unlock this prompt.');
        }}
      />
    </div>
  );
}
