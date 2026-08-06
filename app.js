// ==========================================================================
// KNOWLEDGE BASE APPLICATION LOGIC - FIXED EDITION (NO TDZ ERROR)
// ==========================================================================

function initApp() {
    console.log("Initializing Bách Khoa Huyền Học App...");

    // DOM Elements - Select all first
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarCategoryList = document.getElementById('sidebarCategoryList');
    const sidebarFilterInput = document.getElementById('sidebarFilterInput');
    
    const categoryPills = document.getElementById('categoryPills');
    const statArticlesCount = document.getElementById('statArticlesCount');
    const statCategoryCount = document.getElementById('statCategoryCount');
    
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

    const backToListBtn = document.getElementById('backToListBtn');
    const fontDecBtn = document.getElementById('fontDecBtn');
    const fontResetBtn = document.getElementById('fontResetBtn');
    const fontIncBtn = document.getElementById('fontIncBtn');
    
    const readerCategory = document.getElementById('readerCategory');
    const readerThreadBadge = document.getElementById('readerThreadBadge');
    const readerMsgCount = document.getElementById('readerMsgCount');
    const readerTitle = document.getElementById('readerTitle');
    const readerContent = document.getElementById('readerContent');
    
    const editArticleBtn = document.getElementById('editArticleBtn');
    const deleteArticleBtn = document.getElementById('deleteArticleBtn');
    const downloadMdBtn = document.getElementById('downloadMdBtn');

    const addArticleBtn = document.getElementById('addArticleBtn');
    const exportBackupBtn = document.getElementById('exportBackupBtn');
    
    const articleModal = document.getElementById('articleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const articleForm = document.getElementById('articleForm');
    const modalTitle = document.getElementById('modalTitle');
    const editArticleId = document.getElementById('editArticleId');
    const formCategory = document.getElementById('formCategory');
    const formTitle = document.getElementById('formTitle');
    const formContent = document.getElementById('formContent');
    const categorySuggestions = document.getElementById('categorySuggestions');

    // Bottom Nav Elements
    const navHomeBtn = document.getElementById('navHomeBtn');
    const navCategoriesBtn = document.getElementById('navCategoriesBtn');
    const navAddBtn = document.getElementById('navAddBtn');
    const navSearchFocusBtn = document.getElementById('navSearchFocusBtn');

    // 1. Theme Management (Light / Dark)
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

    // 2. Data Initialization
    let defaultArticles = window.INITIAL_ARTICLES || [];
    let defaultCategories = window.INITIAL_CATEGORIES || [];

    if (!window.INITIAL_ARTICLES || window.INITIAL_ARTICLES.length === 0) {
        console.warn("data_store.js not detected yet!");
    }

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

    // 3. Render Navigation Bars
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

        // Horizontal Category Pills
        if (categoryPills) {
            categoryPills.innerHTML = '';
            const allPill = document.createElement('button');
            allPill.className = `pill ${activeCategory === 'ALL' ? 'active' : ''}`;
            allPill.textContent = '🌐 Tất cả';
            allPill.onclick = () => selectCategory('ALL');
            categoryPills.appendChild(allPill);

            categories.forEach(cat => {
                const pill = document.createElement('button');
                pill.className = `pill ${activeCategory === cat ? 'active' : ''}`;
                pill.textContent = cat;
                pill.onclick = () => selectCategory(cat);
                categoryPills.appendChild(pill);
            });
        }

        // Modal Datalist
        if (categorySuggestions) {
            categorySuggestions.innerHTML = '';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                categorySuggestions.appendChild(opt);
            });
        }

        // Hero Stats
        if (statArticlesCount) statArticlesCount.textContent = allArticles.length;
        if (statCategoryCount) statCategoryCount.textContent = categories.length;
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

    // 4. Render Article List
    function renderArticleList() {
        if (!articleGrid) return;
        
        let filtered = allArticles;

        // Category Filter
        if (activeCategory !== 'ALL') {
            filtered = filtered.filter(a => a.category === activeCategory);
        }

        // Search Query Filter
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(a => {
                return (a.title && a.title.toLowerCase().includes(q)) ||
                       (a.category && a.category.toLowerCase().includes(q)) ||
                       (a.channel && a.channel.toLowerCase().includes(q)) ||
                       (a.content && a.content.toLowerCase().includes(q));
            });
        }

        // Sort Options
        if (sortMode === 'msgHigh') {
            filtered.sort((a, b) => (b.msgCount || 0) - (a.msgCount || 0));
        } else if (sortMode === 'titleAz') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        if (currentCategoryTitle) {
            currentCategoryTitle.textContent = activeCategory === 'ALL' ? 'Tất Cả Bài Viết' : `Chuyên mục: ${activeCategory}`;
        }
        if (articleCountBadge) {
            articleCountBadge.textContent = `${filtered.length} bài`;
        }

        articleGrid.innerHTML = '';

        if (filtered.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <div class="empty-icon">🔍</div>
                    <h3>Không tìm thấy nội dung phù hợp</h3>
                    <p>Hãy thử tìm lại với từ khóa khác hoặc chuyển sang chuyên mục khác.</p>
                `;
            }
            return;
        }
        if (noResults) noResults.style.display = 'none';

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let displayTitle = escapeHtml(art.title || 'Bài viết');
            let displaySnippet = escapeHtml(art.preview || "Nội dung bài viết...");

            if (searchQuery) {
                displayTitle = highlightText(displayTitle, searchQuery);
                displaySnippet = highlightText(displaySnippet, searchQuery);
            }

            card.innerHTML = `
                <div class="card-tags">
                    <span class="tag-cat">${escapeHtml(art.category)}</span>
                    ${art.isThread ? '<span class="tag-thread">Thread</span>' : ''}
                    <span class="tag-msg">💬 ${art.msgCount || 0} tin nhắn</span>
                </div>
                <h3 class="card-heading">${displayTitle}</h3>
                <p class="card-snippet">${displaySnippet}</p>
            `;

            card.onclick = () => openReaderView(art.id);
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
        if (!query) return text;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark class="search-hl">$1</mark>');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 5. Reader View & Controls
    function openReaderView(id) {
        const article = allArticles.find(a => a.id === id);
        if (!article) return;

        currentArticleId = id;
        if (readerCategory) readerCategory.textContent = article.category;
        if (readerTitle) readerTitle.textContent = article.title;
        if (readerMsgCount) readerMsgCount.textContent = `💬 ${article.msgCount || 0} tin nhắn`;

        if (readerThreadBadge) {
            if (article.isThread) {
                readerThreadBadge.style.display = 'inline-block';
                readerThreadBadge.textContent = `Thread thuộc #${article.parentChannel || 'Kênh'}`;
            } else {
                readerThreadBadge.style.display = 'none';
            }
        }

        let htmlContent = "";
        try {
            if (window.marked && typeof window.marked.parse === 'function') {
                htmlContent = window.marked.parse(article.content || '');
            } else {
                htmlContent = escapeHtml(article.content || '').replace(/\n/g, '<br>');
            }
        } catch (err) {
            console.error('Markdown parse error:', err);
            htmlContent = escapeHtml(article.content || '').replace(/\n/g, '<br>');
        }

        if (readerContent) readerContent.innerHTML = htmlContent;

        // Switch to reader panel
        if (heroBanner) heroBanner.style.display = 'none';
        if (listView) listView.classList.remove('active');
        if (readerView) readerView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showListView() {
        if (readerView) readerView.classList.remove('active');
        if (listView) listView.classList.add('active');
        if (heroBanner) heroBanner.style.display = 'block';
    }

    // Font Controls
    if (fontDecBtn) {
        fontDecBtn.onclick = () => {
            if (readerFontSize > 13) {
                readerFontSize -= 1;
                if (readerContent) readerContent.style.fontSize = `${readerFontSize}px`;
            }
        };
    }
    if (fontIncBtn) {
        fontIncBtn.onclick = () => {
            if (readerFontSize < 24) {
                readerFontSize += 1;
                if (readerContent) readerContent.style.fontSize = `${readerFontSize}px`;
            }
        };
    }
    if (fontResetBtn) {
        fontResetBtn.onclick = () => {
            readerFontSize = 16;
            if (readerContent) readerContent.style.fontSize = '16px';
        };
    }

    // 6. Modal Add / Edit Operations
    function openAddModal() {
        if (modalTitle) modalTitle.textContent = "➕ Thêm Bài Viết Mới";
        if (editArticleId) editArticleId.value = "";
        if (formCategory) formCategory.value = activeCategory !== 'ALL' ? activeCategory : "";
        if (formTitle) formTitle.value = "";
        if (formContent) formContent.value = "";
        if (articleModal) articleModal.classList.add('active');
    }

    function openEditModal() {
        if (!currentArticleId) return;
        const article = allArticles.find(a => a.id === currentArticleId);
        if (!article) return;

        if (modalTitle) modalTitle.textContent = "✏️ Chỉnh Sửa Bài Viết";
        if (editArticleId) editArticleId.value = article.id;
        if (formCategory) formCategory.value = article.category;
        if (formTitle) formTitle.value = article.title;
        if (formContent) formContent.value = article.content;
        if (articleModal) articleModal.classList.add('active');
    }

    function closeModal() {
        if (articleModal) articleModal.classList.remove('active');
    }

    if (articleForm) {
        articleForm.onsubmit = (e) => {
            e.preventDefault();
            const id = editArticleId ? editArticleId.value : "";
            const cat = formCategory ? formCategory.value.trim() : "";
            const title = formTitle ? formTitle.value.trim() : "";
            const content = formContent ? formContent.value.trim() : "";

            if (!cat || !title || !content) return;

            if (id) {
                let index = customArticles.findIndex(a => a.id === id);
                let targetArt = allArticles.find(a => a.id === id);
                
                const updatedArt = {
                    ...targetArt,
                    id: id,
                    category: cat,
                    title: title,
                    channel: title,
                    content: content,
                    preview: content.substring(0, 150)
                };

                if (index >= 0) {
                    customArticles[index] = updatedArt;
                } else {
                    customArticles.push(updatedArt);
                }
            } else {
                const newId = `custom_${Date.now()}`;
                const newArt = {
                    id: newId,
                    category: cat,
                    channel: title,
                    title: title,
                    isThread: false,
                    msgCount: 1,
                    preview: content.substring(0, 150),
                    content: `# ${cat} / #${title}\n\n${content}`
                };
                customArticles.push(newArt);
                currentArticleId = newId;
            }

            try {
                localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));
            } catch (err) {
                console.error('Cannot save to localStorage:', err);
            }
            
            allArticles = getCombinedArticles();
            refreshCategories();
            renderNavigation();
            renderArticleList();
            closeModal();

            if (currentArticleId) {
                openReaderView(currentArticleId);
            }
        };
    }

    if (deleteArticleBtn) {
        deleteArticleBtn.onclick = () => {
            if (!currentArticleId) return;
            if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
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

    // 7. Mobile Drawer & Navigation Controls
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
    if (navAddBtn) navAddBtn.onclick = openAddModal;
    if (navSearchFocusBtn) navSearchFocusBtn.onclick = () => {
        showListView();
        if (searchInput) searchInput.focus();
    };

    // Search Input Logic
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
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
    if (addArticleBtn) addArticleBtn.onclick = openAddModal;
    if (editArticleBtn) editArticleBtn.onclick = openEditModal;
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (cancelModalBtn) cancelModalBtn.onclick = closeModal;
    if (modalBackdrop) modalBackdrop.onclick = closeModal;

    // Initial Render Execution
    renderNavigation();
    renderArticleList();
    console.log("App initialization completed. Articles loaded:", allArticles.length);
}

// Ensure execution regardless of DOMReady event timing
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
