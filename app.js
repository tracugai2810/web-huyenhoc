// ==========================================================================
// KNOWLEDGE BASE APPLICATION LOGIC - DUPLICATE CHECK & MATCH SNIPPETS (V4)
// ==========================================================================

function initApp() {
    console.log("Initializing Bách Khoa Huyền Học App...");

    // Persistent Username Setup
    let currentUsername = localStorage.getItem('PERSISTENT_USERNAME') || 'DBC';

    function setUsername(newUsername) {
        if (!newUsername || !newUsername.trim()) return;
        currentUsername = newUsername.trim();
        localStorage.setItem('PERSISTENT_USERNAME', currentUsername);
        
        const displayUsername = document.getElementById('displayUsername');
        if (displayUsername) displayUsername.textContent = `Tác giả: ${currentUsername}`;

        const activeAuthorTag = document.getElementById('activeAuthorTag');
        if (activeAuthorTag) activeAuthorTag.textContent = `👤 Người viết: ${currentUsername}`;
    }

    // Select DOM Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarCategoryList = document.getElementById('sidebarCategoryList');
    const sidebarFilterInput = document.getElementById('sidebarFilterInput');
    const addCategoryBtnSidebar = document.getElementById('addCategoryBtnSidebar');
    const userProfileCard = document.getElementById('userProfileCard');
    
    const statArticlesCount = document.getElementById('statArticlesCount');
    const statCategoryCount = document.getElementById('statCategoryCount');
    const statSidebarArticles = document.getElementById('statSidebarArticles');
    
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const sortSelect = document.getElementById('sortSelect');
    
    const listView = document.getElementById('listView');
    const readerView = document.getElementById('readerView');
    const heroBanner = document.getElementById('heroBanner');
    
    const currentCategoryTitle = document.getElementById('currentCategoryTitle');
    const articleCountBadge = document.getElementById('articleCountBadge');
    const articleGrid = document.getElementById('articleGrid');
    const noResults = document.getElementById('noResults');
    const addChannelBtnCategory = document.getElementById('addChannelBtnCategory');

    const backToListBtn = document.getElementById('backToListBtn');
    const fontDecBtn = document.getElementById('fontDecBtn');
    const fontResetBtn = document.getElementById('fontResetBtn');
    const fontIncBtn = document.getElementById('fontIncBtn');
    
    const readerCategory = document.getElementById('readerCategory');
    const readerThreadBadge = document.getElementById('readerThreadBadge');
    const readerMsgCount = document.getElementById('readerMsgCount');
    const readerTitle = document.getElementById('readerTitle');
    const readerContent = document.getElementById('readerContent');
    
    const editTopicBtn = document.getElementById('editTopicBtn');
    const deleteArticleBtn = document.getElementById('deleteArticleBtn');
    const downloadMdBtn = document.getElementById('downloadMdBtn');

    const exportBackupBtn = document.getElementById('exportBackupBtn');
    
    // Inline Add Message Box Elements
    const inlineMsgTextarea = document.getElementById('inlineMsgTextarea');
    const msgImageFileInput = document.getElementById('msgImageFileInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const submitInlineMsgBtn = document.getElementById('submitInlineMsgBtn');

    // Modals
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    const cancelCategoryModalBtn = document.getElementById('cancelCategoryModalBtn');
    const categoryModalBackdrop = document.getElementById('categoryModalBackdrop');
    const categoryForm = document.getElementById('categoryForm');
    const newCategoryTitleInput = document.getElementById('newCategoryTitleInput');

    const topicModal = document.getElementById('topicModal');
    const closeTopicModalBtn = document.getElementById('closeTopicModalBtn');
    const cancelTopicModalBtn = document.getElementById('cancelTopicModalBtn');
    const topicModalBackdrop = document.getElementById('topicModalBackdrop');
    const topicForm = document.getElementById('topicForm');
    const topicCategorySelect = document.getElementById('topicCategorySelect');
    const newTopicTitleInput = document.getElementById('newTopicTitleInput');
    const topicModalHeaderTitle = document.getElementById('topicModalHeaderTitle');
    const saveTopicModalSubmitBtn = document.getElementById('saveTopicModalSubmitBtn');
    const editTopicId = document.getElementById('editTopicId');

    // Custom Modern Confirm & Alert Modal Elements
    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmBackdrop = document.getElementById('customConfirmBackdrop');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');
    const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');
    let onConfirmCallback = null;

    function showCustomConfirm(title, message, callback) {
        if (!customConfirmModal) {
            if (confirm(message)) callback();
            return;
        }
        if (confirmModalTitle) confirmModalTitle.textContent = title || "Xác nhận";
        if (confirmModalMessage) confirmModalMessage.textContent = message;
        if (confirmModalCancelBtn) confirmModalCancelBtn.style.display = 'inline-flex';
        onConfirmCallback = callback;
        customConfirmModal.classList.add('active');
    }

    function showCustomAlert(title, message) {
        if (!customConfirmModal) {
            alert(message);
            return;
        }
        if (confirmModalTitle) confirmModalTitle.textContent = title || "Thông báo";
        if (confirmModalMessage) confirmModalMessage.textContent = message;
        if (confirmModalCancelBtn) confirmModalCancelBtn.style.display = 'none';
        onConfirmCallback = null;
        customConfirmModal.classList.add('active');
    }

    function closeCustomConfirm() {
        if (customConfirmModal) customConfirmModal.classList.remove('active');
        onConfirmCallback = null;
    }

    if (confirmModalCancelBtn) confirmModalCancelBtn.onclick = closeCustomConfirm;
    if (customConfirmBackdrop) customConfirmBackdrop.onclick = closeCustomConfirm;
    if (confirmModalOkBtn) {
        confirmModalOkBtn.onclick = () => {
            if (typeof onConfirmCallback === 'function') {
                onConfirmCallback();
            }
            closeCustomConfirm();
        };
    }

    // Bottom Nav Elements
    const navHomeBtn = document.getElementById('navHomeBtn');
    const navCategoriesBtn = document.getElementById('navCategoriesBtn');
    const navAddTopicBtn = document.getElementById('navAddTopicBtn');
    const navSearchFocusBtn = document.getElementById('navSearchFocusBtn');

    // Image Upload Buffer
    let pendingBase64Images = [];

    // View Navigation Helpers
    function showListView() {
        if (readerView) readerView.classList.remove('active');
        if (listView) listView.classList.add('active');
        if (heroBanner) heroBanner.style.display = 'block';
    }

    // Initialize Username Badge
    setUsername(currentUsername);
    if (userProfileCard) {
        userProfileCard.onclick = () => {
            const input = prompt("Nhập Tên tác giả / Nickname cố định của bạn:", currentUsername);
            if (input && input.trim()) {
                setUsername(input.trim());
            }
        };
    }

    // Theme Management (Light / Dark)
    function updateThemeIcon(theme) {
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    const currentTheme = localStorage.getItem('APP_THEME') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('APP_THEME', theme);
            updateThemeIcon(theme);
        };
    }

    // Data Initialization
    let defaultArticles = window.INITIAL_ARTICLES || [];
    let defaultCategories = window.INITIAL_CATEGORIES || [];

    let customArticles = [];
    let deletedArticleIds = [];

    try {
        customArticles = JSON.parse(localStorage.getItem('CUSTOM_ARTICLES') || '[]');
    } catch (e) {
        console.warn('Cannot parse CUSTOM_ARTICLES from localStorage:', e);
    }

    try {
        deletedArticleIds = JSON.parse(localStorage.getItem('DELETED_ARTICLE_IDS') || '[]');
    } catch (e) {
        console.warn('Cannot parse DELETED_ARTICLE_IDS from localStorage:', e);
    }

    function getCombinedArticles() {
        let articlesMap = new Map();
        
        defaultArticles.forEach(art => {
            if (art && art.id && !deletedArticleIds.includes(art.id)) {
                articlesMap.set(art.id, art);
            }
        });

        customArticles.forEach(art => {
            if (art && art.id && !deletedArticleIds.includes(art.id)) {
                articlesMap.set(art.id, art);
            }
        });

        return Array.from(articlesMap.values());
    }

    let allArticles = getCombinedArticles();
    let categories = [];

    function refreshCategories() {
        let catSet = new Set(defaultCategories);
        allArticles.forEach(a => {
            if (a && a.category) catSet.add(a.category);
        });
        categories = Array.from(catSet).sort();
    }
    refreshCategories();

    // App Navigation State
    let activeCategory = 'ALL';
    let searchQuery = '';
    let sortMode = 'default';
    let currentArticleId = null;
    let readerFontSize = 16;

    // Vietnamese Diacritics & Hyphen Normalizer
    function normalizeSearchText(str) {
        if (!str) return '';
        return str.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd')
                  .replace(/[-_]/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
    }

    // Extract a 120-char snippet around match location (Screenshot 2 feature!)
    function getMatchedSnippet(content, rawQuery) {
        if (!content || !rawQuery) return content ? content.substring(0, 150) : "";
        
        const normContent = normalizeSearchText(content);
        const normQuery = normalizeSearchText(rawQuery);
        
        const matchIdx = normContent.indexOf(normQuery);
        if (matchIdx < 0) {
            return content.substring(0, 150);
        }

        const start = Math.max(0, matchIdx - 40);
        const end = Math.min(content.length, matchIdx + normQuery.length + 80);
        
        let snippet = content.substring(start, end).replace(/\n+/g, ' ').trim();
        if (start > 0) snippet = '... ' + snippet;
        if (end < content.length) snippet = snippet + ' ...';
        
        return snippet;
    }

    // Render Navigation Sidebar
    function renderNavigation(filterFilterText = '') {
        let filteredCats = categories;
        if (filterFilterText.trim()) {
            const f = filterFilterText.toLowerCase();
            filteredCats = categories.filter(c => c.toLowerCase().includes(f));
        }

        if (sidebarCategoryList) {
            sidebarCategoryList.innerHTML = '';
            
            const allItem = document.createElement('div');
            allItem.className = `sidebar-item ${activeCategory === 'ALL' ? 'active' : ''}`;
            allItem.innerHTML = `
                <span>🌐 Tất cả chuyên mục</span>
                <span class="sidebar-item-count">${allArticles.length}</span>
            `;
            allItem.onclick = () => selectCategory('ALL');
            sidebarCategoryList.appendChild(allItem);

            filteredCats.forEach(cat => {
                const count = allArticles.filter(a => a.category === cat).length;
                const item = document.createElement('div');
                item.className = `sidebar-item ${activeCategory === cat ? 'active' : ''}`;
                item.innerHTML = `
                    <span>📂 ${escapeHtml(cat)}</span>
                    <span class="sidebar-item-count">${count}</span>
                `;
                item.onclick = () => selectCategory(cat);
                sidebarCategoryList.appendChild(item);
            });
        }

        // Topic Modal Category Select
        if (topicCategorySelect) {
            topicCategorySelect.innerHTML = '';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = `📂 ${cat}`;
                topicCategorySelect.appendChild(opt);
            });
        }

        // Hero Stats
        if (statArticlesCount) statArticlesCount.textContent = allArticles.length;
        if (statCategoryCount) statCategoryCount.textContent = categories.length;
        if (statSidebarArticles) statSidebarArticles.textContent = `Đã lưu ${allArticles.length} chủ đề`;
    }

    function selectCategory(cat) {
        activeCategory = cat;
        renderNavigation(sidebarFilterInput ? sidebarFilterInput.value : '');
        renderArticleList();
        closeMobileSidebar();
        showListView();
    }

    if (sidebarFilterInput) {
        sidebarFilterInput.oninput = (e) => {
            renderNavigation(e.target.value);
        };
    }

    // Render Article Grid List with DYNAMIC MATCHED SNIPPET
    function renderArticleList() {
        if (!articleGrid) return;
        
        let filtered = allArticles;
        const trimmedQuery = searchQuery.trim();
        const normQuery = normalizeSearchText(trimmedQuery);

        if (normQuery !== '') {
            filtered = filtered.filter(a => {
                const normTitle = normalizeSearchText(a.title);
                const normCat = normalizeSearchText(a.category);
                const normContent = normalizeSearchText(a.content);
                return normTitle.includes(normQuery) || normCat.includes(normQuery) || normContent.includes(normQuery);
            });
        } else if (activeCategory !== 'ALL') {
            filtered = filtered.filter(a => a.category === activeCategory);
        }

        if (sortMode === 'msgHigh') {
            filtered.sort((a, b) => (b.msgCount || 0) - (a.msgCount || 0));
        } else if (sortMode === 'titleAz') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        if (currentCategoryTitle) {
            if (normQuery) {
                currentCategoryTitle.textContent = `Kết quả tìm kiếm: "${trimmedQuery}"`;
            } else {
                currentCategoryTitle.textContent = activeCategory === 'ALL' ? 'Tất Cả Chủ Đề' : `Chuyên mục: ${activeCategory}`;
            }
        }
        if (articleCountBadge) {
            articleCountBadge.textContent = `${filtered.length} chủ đề`;
        }

        articleGrid.innerHTML = '';

        if (filtered.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <div class="empty-icon">🔍</div>
                    <h3>Không tìm thấy nội dung phù hợp</h3>
                    <p>Hãy thử tìm với từ khóa khác (không phân biệt dấu tiếng Việt) hoặc bấm nút <b>"➕ Thêm Chủ Đề Mới"</b>.</p>
                `;
            }
            return;
        }
        if (noResults) noResults.style.display = 'none';

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let displayTitle = escapeHtml(art.title || 'Chủ đề');
            let rawSnippet = trimmedQuery ? getMatchedSnippet(art.content, trimmedQuery) : (art.preview || "Nội dung bài viết...");
            let displaySnippet = escapeHtml(rawSnippet);

            if (trimmedQuery) {
                displayTitle = highlightText(displayTitle, trimmedQuery);
                displaySnippet = highlightText(displaySnippet, trimmedQuery);
            }

            card.innerHTML = `
                <div class="card-tags">
                    <span class="tag-cat">${escapeHtml(art.category)}</span>
                    ${art.isThread ? '<span class="tag-thread">Thread</span>' : ''}
                    <span class="tag-msg">💬 ${art.msgCount || 0} luận giải</span>
                </div>
                <h3 class="card-heading">${displayTitle}</h3>
                <p class="card-snippet">${displaySnippet}</p>
            `;

            card.onclick = () => openReaderView(art.id, searchQuery);
            articleGrid.appendChild(card);
        });
    }

    if (sortSelect) {
        sortSelect.onchange = (e) => {
            sortMode = e.target.value;
            renderArticleList();
        };
    }

    function highlightText(text, query) {
        if (!query || !query.trim()) return text;
        const q = query.trim();
        const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi');
        return text.replace(regex, '<mark class="search-hl">$1</mark>');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Parse Markdown Content into Individual Messages (Returns [] if 0 messages - Screenshot 1 Fix!)
    function parseMessagesFromContent(rawMarkdown) {
        if (!rawMarkdown) return [];

        const msgRegex = /###\s*\*\*([^*]+)\*\*\s*\(([^)]+)\)/g;

        let matches = [];
        let match;
        while ((match = msgRegex.exec(rawMarkdown)) !== null) {
            matches.push({
                index: match.index,
                fullMatch: match[0],
                author: match[1].trim(),
                timestamp: match[2].trim()
            });
        }

        // Return empty list if no messages exist yet!
        if (matches.length === 0) {
            return [];
        }

        let messagesList = [];
        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index + matches[i].fullMatch.length;
            const end = (i + 1 < matches.length) ? matches[i + 1].index : rawMarkdown.length;
            const body = rawMarkdown.substring(start, end).trim();

            messagesList.push({
                id: i,
                author: matches[i].author,
                timestamp: matches[i].timestamp,
                bodyText: body
            });
        }

        return messagesList;
    }

    // Separate text from markdown image URLs
    function extractTextAndImages(bodyMarkdown) {
        let text = bodyMarkdown || "";
        let images = [];

        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = imgRegex.exec(bodyMarkdown)) !== null) {
            images.push(match[2]);
        }

        text = text.replace(imgRegex, '').trim();
        return { text, images };
    }

    // Reader View & Interactive Message Rendering (Renders Empty Card State if 0 messages - Screenshot 1 Fix!)
    function openReaderView(id, activeSearchQuery = '') {
        const article = allArticles.find(a => a.id === id);
        if (!article) return;

        currentArticleId = id;
        if (readerCategory) readerCategory.textContent = article.category;
        if (readerTitle) readerTitle.textContent = article.title;
        
        if (readerThreadBadge) {
            if (article.isThread) {
                readerThreadBadge.style.display = 'inline-block';
                readerThreadBadge.textContent = `Thread thuộc #${article.parentChannel || 'Kênh'}`;
            } else {
                readerThreadBadge.style.display = 'none';
            }
        }

        renderReaderMessages(article, activeSearchQuery);

        if (heroBanner) heroBanner.style.display = 'none';
        if (listView) listView.classList.remove('active');
        if (readerView) readerView.classList.add('active');

        if (activeSearchQuery && activeSearchQuery.trim()) {
            setTimeout(() => {
                const firstMatch = readerContent.querySelector('.active-search-match') || readerContent.querySelector('.pulse-search-match');
                if (firstMatch) {
                    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function renderReaderMessages(article, activeSearchQuery = '') {
        const parsedMsgs = parseMessagesFromContent(article.content || '');
        if (readerMsgCount) readerMsgCount.textContent = `💬 ${parsedMsgs.length} luận giải`;

        if (!readerContent) return;
        readerContent.innerHTML = '';

        // Screenshot 1 Fix: Render Empty State if 0 messages!
        if (parsedMsgs.length === 0) {
            readerContent.innerHTML = `
                <div class="empty-card" style="padding: 40px 20px; border: none; background: transparent;">
                    <div class="empty-icon">📝</div>
                    <h3>Chủ đề chưa có luận giải nào</h3>
                    <p>Hãy gõ nội dung ở khung bên dưới để đăng đoạn luận giải đầu tiên cho chủ đề <b>"${escapeHtml(article.title)}"</b>!</p>
                </div>
            `;
            return;
        }

        const normSearchQuery = normalizeSearchText(activeSearchQuery);

        parsedMsgs.forEach((msg, idx) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg-block';
            msgDiv.setAttribute('data-msg-idx', idx);

            if (normSearchQuery) {
                const normBody = normalizeSearchText(msg.bodyText);
                if (normBody.includes(normSearchQuery)) {
                    msgDiv.classList.add('pulse-search-match');
                }
            }

            let renderedBody = "";
            try {
                if (window.marked && typeof window.marked.parse === 'function') {
                    renderedBody = window.marked.parse(msg.bodyText);
                } else {
                    renderedBody = escapeHtml(msg.bodyText).replace(/\n/g, '<br>');
                }
            } catch (err) {
                renderedBody = escapeHtml(msg.bodyText).replace(/\n/g, '<br>');
            }

            if (activeSearchQuery && activeSearchQuery.trim()) {
                const q = activeSearchQuery.trim();
                const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi');
                renderedBody = renderedBody.replace(regex, '<mark class="search-hl active-search-match">$1</mark>');
            }

            msgDiv.innerHTML = `
                <div class="msg-block-header">
                    <div class="msg-author-tag">
                        <span class="msg-author-name">${escapeHtml(msg.author)}</span>
                        <span class="msg-timestamp">${escapeHtml(msg.timestamp)}</span>
                    </div>
                    <div class="msg-actions">
                        <button class="btn-icon-sm edit-msg-btn" title="Sửa nội dung này">✏️ Sửa</button>
                        <button class="btn-icon-sm delete-msg-btn" style="color:#EF4444;" title="Xóa nội dung này">🗑️ Xóa</button>
                    </div>
                </div>
                <div class="msg-body markdown-body">${renderedBody}</div>
            `;

            // IN-PLACE INLINE EDITING
            const editBtn = msgDiv.querySelector('.edit-msg-btn');
            const msgBodyDiv = msgDiv.querySelector('.msg-body');

            if (editBtn && msgBodyDiv) {
                editBtn.onclick = () => {
                    if (msgDiv.classList.contains('editing')) return;
                    msgDiv.classList.add('editing');

                    const { text: cleanText, images: existingImages } = extractTextAndImages(msg.bodyText);
                    let editImagesList = [...existingImages];

                    msgBodyDiv.innerHTML = `
                        <div class="msg-inline-editor">
                            <textarea class="msg-inline-textarea" rows="4" placeholder="Nhập nội dung luận giải... (Có thể dán ảnh Ctrl+V hoặc bấm đính kèm ảnh phía dưới)">${escapeHtml(cleanText)}</textarea>
                            
                            <div class="msg-form-actions-row" style="margin-top:8px;">
                                <div class="file-upload-btn-wrapper">
                                    <label for="editMsgImgInput_${idx}" class="btn btn-outline-sm">📷 Đính kèm ảnh</label>
                                    <input type="file" id="editMsgImgInput_${idx}" accept="image/*" style="display: none;">
                                </div>
                                <div class="msg-inline-actions">
                                    <button type="button" class="btn btn-secondary cancel-inline-btn">Hủy</button>
                                    <button type="button" class="btn btn-primary save-inline-btn">Lưu chỉnh sửa</button>
                                </div>
                            </div>

                            <div class="image-preview-container edit-img-container_${idx}" style="display:${editImagesList.length > 0 ? 'flex' : 'none'};"></div>
                        </div>
                    `;

                    const textarea = msgBodyDiv.querySelector('.msg-inline-textarea');
                    const fileInput = msgBodyDiv.querySelector(`#editMsgImgInput_${idx}`);
                    const imgContainer = msgBodyDiv.querySelector(`.edit-img-container_${idx}`);
                    const saveInlineBtn = msgBodyDiv.querySelector('.save-inline-btn');
                    const cancelInlineBtn = msgBodyDiv.querySelector('.cancel-inline-btn');

                    function renderEditImages() {
                        if (!imgContainer) return;
                        imgContainer.innerHTML = '';
                        if (editImagesList.length === 0) {
                            imgContainer.style.display = 'none';
                            return;
                        }
                        imgContainer.style.display = 'flex';
                        editImagesList.forEach((url, i) => {
                            const thumb = document.createElement('div');
                            thumb.className = 'img-thumb-wrapper';
                            thumb.innerHTML = `
                                <img src="${url}" alt="Ảnh đính kèm">
                                <button type="button" class="img-remove-btn">&times;</button>
                            `;
                            thumb.querySelector('.img-remove-btn').onclick = () => {
                                editImagesList.splice(i, 1);
                                renderEditImages();
                            };
                            imgContainer.appendChild(thumb);
                        });
                    }

                    renderEditImages();
                    if (textarea) textarea.focus();

                    if (textarea) {
                        textarea.onpaste = (e) => {
                            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                            for (let item of items) {
                                if (item.kind === 'file' && item.type.startsWith('image/')) {
                                    const blob = item.getAsFile();
                                    compressImageFile(blob, 1200, 0.75, (compressedDataUrl) => {
                                        editImagesList.push(compressedDataUrl);
                                        renderEditImages();
                                    });
                                }
                            }
                        };
                    }

                    if (fileInput) {
                        fileInput.onchange = (e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                for (let file of files) {
                                    compressImageFile(file, 1200, 0.75, (compressedDataUrl) => {
                                        editImagesList.push(compressedDataUrl);
                                        renderEditImages();
                                    });
                                }
                            }
                        };
                    }

                    if (cancelInlineBtn) {
                        cancelInlineBtn.onclick = () => {
                            msgDiv.classList.remove('editing');
                            renderReaderMessages(article);
                        };
                    }

                    if (saveInlineBtn) {
                        saveInlineBtn.onclick = () => {
                            let updatedText = textarea.value.trim();
                            if (editImagesList.length > 0) {
                                editImagesList.forEach((imgUrl, i) => {
                                    updatedText += `\n\n![Ảnh đính kèm ${i+1}](${imgUrl})`;
                                });
                            }

                            if (updatedText) {
                                parsedMsgs[idx].bodyText = updatedText;
                                saveUpdatedMessagesToArticle(article, parsedMsgs);
                            }
                        };
                    }
                };
            }

            // Delete single message with MODERN CONFIRM MODAL
            const deleteBtn = msgDiv.querySelector('.delete-msg-btn');
            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    showCustomConfirm(
                        "🗑️ Xóa luận giải",
                        "Bạn có chắc chắn muốn xóa đoạn luận giải này không?",
                        () => {
                            parsedMsgs.splice(idx, 1);
                            saveUpdatedMessagesToArticle(article, parsedMsgs);
                        }
                    );
                };
            }

            readerContent.appendChild(msgDiv);
        });
    }

    function saveUpdatedMessagesToArticle(article, messagesList) {
        const headerText = `# ${article.category} / #${article.title}`;
        
        let newContent = headerText + '\n\n';
        messagesList.forEach(m => {
            newContent += `### **${m.author}** (\`${m.timestamp}\`)\n${m.bodyText}\n\n`;
        });

        article.content = newContent;
        article.msgCount = messagesList.length;
        article.preview = messagesList.length > 0 ? messagesList[0].bodyText.substring(0, 150) : "Chủ đề mới tạo...";

        let custIndex = customArticles.findIndex(a => a.id === article.id);
        if (custIndex >= 0) {
            customArticles[custIndex] = article;
        } else {
            customArticles.push(article);
        }
        localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));

        allArticles = getCombinedArticles();
        renderReaderMessages(article);
    }

    // Image Upload & Paste Handler (~100KB Auto Compression)
    function compressImageFile(file, maxWidth = 1200, quality = 0.75, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                callback(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderImagePreviews() {
        if (!imagePreviewContainer) return;
        imagePreviewContainer.innerHTML = '';
        if (pendingBase64Images.length === 0) {
            imagePreviewContainer.style.display = 'none';
            return;
        }
        imagePreviewContainer.style.display = 'flex';

        pendingBase64Images.forEach((imgUrl, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'img-thumb-wrapper';
            thumb.innerHTML = `
                <img src="${imgUrl}" alt="Ảnh đính kèm">
                <button type="button" class="img-remove-btn" data-index="${i}">&times;</button>
            `;
            thumb.querySelector('.img-remove-btn').onclick = () => {
                pendingBase64Images.splice(i, 1);
                renderImagePreviews();
            };
            imagePreviewContainer.appendChild(thumb);
        });
    }

    // Paste image Ctrl+V
    if (inlineMsgTextarea) {
        inlineMsgTextarea.onpaste = (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const blob = item.getAsFile();
                    compressImageFile(blob, 1200, 0.75, (compressedDataUrl) => {
                        pendingBase64Images.push(compressedDataUrl);
                        renderImagePreviews();
                    });
                }
            }
        };
    }

    // File input selection
    if (msgImageFileInput) {
        msgImageFileInput.onchange = (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                for (let file of files) {
                    compressImageFile(file, 1200, 0.75, (compressedDataUrl) => {
                        pendingBase64Images.push(compressedDataUrl);
                        renderImagePreviews();
                    });
                }
            }
        };
    }

    // Submit Inline Quick Add Message
    if (submitInlineMsgBtn) {
        submitInlineMsgBtn.onclick = () => {
            if (!currentArticleId) return;
            const article = allArticles.find(a => a.id === currentArticleId);
            if (!article) return;

            const text = inlineMsgTextarea ? inlineMsgTextarea.value.trim() : "";

            if (!text && pendingBase64Images.length === 0) {
                showCustomAlert("Chưa nhập nội dung", "Vui lòng nhập nội dung luận giải hoặc đính kèm ảnh!");
                return;
            }

            let newMsgBody = text;
            if (pendingBase64Images.length > 0) {
                pendingBase64Images.forEach((imgDataUrl, idx) => {
                    newMsgBody += `\n\n![Ảnh đính kèm ${idx+1}](${imgDataUrl})`;
                });
            }

            const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const newMsgFormatted = `### **${currentUsername}** (\`${nowStr}\`)\n${newMsgBody}\n\n`;

            article.content = (article.content || '').trim() + '\n\n' + newMsgFormatted;
            
            const parsedMsgs = parseMessagesFromContent(article.content);
            article.msgCount = parsedMsgs.length;

            let custIdx = customArticles.findIndex(a => a.id === article.id);
            if (custIdx >= 0) {
                customArticles[custIdx] = article;
            } else {
                customArticles.push(article);
            }
            localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));

            allArticles = getCombinedArticles();

            if (inlineMsgTextarea) inlineMsgTextarea.value = '';
            pendingBase64Images = [];
            renderImagePreviews();

            renderReaderMessages(article);
        };
    }

    // Category Modal with Strict DUPLICATE CHECKING
    if (addCategoryBtnSidebar) {
        addCategoryBtnSidebar.onclick = () => {
            if (categoryModal) categoryModal.classList.add('active');
            if (newCategoryTitleInput) newCategoryTitleInput.focus();
        };
    }
    if (closeCategoryModalBtn) closeCategoryModalBtn.onclick = () => categoryModal.classList.remove('active');
    if (cancelCategoryModalBtn) cancelCategoryModalBtn.onclick = () => categoryModal.classList.remove('active');
    if (categoryModalBackdrop) categoryModalBackdrop.onclick = () => categoryModal.classList.remove('active');

    if (categoryForm) {
        categoryForm.onsubmit = (e) => {
            e.preventDefault();
            const newCat = newCategoryTitleInput ? newCategoryTitleInput.value.trim() : "";
            if (!newCat) return;

            const normNewCat = normalizeSearchText(newCat);
            const existingCat = categories.find(c => normalizeSearchText(c) === normNewCat);

            if (existingCat) {
                showCustomAlert("Chuyên mục đã tồn tại", `Chuyên mục "${existingCat}" đã có trong danh sách! Đã chuyển sang chuyên mục này.`);
                selectCategory(existingCat);
                categoryModal.classList.remove('active');
                if (newCategoryTitleInput) newCategoryTitleInput.value = "";
                return;
            }

            defaultCategories.push(newCat);
            refreshCategories();
            renderNavigation();
            selectCategory(newCat);
            if (newCategoryTitleInput) newCategoryTitleInput.value = "";
            categoryModal.classList.remove('active');
        };
    }

    // Topic Modal with Strict DUPLICATE CHECKING
    function openTopicModal(articleToEdit = null) {
        renderNavigation();
        
        if (articleToEdit) {
            if (topicModalHeaderTitle) topicModalHeaderTitle.textContent = "✏️ Chỉnh Sửa Chủ Đề (Kênh)";
            if (saveTopicModalSubmitBtn) saveTopicModalSubmitBtn.textContent = "Lưu Chỉnh Sửa";
            if (editTopicId) editTopicId.value = articleToEdit.id;
            if (topicCategorySelect) topicCategorySelect.value = articleToEdit.category;
            if (newTopicTitleInput) newTopicTitleInput.value = articleToEdit.title;
        } else {
            if (topicModalHeaderTitle) topicModalHeaderTitle.textContent = "➕ Thêm Chủ Đề (Kênh) Mới";
            if (saveTopicModalSubmitBtn) saveTopicModalSubmitBtn.textContent = "Tạo Chủ Đề & Đăng Bài";
            if (editTopicId) editTopicId.value = "";
            
            let targetCat = categories[0] || "";
            if (activeCategory !== 'ALL' && categories.includes(activeCategory)) {
                targetCat = activeCategory;
            }
            if (topicCategorySelect) topicCategorySelect.value = targetCat;
            if (newTopicTitleInput) newTopicTitleInput.value = "";
        }

        if (newTopicTitleInput) newTopicTitleInput.focus();
        if (topicModal) topicModal.classList.add('active');
    }

    if (addChannelBtnCategory) addChannelBtnCategory.onclick = () => openTopicModal(null);
    if (navAddTopicBtn) navAddTopicBtn.onclick = () => openTopicModal(null);

    if (editTopicBtn) {
        editTopicBtn.onclick = () => {
            if (!currentArticleId) return;
            const article = allArticles.find(a => a.id === currentArticleId);
            if (article) {
                openTopicModal(article);
            }
        };
    }

    if (closeTopicModalBtn) closeTopicModalBtn.onclick = () => topicModal.classList.remove('active');
    if (cancelTopicModalBtn) cancelTopicModalBtn.onclick = () => topicModal.classList.remove('active');
    if (topicModalBackdrop) topicModalBackdrop.onclick = () => topicModal.classList.remove('active');

    if (topicForm) {
        topicForm.onsubmit = (e) => {
            e.preventDefault();
            const id = editTopicId ? editTopicId.value : "";
            const cat = topicCategorySelect ? topicCategorySelect.value.trim() : "";
            const title = newTopicTitleInput ? newTopicTitleInput.value.trim() : "";

            if (!cat || !title) {
                showCustomAlert("Thiếu thông tin", "Vui lòng nhập Tên Chủ Đề / Kênh!");
                return;
            }

            const normTitle = normalizeSearchText(title);
            let existingArticle = allArticles.find(a => a.category === cat && normalizeSearchText(a.title) === normTitle);

            // Duplicate Topic Check when creating new!
            if (!id && existingArticle) {
                showCustomAlert("Chủ đề đã tồn tại", `Chủ đề "${existingArticle.title}" đã có sẵn trong chuyên mục "${cat}". Đã mở chủ đề này cho bạn!`);
                topicModal.classList.remove('active');
                openReaderView(existingArticle.id);
                return;
            }

            let targetId = null;

            if (id) {
                let index = customArticles.findIndex(a => a.id === id);
                let targetArt = allArticles.find(a => a.id === id);

                if (targetArt) {
                    const parsedMsgs = parseMessagesFromContent(targetArt.content);
                    const updatedArt = {
                        ...targetArt,
                        id: id,
                        category: cat,
                        title: title,
                        channel: title
                    };
                    saveUpdatedMessagesToArticle(updatedArt, parsedMsgs);

                    if (index >= 0) {
                        customArticles[index] = updatedArt;
                    } else {
                        customArticles.push(updatedArt);
                    }
                    targetId = id;
                }
            } else {
                const newId = `custom_${Date.now()}`;
                const formattedContent = `# ${cat} / #${title}\n\n`;

                const newArt = {
                    id: newId,
                    category: cat,
                    channel: title,
                    title: title,
                    isThread: false,
                    msgCount: 0,
                    preview: "Chủ đề mới tạo...",
                    content: formattedContent
                };
                customArticles.push(newArt);
                targetId = newId;
            }

            try {
                localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));
            } catch (err) {}

            allArticles = getCombinedArticles();
            refreshCategories();
            selectCategory(cat);
            if (topicModal) topicModal.classList.remove('active');

            if (targetId) {
                openReaderView(targetId);
            }
        };
    }

    // Delete Topic with Modern Confirm Modal
    if (deleteArticleBtn) {
        deleteArticleBtn.onclick = () => {
            if (!currentArticleId) return;
            showCustomConfirm(
                "🗑️ Xóa Toàn Bộ Chủ Đề",
                "Bạn có chắc chắn muốn xóa toàn bộ chủ đề này khỏi thư viện?",
                () => {
                    deletedArticleIds.push(currentArticleId);
                    try {
                        localStorage.setItem('DELETED_ARTICLE_IDS', JSON.stringify(deletedArticleIds));
                    } catch (e) {}
                    
                    allArticles = getCombinedArticles();
                    refreshCategories();
                    renderNavigation();
                    renderArticleList();
                    showListView();
                }
            );
        };
    }

    if (downloadMdBtn) {
        downloadMdBtn.onclick = () => {
            if (!currentArticleId) return;
            const article = allArticles.find(a => a.id === currentArticleId);
            if (!article) return;

            const blob = new Blob([article.content], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(article.title || 'bai_viet').replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }

    if (exportBackupBtn) {
        exportBackupBtn.onclick = () => {
            const backupData = {
                exportDate: new Date().toISOString(),
                articles: allArticles,
                customArticles: customArticles
            };
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Backup_Huyen_Hoc_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }

    // Mobile Drawer Controls
    function openMobileSidebar() {
        if (appSidebar) appSidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }
    function closeMobileSidebar() {
        if (appSidebar) appSidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.onclick = openMobileSidebar;
    if (closeSidebarBtn) closeSidebarBtn.onclick = closeMobileSidebar;
    if (sidebarOverlay) sidebarOverlay.onclick = closeMobileSidebar;

    // Mobile Bottom Nav Buttons
    if (navHomeBtn) navHomeBtn.onclick = () => selectCategory('ALL');
    if (navCategoriesBtn) navCategoriesBtn.onclick = openMobileSidebar;
    if (navSearchFocusBtn) navSearchFocusBtn.onclick = () => {
        showListView();
        if (searchInput) searchInput.focus();
    };

    // Universal Global Search Input Logic
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            if (searchQuery.trim()) {
                activeCategory = 'ALL';
                renderNavigation();
            }
            renderArticleList();
            showListView();
        };
    }

    if (clearSearchBtn) {
        clearSearchBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            renderArticleList();
        };
    }

    if (backToListBtn) backToListBtn.onclick = showListView;

    // Initial Render Execution
    renderNavigation();
    renderArticleList();
    console.log("App initialization completed. Articles loaded:", allArticles.length);
}

// Ensure execution
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 1);
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
