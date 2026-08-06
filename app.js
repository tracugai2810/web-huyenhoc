// ==========================================================================
// KNOWLEDGE BASE APPLICATION LOGIC - PREMIUM EDITION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Management (Light / Dark)
    const currentTheme = localStorage.getItem('APP_THEME') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    themeToggleBtn.onclick = () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('APP_THEME', theme);
        updateThemeIcon(theme);
    };

    function updateThemeIcon(theme) {
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // 2. Data State Initialization
    let defaultArticles = window.INITIAL_ARTICLES || [];

    let customArticles = JSON.parse(localStorage.getItem('CUSTOM_ARTICLES') || '[]');
    let deletedArticleIds = JSON.parse(localStorage.getItem('DELETED_ARTICLE_IDS') || '[]');

    function getCombinedArticles() {
        let articlesMap = new Map();
        
        defaultArticles.forEach(art => {
            if (!deletedArticleIds.includes(art.id)) {
                articlesMap.set(art.id, art);
            }
        });

        customArticles.forEach(art => {
            if (!deletedArticleIds.includes(art.id)) {
                articlesMap.set(art.id, art);
            }
        });

        return Array.from(articlesMap.values());
    }

    let allArticles = getCombinedArticles();
    let categories = [];

    function refreshCategories() {
        let catSet = new Set(window.INITIAL_CATEGORIES || []);
        allArticles.forEach(a => {
            if (a.category) catSet.add(a.category);
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

    // DOM Elements
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

    // Bottom Nav Buttons
    const navHomeBtn = document.getElementById('navHomeBtn');
    const navCategoriesBtn = document.getElementById('navCategoriesBtn');
    const navAddBtn = document.getElementById('navAddBtn');
    const navSearchFocusBtn = document.getElementById('navSearchFocusBtn');

    // 3. Render Navigation Bars
    function renderNavigation(filterFilterText = '') {
        sidebarCategoryList.innerHTML = '';
        
        let filteredCats = categories;
        if (filterFilterText.trim()) {
            const f = filterFilterText.toLowerCase();
            filteredCats = categories.filter(c => c.toLowerCase().includes(f));
        }

        // "Tất cả" Sidebar Item
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

        // Horizontal Category Pills
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

        // Modal Datalist
        categorySuggestions.innerHTML = '';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            categorySuggestions.appendChild(opt);
        });

        // Hero Stats
        statArticlesCount.textContent = allArticles.length;
        statCategoryCount.textContent = categories.length;
    }

    function selectCategory(cat) {
        activeCategory = cat;
        renderNavigation(sidebarFilterInput ? sidebarFilterInput.value : '');
        renderArticleList();
        closeMobileSidebar();
        showListView();
    }

    sidebarFilterInput.oninput = (e) => {
        renderNavigation(e.target.value);
    };

    // 4. Render Article List
    function renderArticleList() {
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
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        currentCategoryTitle.textContent = activeCategory === 'ALL' ? 'Tất Cả Bài Viết' : `Chuyên mục: ${activeCategory}`;
        articleCountBadge.textContent = `${filtered.length} bài`;

        articleGrid.innerHTML = '';

        if (filtered.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let displayTitle = escapeHtml(art.title);
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

    sortSelect.onchange = (e) => {
        sortMode = e.target.value;
        renderArticleList();
    };

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
        readerCategory.textContent = article.category;
        readerTitle.textContent = article.title;
        readerMsgCount.textContent = `💬 ${article.msgCount || 0} tin nhắn`;

        if (article.isThread) {
            readerThreadBadge.style.display = 'inline-block';
            readerThreadBadge.textContent = `Thread thuộc #${article.parentChannel || 'Kênh'}`;
        } else {
            readerThreadBadge.style.display = 'none';
        }

        let htmlContent = "";
        if (window.marked && typeof window.marked.parse === 'function') {
            htmlContent = window.marked.parse(article.content);
        } else {
            htmlContent = escapeHtml(article.content).replace(/\n/g, '<br>');
        }

        readerContent.innerHTML = htmlContent;

        // Switch to reader panel
        heroBanner.style.display = 'none';
        listView.classList.remove('active');
        readerView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showListView() {
        readerView.classList.remove('active');
        listView.classList.add('active');
        heroBanner.style.display = 'block';
    }

    // Font Controls
    fontDecBtn.onclick = () => {
        if (readerFontSize > 13) {
            readerFontSize -= 1;
            readerContent.style.fontSize = `${readerFontSize}px`;
        }
    };
    fontIncBtn.onclick = () => {
        if (readerFontSize < 24) {
            readerFontSize += 1;
            readerContent.style.fontSize = `${readerFontSize}px`;
        }
    };
    fontResetBtn.onclick = () => {
        readerFontSize = 16;
        readerContent.style.fontSize = '16px';
    };

    // 6. Modal Add / Edit Operations
    function openAddModal() {
        modalTitle.textContent = "➕ Thêm Bài Viết Mới";
        editArticleId.value = "";
        formCategory.value = activeCategory !== 'ALL' ? activeCategory : "";
        formTitle.value = "";
        formContent.value = "";
        articleModal.classList.add('active');
    }

    function openEditModal() {
        if (!currentArticleId) return;
        const article = allArticles.find(a => a.id === currentArticleId);
        if (!article) return;

        modalTitle.textContent = "✏️ Chỉnh Sửa Bài Viết";
        editArticleId.value = article.id;
        formCategory.value = article.category;
        formTitle.value = article.title;
        formContent.value = article.content;
        articleModal.classList.add('active');
    }

    function closeModal() {
        articleModal.classList.remove('active');
    }

    articleForm.onsubmit = (e) => {
        e.preventDefault();
        const id = editArticleId.value;
        const cat = formCategory.value.trim();
        const title = formTitle.value.trim();
        const content = formContent.value.trim();

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

        localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));
        
        allArticles = getCombinedArticles();
        refreshCategories();
        renderNavigation();
        renderArticleList();
        closeModal();

        if (currentArticleId) {
            openReaderView(currentArticleId);
        }
    };

    deleteArticleBtn.onclick = () => {
        if (!currentArticleId) return;
        if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            deletedArticleIds.push(currentArticleId);
            localStorage.setItem('DELETED_ARTICLE_IDS', JSON.stringify(deletedArticleIds));
            
            allArticles = getCombinedArticles();
            refreshCategories();
            renderNavigation();
            renderArticleList();
            showListView();
        }
    };

    downloadMdBtn.onclick = () => {
        if (!currentArticleId) return;
        const article = allArticles.find(a => a.id === currentArticleId);
        if (!article) return;

        const blob = new Blob([article.content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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

    // 7. Mobile Drawer & Navigation Controls
    function openMobileSidebar() {
        appSidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    }
    function closeMobileSidebar() {
        appSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    mobileMenuBtn.onclick = openMobileSidebar;
    closeSidebarBtn.onclick = closeMobileSidebar;
    sidebarOverlay.onclick = closeMobileSidebar;

    // Mobile Bottom Nav
    if (navHomeBtn) navHomeBtn.onclick = () => selectCategory('ALL');
    if (navCategoriesBtn) navCategoriesBtn.onclick = openMobileSidebar;
    if (navAddBtn) navAddBtn.onclick = openAddModal;
    if (navSearchFocusBtn) navSearchFocusBtn.onclick = () => {
        showListView();
        searchInput.focus();
    };

    // Search Input Logic
    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        if (searchQuery) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        renderArticleList();
        showListView();
    };

    clearSearchBtn.onclick = () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderArticleList();
    };

    backToListBtn.onclick = showListView;
    addArticleBtn.onclick = openAddModal;
    editArticleBtn.onclick = openEditModal;
    closeModalBtn.onclick = closeModal;
    cancelModalBtn.onclick = closeModal;
    modalBackdrop.onclick = closeModal;

    // Initial Load
    renderNavigation();
    renderArticleList();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
