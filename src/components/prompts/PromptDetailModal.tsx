'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './PromptDetailModal.module.css';

export type UserCategory = {
  id: string;
  name: string;
};

export type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  youtube_url: string | null;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
};

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  onCopy: (text: string, id: string) => void;
  copied: boolean;
  isFavorite: boolean;
  onToggleFavorite: (promptId: string) => void;
  userCategories: UserCategory[];
  promptCategoryIds: string[];
  onTogglePromptCategory: (promptId: string, categoryId: string) => void;
  onCreateCategory: (name: string, promptIdToAssign?: string) => Promise<void>;
  onUnlockRequest: () => void;
}

export default function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  isLocked,
  onCopy,
  copied,
  isFavorite,
  onToggleFavorite,
  userCategories,
  promptCategoryIds,
  onTogglePromptCategory,
  onCreateCategory,
  onUnlockRequest,
}: PromptDetailModalProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !prompt) return null;

  const getYouTubeId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(prompt.youtube_url);

  const isSaved = promptCategoryIds.length > 0;
  const isFormVisible = showCreateForm || userCategories.length === 0;

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      await onCreateCategory(newCatName.trim(), prompt.id);
      setNewCatName('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating collection:', err);
    } finally {
      setCreatingCat(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.topGlow} />

        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Split Screen Layout */}
        <div className={styles.splitLayout}>
          {/* Left Column: Video Preview */}
          <div className={styles.leftCol}>
            {videoId ? (
              <div className={styles.videoWrapper}>
                <iframe
                  className={styles.videoFrame}
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={`Preview: ${prompt.title}`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={styles.noVideoPlaceholder}>
                <div className={styles.noVideoIcon}>◈</div>
                <div className={styles.noVideoText}>Master Prompt Template</div>
                <div className={styles.noVideoSub}>
                  No preview video attached. Copy and paste the prompt on the right directly into your AI generator.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Prompt Information */}
          <div className={styles.rightCol}>
            {/* Topic / Title */}
            <h2 className={styles.title}>{prompt.title}</h2>

            {/* Actions: Favorite & List Management */}
            <div className={styles.actionsBar}>
              {/* Star Favorite Button */}
              <button
                type="button"
                className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`}
                onClick={() => onToggleFavorite(prompt.id)}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span className={styles.starIcon}>{isFavorite ? '★' : '☆'}</span>
              </button>

              {/* Save Reel (Bookmark) Button */}
              <div className={styles.categoryDropdownWrapper} ref={dropdownRef}>
                <button
                  type="button"
                  className={`${styles.saveReelBtn} ${isSaved ? styles.saveReelBtnActive : ''} ${
                    dropdownOpen ? styles.saveReelBtnOpen : ''
                  }`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={isSaved ? 'Saved to collections' : 'Save to collection'}
                  aria-label={isSaved ? 'Saved to collections' : 'Save to collection'}
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                {/* Collections Small Window Pop-up */}
                {dropdownOpen && (
                  <div className={styles.collectionPopup}>
                    {/* Pop-up Header */}
                    <div className={styles.popupHeader}>
                      <div className={styles.popupTitleRow}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Save to Collection</span>
                      </div>
                      <button
                        type="button"
                        className={styles.popupCloseBtn}
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowCreateForm(false);
                        }}
                        aria-label="Close collections popup"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Create Collection Button / Form with plus mark */}
                    {!isFormVisible ? (
                      <button
                        type="button"
                        className={styles.createToggleBtn}
                        onClick={() => setShowCreateForm(true)}
                      >
                        <span className={styles.plusMark}>+</span>
                        <span>Create Collection</span>
                      </button>
                    ) : (
                      <form onSubmit={handleCreateCategorySubmit} className={styles.createCollectionForm}>
                        <input
                          type="text"
                          placeholder="Enter collection name..."
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          className={styles.createCollectionInput}
                          maxLength={40}
                          autoFocus
                        />
                        <div className={styles.createFormActions}>
                          {userCategories.length > 0 && (
                            <button
                              type="button"
                              className={styles.cancelCreateBtn}
                              onClick={() => {
                                setShowCreateForm(false);
                                setNewCatName('');
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            className={styles.submitCreateBtn}
                            disabled={creatingCat || !newCatName.trim()}
                          >
                            {creatingCat ? 'Saving...' : 'Save Collection'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Collections List */}
                    <div className={styles.collectionsSection}>
                      <div className={styles.collectionsSectionTitle}>Collections</div>
                      <div className={styles.categoryList}>
                        {userCategories.length === 0 ? (
                          <div className={styles.emptyCategories}>
                            No collections yet. Click &quot;+ Create Collection&quot; above to create your first list.
                          </div>
                        ) : (
                          userCategories.map(cat => {
                            const isAssigned = promptCategoryIds.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                className={`${styles.categoryItem} ${
                                  isAssigned ? styles.categoryItemSelected : ''
                                }`}
                                onClick={() => onTogglePromptCategory(prompt.id, cat.id)}
                              >
                                <span className={styles.categoryCheck}>
                                  {isAssigned ? '✓' : ''}
                                </span>
                                <span className={styles.categoryNameText}>{cat.name}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Text with Internal Scrolling */}
            <div className={styles.promptBoxWrapper}>
              {isLocked ? (
                <div className={styles.lockedContainer}>
                  <p className={`${styles.promptText} ${styles.blurredText}`}>
                    {prompt.prompt_text.slice(0, 160)}...
                  </p>
                  <div className={styles.lockedNotice}>
                    <span className={styles.lockedText}>🔒 Free Registration Required</span>
                    <button
                      type="button"
                      className={styles.unlockActionBtn}
                      onClick={onUnlockRequest}
                    >
                      Sign In to Unlock Prompt →
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.promptScrollContainer}>
                  <pre className={styles.promptText}>{prompt.prompt_text}</pre>
                </div>
              )}
            </div>

            {/* Copy to Clipboard Button */}
            <button
              type="button"
              className={`${styles.copyActionBtn} ${copied ? styles.copyActionBtnSuccess : ''} ${
                dropdownOpen ? styles.copyActionBtnDisabledHover : ''
              }`}
              onClick={() => onCopy(prompt.prompt_text, prompt.id)}
              disabled={dropdownOpen}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Full Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

