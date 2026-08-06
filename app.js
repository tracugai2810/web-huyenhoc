// ==========================================================================
// KNOWLEDGE BASE APPLICATION LOGIC - FULL INTERACTIVE EDITION
// ==========================================================================

function initApp() {
    console.log("Initializing Bách Khoa Huyền Học App...");

    // Select DOM Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarCategoryList = document.getElementById('sidebarCategoryList');
    const sidebarFilterInput = document.getElementById('sidebarFilterInput');
    const addCategoryBtnSidebar = document.getElementById('addCategoryBtnSidebar');
    
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
    
    const editArticleBtn = document.getElementById('editArticleBtn');
    const deleteArticleBtn = document.getElementById('deleteArticleBtn');
    const downloadMdBtn = document.getElementById('downloadMdBtn');

    const addArticleBtn = document.getElementById('addArticleBtn');
    const exportBackupBtn = document.getElementById('exportBackupBtn');
    
    // Inline Add Message Box Elements (Screenshot 3)
    const inlineMsgTextarea = document.getElementById('inlineMsgTextarea');
    const msgNicknameInput = document.getElementById('msgNicknameInput');
    const msgImageFileInput = document.getElementById('msgImageFileInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const submitInlineMsgBtn = document.getElementById('submitInlineMsgBtn');

    // Modals
    const articleModal = document.getElementById('articleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const articleForm = document.getElementById('articleForm');
    const modalTitle = document.getElementById('modalTitle');
    const editArticleId = document.getElementById('editArticleId');
    
    const formCategorySelect = document.getElementById('formCategorySelect');
    const formNewCategoryInput = document.getElementById('formNewCategoryInput');
    const formTitleSelect = document.getElementById('formTitleSelect');
    const formTitleInput = document.getElementById('formTitleInput');
    const formAuthorInput = document.getElementById('formAuthorInput');
    const formContent = document.getElementById('formContent');

    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    const cancelCategoryModalBtn = document.getElementById('cancelCategoryModalBtn');
    const categoryModalBackdrop = document.getElementById('categoryModalBackdrop');
    const categoryForm = document.getElementById('categoryForm');
    const newCategoryTitleInput = document.getElementById('newCategoryTitleInput');

    // Bottom Nav Elements
    const navHomeBtn = document.getElementById('navHomeBtn');
    const navCategoriesBtn = document.getElementById('navCategoriesBtn');
    const navAddBtn = document.getElementById('navAddBtn');
    const navSearchFocusBtn = document.getElementById('navSearchFocusBtn');

    // Image Upload Buffer
    let pendingBase64Images = [];

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

    // Restore last used Nickname
    if (msgNicknameInput) {
        msgNicknameInput.value = localStorage.getItem('LAST_NICKNAME') || 'DBC';
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

    // 3. Render Navigation Sidebar
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

        // Populate Category Dropdown Select in Modal
        if (formCategorySelect) {
            formCategorySelect.innerHTML = '';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = `📂 ${cat}`;
                formCategorySelect.appendChild(opt);
            });
            const newOpt = document.createElement('option');
            newOpt.value = '__CREATE_NEW__';
            newOpt.textContent = '➕ Tạo chuyên mục mới...';
            formCategorySelect.appendChild(newOpt);
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

    function refreshTitleDropdown(selectedCat) {
        if (!formTitleSelect) return;
        formTitleSelect.innerHTML = '';

        let catArticles = [];
        if (selectedCat && selectedCat !== '__CREATE_NEW__') {
            catArticles = allArticles.filter(a => a.category === selectedCat);
        }

        const createOpt = document.createElement('option');
        createOpt.value = '__CREATE_NEW_TITLE__';
        createOpt.textContent = '➕ Tạo tên chủ đề / kênh mới...';
        formTitleSelect.appendChild(createOpt);

        catArticles.forEach(art => {
            const opt = document.createElement('option');
            opt.value = art.title;
            opt.textContent = `📄 ${art.title}`;
            formTitleSelect.appendChild(opt);
        });

        if (catArticles.length === 0) {
            formTitleSelect.value = '__CREATE_NEW_TITLE__';
            if (formTitleInput) {
                formTitleInput.style.display = 'block';
                formTitleInput.required = true;
            }
        } else {
            formTitleSelect.value = catArticles[0].title;
            if (formTitleInput) {
                formTitleInput.style.display = 'none';
                formTitleInput.required = false;
            }
        }
    }

    if (formCategorySelect) {
        formCategorySelect.onchange = () => {
            const val = formCategorySelect.value;
            if (val === '__CREATE_NEW__') {
                if (formNewCategoryInput) {
                    formNewCategoryInput.style.display = 'block';
                    formNewCategoryInput.focus();
                }
            } else {
                if (formNewCategoryInput) {
                    formNewCategoryInput.style.display = 'none';
                    formNewCategoryInput.value = '';
                }
            }
            refreshTitleDropdown(val);
        };
    }

    if (formTitleSelect) {
        formTitleSelect.onchange = () => {
            const val = formTitleSelect.value;
            if (val === '__CREATE_NEW_TITLE__') {
                if (formTitleInput) {
                    formTitleInput.style.display = 'block';
                    formTitleInput.required = true;
                    formTitleInput.focus();
                }
            } else {
                if (formTitleInput) {
                    formTitleInput.style.display = 'none';
                    formTitleInput.required = false;
                    formTitleInput.value = '';
                }
            }
        };
    }

    // 4. Render Article List
    function renderArticleList() {
        if (!articleGrid) return;
        
        let filtered = allArticles;

        if (activeCategory !== 'ALL') {
            filtered = filtered.filter(a => a.category === activeCategory);
        }

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(a => {
                return (a.title && a.title.toLowerCase().includes(q)) ||
                       (a.category && a.category.toLowerCase().includes(q)) ||
                       (a.channel && a.channel.toLowerCase().includes(q)) ||
                       (a.content && a.content.toLowerCase().includes(q));
            });
        }

        if (sortMode === 'msgHigh') {
            filtered.sort((a, b) => (b.msgCount || 0) - (a.msgCount || 0));
        } else if (sortMode === 'titleAz') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        if (currentCategoryTitle) {
            currentCategoryTitle.textContent = activeCategory === 'ALL' ? 'Tất Cả Chủ Đề' : `Chuyên mục: ${activeCategory}`;
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
                    <h3>Không tìm thấy chủ đề nào</h3>
                    <p>Hãy thử chọn chuyên mục khác hoặc thêm chủ đề mới vào chuyên mục này.</p>
                `;
            }
            return;
        }
        if (noResults) noResults.style.display = 'none';

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let displayTitle = escapeHtml(art.title || 'Chủ đề');
            let displaySnippet = escapeHtml(art.preview || "Nội dung bài viết...");

            if (searchQuery) {
                displayTitle = highlightText(displayTitle, searchQuery);
                displaySnippet = highlightText(displaySnippet, searchQuery);
            }

            card.innerHTML = `
                <div class="card-tags">
                    <span class="tag-cat">${escapeHtml(art.category)}</span>
                    ${art.isThread ? '<span class="tag-thread">Thread</span>' : ''}
                    <span class="tag-msg">💬 ${art.msgCount || 1} luận giải</span>
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

    // 5. Parse Markdown Content into Individual Messages (Screenshot 2)
    function parseMessagesFromContent(rawMarkdown) {
        if (!rawMarkdown) return [];

        // Split messages by '### **[Author]** (`[Timestamp]`)' or '### **[Author]** ([Timestamp])'
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

        if (matches.length === 0) {
            // Single message fallback
            return [{
                id: 0,
                author: 'Tác giả',
                timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                bodyText: rawMarkdown
            }];
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

    // Re-build Markdown string from messages list
    function buildMarkdownFromMessages(headerPart, messagesList) {
        let lines = [];
        if (headerPart) {
            lines.append(headerPart.trim());
        }
        messagesList.forEach(m => {
            lines.push(`### **${m.author}** (\`${m.timestamp}\`)`);
            lines.push(m.bodyText);
            lines.push('');
        });
        return lines.join('\n\n');
    }

    // 6. Reader View & Interactive Message Rendering
    function openReaderView(id) {
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

        renderReaderMessages(article);

        if (heroBanner) heroBanner.style.display = 'none';
        if (listView) listView.classList.remove('active');
        if (readerView) readerView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderReaderMessages(article) {
        const parsedMsgs = parseMessagesFromContent(article.content || '');
        if (readerMsgCount) readerMsgCount.textContent = `💬 ${parsedMsgs.length} luận giải`;

        if (!readerContent) return;
        readerContent.innerHTML = '';

        parsedMsgs.forEach((msg, idx) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg-block';

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

            // Edit single message
            const editBtn = msgDiv.querySelector('.edit-msg-btn');
            if (editBtn) {
                editBtn.onclick = () => {
                    const newBody = prompt("Sửa nội dung luận giải:", msg.bodyText);
                    if (newBody !== null && newBody.trim() !== "") {
                        parsedMsgs[idx].bodyText = newBody.trim();
                        saveUpdatedMessagesToArticle(article, parsedMsgs);
                    }
                };
            }

            // Delete single message
            const deleteBtn = msgDiv.querySelector('.delete-msg-btn');
            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    if (confirm("Bạn có chắc chắn muốn xóa đoạn luận giải này?")) {
                        parsedMsgs.splice(idx, 1);
                        saveUpdatedMessagesToArticle(article, parsedMsgs);
                    }
                };
            }

            readerContent.appendChild(msgDiv);
        });
    }

    function saveUpdatedMessagesToArticle(article, messagesList) {
        // Extract original header lines (# Category / #Channel)
        let lines = (article.content || '').split('\n');
        let headerLines = [];
        for (let l of lines) {
            if (l.startsWith('# ') || l.startsWith('*Extracted') || l.startsWith('*Total') || l.startsWith('---')) {
                headerLines.push(l);
            } else if (l.startsWith('### **')) {
                break;
            }
        }
        let headerText = headerLines.join('\n');
        
        let newContent = headerText + '\n\n';
        messagesList.forEach(m => {
            newContent += `### **${m.author}** (\`${m.timestamp}\`)\n${m.bodyText}\n\n`;
        });

        article.content = newContent;
        article.msgCount = messagesList.length;
        article.preview = messagesList.length > 0 ? messagesList[0].bodyText.substring(0, 150) : "";

        // Overwrite or update in customArticles
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

    function showListView() {
        if (readerView) readerView.classList.remove('active');
        if (listView) listView.classList.active;
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

    // 7. Image Paste & Upload Handler with Auto Compression (~100KB) (Screenshot 3)
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

    // Paste image from Clipboard
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

    // File input image upload
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

    // 8. Submit Inline Quick Add Message (Screenshot 3)
    if (submitInlineMsgBtn) {
        submitInlineMsgBtn.onclick = () => {
            if (!currentArticleId) return;
            const article = allArticles.find(a => a.id === currentArticleId);
            if (!article) return;

            const text = inlineMsgTextarea ? inlineMsgTextarea.value.trim() : "";
            const nickname = msgNicknameInput ? msgNicknameInput.value.trim() || 'DBC' : 'DBC';

            if (!text && pendingBase64Images.length === 0) {
                alert("Vui lòng nhập nội dung luận giải hoặc đính kèm ảnh!");
                return;
            }

            localStorage.setItem('LAST_NICKNAME', nickname);

            // Construct body with text & embedded image tags
            let newMsgBody = text;
            if (pendingBase64Images.length > 0) {
                pendingBase64Images.forEach((imgDataUrl, idx) => {
                    newMsgBody += `\n\n![Ảnh đính kèm ${idx+1}](${imgDataUrl})`;
                });
            }

            const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const newMsgFormatted = `### **${nickname}** (\`${nowStr}\`)\n${newMsgBody}\n\n`;

            article.content = (article.content || '').trim() + '\n\n' + newMsgFormatted;
            
            const parsedMsgs = parseMessagesFromContent(article.content);
            article.msgCount = parsedMsgs.length;

            // Save to customArticles
            let custIdx = customArticles.findIndex(a => a.id === article.id);
            if (custIdx >= 0) {
                customArticles[custIdx] = article;
            } else {
                customArticles.push(article);
            }
            localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));

            allArticles = getCombinedArticles();

            // Clear inputs & preview
            if (inlineMsgTextarea) inlineMsgTextarea.value = '';
            pendingBase64Images = [];
            renderImagePreviews();

            // Re-render reader messages view
            renderReaderMessages(article);
        };
    }

    // 9. Add New Category Modal (Screenshot 4)
    if (addCategoryBtnSidebar) {
        addCategoryBtnSidebar.onclick = () => {
            if (categoryModal) categoryModal.classList.add('active');
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

            if (!categories.includes(newCat)) {
                defaultCategories.push(newCat);
                refreshCategories();
                renderNavigation();
                selectCategory(newCat);
            }
            if (newCategoryTitleInput) newCategoryTitleInput.value = "";
            categoryModal.classList.remove('active');
        };
    }

    // Header Category "+ Thêm Chủ Đề Mới" button (Screenshot 4)
    if (addChannelBtnCategory) {
        addChannelBtnCategory.onclick = () => {
            openAddModal();
        };
    }

    // 10. Topic Add/Edit Modal Submission
    function openAddModal() {
        renderNavigation();
        if (modalTitle) modalTitle.textContent = "➕ Thêm Bài Viết / Chủ Đề Mới";
        if (editArticleId) editArticleId.value = "";
        
        let targetCat = categories[0] || "";
        if (activeCategory !== 'ALL' && categories.includes(activeCategory)) {
            targetCat = activeCategory;
        }

        if (formCategorySelect) formCategorySelect.value = targetCat;
        if (formNewCategoryInput) {
            formNewCategoryInput.style.display = 'none';
            formNewCategoryInput.value = "";
        }

        refreshTitleDropdown(targetCat);

        if (formTitleInput) formTitleInput.value = "";
        if (formContent) formContent.value = "";
        if (formAuthorInput) formAuthorInput.value = localStorage.getItem('LAST_NICKNAME') || 'DBC';
        if (articleModal) articleModal.classList.add('active');
    }

    function openEditModal() {
        if (!currentArticleId) return;
        const article = allArticles.find(a => a.id === currentArticleId);
        if (!article) return;

        renderNavigation();
        if (modalTitle) modalTitle.textContent = "✏️ Chỉnh Sửa Chủ Đề / Kênh";
        if (editArticleId) editArticleId.value = article.id;
        
        if (formCategorySelect) {
            if (categories.includes(article.category)) {
                formCategorySelect.value = article.category;
                if (formNewCategoryInput) formNewCategoryInput.style.display = 'none';
            } else {
                formCategorySelect.value = '__CREATE_NEW__';
                if (formNewCategoryInput) {
                    formNewCategoryInput.style.display = 'block';
                    formNewCategoryInput.value = article.category;
                }
            }
        }

        refreshTitleDropdown(article.category);
        if (formTitleSelect) {
            formTitleSelect.value = article.title;
            if (formTitleSelect.value !== article.title) {
                formTitleSelect.value = '__CREATE_NEW_TITLE__';
                if (formTitleInput) {
                    formTitleInput.style.display = 'block';
                    formTitleInput.value = article.title;
                }
            } else {
                if (formTitleInput) formTitleInput.style.display = 'none';
            }
        }
        
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
            
            let cat = "";
            if (formCategorySelect) {
                if (formCategorySelect.value === '__CREATE_NEW__') {
                    cat = formNewCategoryInput ? formNewCategoryInput.value.trim() : "";
                } else {
                    cat = formCategorySelect.value.trim();
                }
            }

            let title = "";
            if (formTitleSelect) {
                if (formTitleSelect.value === '__CREATE_NEW_TITLE__') {
                    title = formTitleInput ? formTitleInput.value.trim() : "";
                } else {
                    title = formTitleSelect.value.trim();
                }
            }

            const author = formAuthorInput ? formAuthorInput.value.trim() || 'DBC' : 'DBC';
            const contentText = formContent ? formContent.value.trim() : "";

            if (!cat || !title || !contentText) {
                alert("Vui lòng điền đầy đủ Chuyên mục, Tiêu đề và Nội dung!");
                return;
            }

            localStorage.setItem('LAST_NICKNAME', author);

            // Check if an existing article with exact same category & title exists
            let existingArticle = allArticles.find(a => a.category === cat && a.title === title);

            if (id) {
                // Editing specific article
                let index = customArticles.findIndex(a => a.id === id);
                let targetArt = allArticles.find(a => a.id === id);
                
                const updatedArt = {
                    ...targetArt,
                    id: id,
                    category: cat,
                    title: title,
                    channel: title,
                    content: contentText,
                    preview: contentText.substring(0, 150)
                };

                if (index >= 0) {
                    customArticles[index] = updatedArt;
                } else {
                    customArticles.push(updatedArt);
                }
                currentArticleId = id;
            } else if (existingArticle) {
                // Append message to existing article channel (Screenshot 1 solution!)
                const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
                const newMsgFormatted = `### **${author}** (\`${nowStr}\`)\n${contentText}\n\n`;

                existingArticle.content = (existingArticle.content || '').trim() + '\n\n' + newMsgFormatted;
                const parsedMsgs = parseMessagesFromContent(existingArticle.content);
                existingArticle.msgCount = parsedMsgs.length;

                let custIdx = customArticles.findIndex(a => a.id === existingArticle.id);
                if (custIdx >= 0) {
                    customArticles[custIdx] = existingArticle;
                } else {
                    customArticles.push(existingArticle);
                }
                currentArticleId = existingArticle.id;
            } else {
                // Create new article topic
                const newId = `custom_${Date.now()}`;
                const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
                const formattedContent = `# ${cat} / #${title}\n\n### **${author}** (\`${nowStr}\`)\n${contentText}\n`;

                const newArt = {
                    id: newId,
                    category: cat,
                    channel: title,
                    title: title,
                    isThread: false,
                    msgCount: 1,
                    preview: contentText.substring(0, 150),
                    content: formattedContent
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
            selectCategory(cat);
            closeModal();

            if (currentArticleId) {
                openReaderView(currentArticleId);
            }
        };
    }

    if (deleteArticleBtn) {
        deleteArticleBtn.onclick = () => {
            if (!currentArticleId) return;
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ chủ đề này không?")) {
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

    // Mobile Drawer & Navigation Controls
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
