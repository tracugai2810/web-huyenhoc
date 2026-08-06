// ==========================================================================
// BÁCH KHOA HUYỀN HỌC - ZERO-DELAY OPTIMISTIC REALTIME SYNC ENGINE (V26)
// ==========================================================================

function initApp() {
    console.log("Initializing Bách Khoa Huyền Học App with Zero-Delay Optimistic UI & Cloud Sync...");

    // Official User's Google Firebase Cloud Database REST Endpoints
    const FIREBASE_BASE_URL = 'https://huyenhoc-wiki-default-rtdb.asia-southeast1.firebasedatabase.app';
    const FIREBASE_LOGS_URL = `${FIREBASE_BASE_URL}/logs.json`;
    const FIREBASE_ARTICLES_URL = `${FIREBASE_BASE_URL}/custom_articles.json`;
    const FIREBASE_CATEGORIES_URL = `${FIREBASE_BASE_URL}/custom_categories.json`;
    const FIREBASE_DELETED_URL = `${FIREBASE_BASE_URL}/deleted_article_ids.json`;
    const FIREBASE_DELETED_CATS_URL = `${FIREBASE_BASE_URL}/deleted_category_names.json`;

    // Write Lock Timestamp to prevent Stale GET Overwrites (Anti-Race Condition)
    let lastCloudWriteTime = 0;

    // Hanoi Timezone (GMT+7) Formatter (HH:mm:ss DD/MM/YYYY)
    function getVietnamTimeString() {
        try {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
            let day = '', month = '', year = '', hour = '', minute = '', second = '';
            for (const p of parts) {
                if (p.type === 'day') day = p.value;
                else if (p.type === 'month') month = p.value;
                else if (p.type === 'year') year = p.value;
                else if (p.type === 'hour') hour = p.value;
                else if (p.type === 'minute') minute = p.value;
                else if (p.type === 'second') second = p.value;
            }
            return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
        } catch (e) {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
        }
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
    
    const listView = document.getElementById('listView');
    const readerView = document.getElementById('readerView');
    
    const currentCategoryTitle = document.getElementById('currentCategoryTitle');
    const articleCountBadge = document.getElementById('articleCountBadge');
    const articleGrid = document.getElementById('articleGrid');
    const noResults = document.getElementById('noResults');
    const addChannelBtnCategory = document.getElementById('addChannelBtnCategory');
    const headerRightActions = document.getElementById('headerRightActions');

    const categoryActionsGroup = document.getElementById('categoryActionsGroup');
    const editCategoryBtn = document.getElementById('editCategoryBtn');
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

    const backToListBtnHeader = document.getElementById('backToListBtnHeader');
    const appBrandLogo = document.getElementById('appBrandLogo');
    
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
    const topicCategoryBadge = document.getElementById('topicCategoryBadge');
    const topicCategoryBadgeName = document.getElementById('topicCategoryBadgeName');
    const newTopicTitleInput = document.getElementById('newTopicTitleInput');
    const topicModalHeaderTitle = document.getElementById('topicModalHeaderTitle');
    const saveTopicModalSubmitBtn = document.getElementById('saveTopicModalSubmitBtn');
    const editTopicId = document.getElementById('editTopicId');

    // Custom Confirm Modal Elements
    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmBackdrop = document.getElementById('customConfirmBackdrop');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');
    const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');
    let onConfirmCallback = null;

    // Custom Input Modal Elements
    const customInputModal = document.getElementById('customInputModal');
    const customInputBackdrop = document.getElementById('customInputBackdrop');
    const inputModalTitle = document.getElementById('inputModalTitle');
    const inputModalMessage = document.getElementById('inputModalMessage');
    const customInputField = document.getElementById('customInputField');
    const inputModalCancelBtn = document.getElementById('inputModalCancelBtn');
    const customInputForm = document.getElementById('customInputForm');
    let onInputCallback = null;

    // Mandatory First-Time Visitor Verification Modal Elements (Mật khẩu 2810 & Nickname)
    const mandatoryNickModal = document.getElementById('mandatoryNickModal');
    const mandatoryNickForm = document.getElementById('mandatoryNickForm');
    const mandatoryPassInput = document.getElementById('mandatoryPassInput');
    const mandatoryNickInput = document.getElementById('mandatoryNickInput');
    const mandatoryPassError = document.getElementById('mandatoryPassError');

    // Activity Log & Bell Elements (Lịch sử thao tác đồng bộ toàn hệ thống)
    const activityBellBtn = document.getElementById('activityBellBtn');
    const activityBadgeCount = document.getElementById('activityBadgeCount');
    const activityLogModal = document.getElementById('activityLogModal');
    const activityLogBackdrop = document.getElementById('activityLogBackdrop');
    const activityLogBody = document.getElementById('activityLogBody');
    const closeActivityLogModalBtn = document.getElementById('closeActivityLogModalBtn');
    const cancelActivityLogModalBtn = document.getElementById('cancelActivityLogModalBtn');

    // Local Storage Activity Log Reader
    function getLocalActivityLogs() {
        try {
            return JSON.parse(localStorage.getItem('APP_ACTIVITY_LOGS') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Synchronize Real-Time System-Wide Activity Logs from Google Firebase Cloud API
    async function syncLogsFromCloud() {
        try {
            if (typeof fetch === 'function') {
                const res = await fetch(FIREBASE_LOGS_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    let cloudLogs = [];
                    if (Array.isArray(data)) {
                        cloudLogs = data;
                    } else if (data && typeof data === 'object') {
                        cloudLogs = Object.values(data);
                    }
                    if (cloudLogs.length > 0) {
                        if (cloudLogs.length > 20) cloudLogs = cloudLogs.slice(0, 20);
                        localStorage.setItem('APP_ACTIVITY_LOGS', JSON.stringify(cloudLogs));
                        updateActivityBadge();
                        return cloudLogs;
                    }
                }
            }
        } catch (err) {
            console.warn("Firebase Cloud log fetch warning:", err);
        }
        return getLocalActivityLogs();
    }

    // Log User Action & Push to Official Google Firebase Cloud
    async function logActivity(actionText) {
        const nowStr = getVietnamTimeString();
        const logItem = {
            time: nowStr,
            user: currentUsername || 'DBC',
            action: actionText
        };

        let currentLogs = getLocalActivityLogs();
        currentLogs.unshift(logItem);
        if (currentLogs.length > 20) currentLogs = currentLogs.slice(0, 20);

        try {
            localStorage.setItem('APP_ACTIVITY_LOGS', JSON.stringify(currentLogs));
        } catch (e) {}
        updateActivityBadge();

        // Asynchronously Update Google Firebase Cloud in background
        if (typeof fetch === 'function') {
            fetch(FIREBASE_LOGS_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(currentLogs)
            }).catch(err => console.warn("Firebase Cloud log PUT warning:", err));
        }
    }

    function updateActivityBadge() {
        const logs = getLocalActivityLogs();
        if (activityBadgeCount) {
            activityBadgeCount.textContent = logs.length;
            activityBadgeCount.style.display = logs.length > 0 ? 'inline-block' : 'none';
        }
    }

    async function renderActivityLogs() {
        if (!activityLogBody) return;
        activityLogBody.innerHTML = `
            <div style="text-align: center; padding: 24px 10px; color: var(--text-muted);">
                🔄 Đang tải nhật ký thao tác từ Google Firebase Cloud...
            </div>
        `;

        const logs = await syncLogsFromCloud();
        activityLogBody.innerHTML = '';

        if (logs.length === 0) {
            activityLogBody.innerHTML = `
                <div class="empty-card" style="padding: 30px 10px; border: none; background: transparent;">
                    <div class="empty-icon">🔔</div>
                    <p style="font-size: 13px; color: var(--text-muted);">Chưa có nhật ký thao tác nào trên hệ thống.</p>
                </div>
            `;
            return;
        }

        logs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'log-item';
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="log-user">👤 ${escapeHtml(log.user)}</span>
                    <span class="log-time">🕒 ${escapeHtml(log.time)}</span>
                </div>
                <div class="log-action">${escapeHtml(log.action)}</div>
            `;
            activityLogBody.appendChild(item);
        });
    }

    if (activityBellBtn) {
        activityBellBtn.onclick = () => {
            renderActivityLogs();
            if (activityLogModal) activityLogModal.classList.add('active');
        };
    }
    if (closeActivityLogModalBtn) closeActivityLogModalBtn.onclick = () => activityLogModal.classList.remove('active');
    if (cancelActivityLogModalBtn) cancelActivityLogModalBtn.onclick = () => activityLogModal.classList.remove('active');
    if (activityLogBackdrop) activityLogBackdrop.onclick = () => activityLogModal.classList.remove('active');

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

    // Custom Input Dialog Functions
    function showCustomInput(title, message, defaultValue, callback) {
        if (!customInputModal) {
            const val = prompt(message, defaultValue);
            if (val && val.trim()) callback(val.trim());
            return;
        }
        if (inputModalTitle) inputModalTitle.textContent = title || "Nhập thông tin";
        if (inputModalMessage) inputModalMessage.textContent = message;
        if (customInputField) {
            customInputField.value = defaultValue || '';
            if (typeof customInputField.focus === 'function') {
                setTimeout(() => customInputField.focus(), 100);
            }
        }
        onInputCallback = callback;
        customInputModal.classList.add('active');
    }

    function closeCustomInput() {
        if (customInputModal) customInputModal.classList.remove('active');
        onInputCallback = null;
    }

    if (inputModalCancelBtn) inputModalCancelBtn.onclick = closeCustomInput;
    if (customInputBackdrop) customInputBackdrop.onclick = closeCustomInput;
    if (customInputForm) {
        customInputForm.onsubmit = (e) => {
            e.preventDefault();
            const val = customInputField ? customInputField.value.trim() : '';
            if (val && typeof onInputCallback === 'function') {
                onInputCallback(val);
            }
            closeCustomInput();
        };
    }

    // Global Toast Notification Helper
    function showToast(message, type = 'success', duration = 3000) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;

        let icon = '✅';
        if (type === 'danger') icon = '🗑️';
        else if (type === 'warning') icon = '⚠️';
        else if (type === 'info') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Đóng">&times;</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        let timer = null;

        function dismiss() {
            if (timer) clearTimeout(timer);
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 280);
        }

        closeBtn.onclick = dismiss;
        timer = setTimeout(dismiss, duration);

        container.appendChild(toast);
    }

    // Image Upload Buffer
    let pendingBase64Images = [];

    // Persistent Username Setup & MANDATORY First-Time Visitor Password Verification (Mật khẩu 2810)
    let currentUsername = localStorage.getItem('PERSISTENT_USERNAME');
    let isAuth = localStorage.getItem('APP_AUTHENTICATED');

    function setUsername(newUsername) {
        if (!newUsername || !newUsername.trim()) return;
        currentUsername = newUsername.trim();
        localStorage.setItem('PERSISTENT_USERNAME', currentUsername);
        
        const displayUsername = document.getElementById('displayUsername');
        if (displayUsername) displayUsername.textContent = `Tác giả: ${currentUsername}`;

        const activeAuthorTag = document.getElementById('activeAuthorTag');
        if (activeAuthorTag) activeAuthorTag.textContent = `👤 Người viết: ${currentUsername}`;
    }

    // Mandatory Verification Check (Lần đầu vào web phải nhập Mật khẩu 2810 & Nickname)
    if (!isAuth || !currentUsername) {
        if (mandatoryNickModal) mandatoryNickModal.classList.add('active');
        if (mandatoryPassInput && typeof mandatoryPassInput.focus === 'function') {
            setTimeout(() => mandatoryPassInput.focus(), 150);
        }
    } else {
        setUsername(currentUsername);
    }

    if (mandatoryNickForm) {
        mandatoryNickForm.onsubmit = (e) => {
            e.preventDefault();
            const passVal = mandatoryPassInput ? mandatoryPassInput.value.trim() : '';
            const nickVal = mandatoryNickInput ? mandatoryNickInput.value.trim() : '';

            // Verify Password 2810
            if (passVal !== '2810') {
                if (mandatoryPassError) mandatoryPassError.style.display = 'block';
                return;
            }

            if (mandatoryPassError) mandatoryPassError.style.display = 'none';

            if (nickVal) {
                setUsername(nickVal);
                localStorage.setItem('APP_AUTHENTICATED', 'true');
                logActivity(`Xác thực mật khẩu & Đăng nhập Nickname tác giả mới: "${nickVal}"`);
                if (mandatoryNickModal) mandatoryNickModal.classList.remove('active');
                showToast(`Đăng nhập thành công! Chào mừng tác giả "${nickVal}"`, 'success');
            }
        };
    }

    if (userProfileCard) {
        userProfileCard.onclick = () => {
            showCustomInput(
                "👤 Đổi Nickname Tác Giả",
                "Nhập Tên tác giả / Nickname cố định của bạn:",
                currentUsername || "DBC",
                (val) => {
                    const oldNick = currentUsername;
                    setUsername(val);
                    logActivity(`Đổi Nickname từ "${oldNick}" thành "${val}"`);
                    showToast(`Đã đổi Nickname tác giả thành "${val}"`, 'info');
                }
            );
        };
    }

    // View Navigation Helpers & URL Hash Router Persistence
    function updateUrlHash(type, param = '') {
        if (window.history && typeof window.history.replaceState === 'function') {
            const cleanUrl = window.location.pathname + window.location.search;
            if (type === 'article') {
                window.history.replaceState(null, '', `#article/${param}`);
            } else if (type === 'search') {
                window.history.replaceState(null, '', `#search/${encodeURIComponent(param)}`);
            } else if (type === 'category' && param && param !== 'ALL') {
                window.history.replaceState(null, '', `#category/${encodeURIComponent(param)}`);
            } else {
                window.history.replaceState(null, '', cleanUrl);
            }
        }
    }

    function showListView() {
        if (readerView) readerView.classList.remove('active');
        if (listView) listView.classList.add('active');
        if (backToListBtnHeader) backToListBtnHeader.style.display = 'none';

        if (searchQuery.trim()) {
            updateUrlHash('search', searchQuery.trim());
        } else {
            updateUrlHash('category', activeCategory);
        }
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
            showToast(`Đã chuyển giao diện sang chế độ ${theme === 'dark' ? 'Tối 🌙' : 'Sáng ☀️'}`, 'info');
        };
    }

    // Data Initialization
    let defaultArticles = window.INITIAL_ARTICLES || [];
    let defaultCategories = window.INITIAL_CATEGORIES || [];

    let customArticles = [];
    let customCategories = [];
    let deletedArticleIds = [];
    let deletedCategoryNames = [];

    // Load local storage initial fallback
    try { customArticles = JSON.parse(localStorage.getItem('CUSTOM_ARTICLES') || '[]'); } catch (e) {}
    try { customCategories = JSON.parse(localStorage.getItem('CUSTOM_CATEGORIES') || '[]'); } catch (e) {}
    try { deletedArticleIds = JSON.parse(localStorage.getItem('DELETED_ARTICLE_IDS') || '[]'); } catch (e) {}
    try { deletedCategoryNames = JSON.parse(localStorage.getItem('DELETED_CATEGORY_NAMES') || '[]'); } catch (e) {}

    // Unified Master Realtime Cloud Synchronization Function across All Devices!
    async function syncAllFromCloud() {
        if (typeof fetch !== 'function') return;

        // Anti-Race Condition Guard: If local machine wrote to Cloud within 5 seconds, skip GET overwriting!
        if (Date.now() - lastCloudWriteTime < 5000) {
            return;
        }

        try {
            const [artRes, catRes, delRes, logRes, delCatRes] = await Promise.all([
                fetch(FIREBASE_ARTICLES_URL).catch(() => null),
                fetch(FIREBASE_CATEGORIES_URL).catch(() => null),
                fetch(FIREBASE_DELETED_URL).catch(() => null),
                fetch(FIREBASE_LOGS_URL).catch(() => null),
                fetch(FIREBASE_DELETED_CATS_URL).catch(() => null)
            ]);

            let hasChanged = false;

            // 1. Sync Deleted Article IDs
            if (delRes && delRes.ok) {
                const delData = await delRes.json();
                let cloudDel = [];
                if (Array.isArray(delData)) cloudDel = delData;
                else if (delData && typeof delData === 'object') cloudDel = Object.values(delData);

                if (Array.isArray(cloudDel) && JSON.stringify(cloudDel) !== JSON.stringify(deletedArticleIds)) {
                    deletedArticleIds = cloudDel;
                    localStorage.setItem('DELETED_ARTICLE_IDS', JSON.stringify(deletedArticleIds));
                    hasChanged = true;
                }
            }

            // 2. Sync Deleted Category Names
            if (delCatRes && delCatRes.ok) {
                const delCatData = await delCatRes.json();
                let cloudDelCats = [];
                if (Array.isArray(delCatData)) cloudDelCats = delCatData;
                else if (delCatData && typeof delCatData === 'object') cloudDelCats = Object.values(delCatData);

                if (Array.isArray(cloudDelCats) && JSON.stringify(cloudDelCats) !== JSON.stringify(deletedCategoryNames)) {
                    deletedCategoryNames = cloudDelCats;
                    localStorage.setItem('DELETED_CATEGORY_NAMES', JSON.stringify(deletedCategoryNames));
                    hasChanged = true;
                }
            }

            // 3. Sync Categories
            if (catRes && catRes.ok) {
                const catData = await catRes.json();
                let cloudCats = [];
                if (Array.isArray(catData)) cloudCats = catData;
                else if (catData && typeof catData === 'object') cloudCats = Object.values(catData);

                if (Array.isArray(cloudCats) && JSON.stringify(cloudCats) !== JSON.stringify(customCategories)) {
                    customCategories = cloudCats;
                    localStorage.setItem('CUSTOM_CATEGORIES', JSON.stringify(customCategories));
                    hasChanged = true;
                }
            }

            // 4. Sync Custom Articles
            if (artRes && artRes.ok) {
                const artData = await artRes.json();
                let cloudArts = [];
                if (Array.isArray(artData)) cloudArts = artData;
                else if (artData && typeof artData === 'object') cloudArts = Object.values(artData);

                if (Array.isArray(cloudArts) && JSON.stringify(cloudArts) !== JSON.stringify(customArticles)) {
                    customArticles = cloudArts;
                    localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(customArticles));
                    hasChanged = true;
                }
            }

            // 5. Sync Logs
            if (logRes && logRes.ok) {
                const logData = await logRes.json();
                let cloudLogs = [];
                if (Array.isArray(logData)) cloudLogs = logData;
                else if (logData && typeof logData === 'object') cloudLogs = Object.values(logData);
                if (cloudLogs.length > 0) {
                    if (cloudLogs.length > 20) cloudLogs = cloudLogs.slice(0, 20);
                    localStorage.setItem('APP_ACTIVITY_LOGS', JSON.stringify(cloudLogs));
                    updateActivityBadge();
                } else if (logData === null || (cloudLogs && cloudLogs.length === 0)) {
                    localStorage.setItem('APP_ACTIVITY_LOGS', JSON.stringify([]));
                    updateActivityBadge();
                }
            }

            // Re-render UI if Cloud state changed!
            if (hasChanged) {
                allArticles = getCombinedArticles();
                refreshCategories();
                renderNavigation();
                renderArticleList();

                if (currentArticleId) {
                    const activeArt = allArticles.find(a => a.id === currentArticleId);
                    if (activeArt) renderReaderMessages(activeArt);
                }
            }
        } catch (err) {
            console.warn("Unified Cloud sync warning:", err);
        }
    }

    // NON-BLOCKING BACKGROUND CLOUD PUSHES FOR 0MS INSTANT RESPONSIVENESS
    function saveCategoriesToCloud(catsList) {
        lastCloudWriteTime = Date.now();
        customCategories = catsList;
        try { localStorage.setItem('CUSTOM_CATEGORIES', JSON.stringify(catsList)); } catch (e) {}
        if (typeof fetch === 'function') {
            fetch(FIREBASE_CATEGORIES_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catsList)
            }).catch(e => {});
        }
    }

    function saveDeletedIdsToCloud(delList) {
        lastCloudWriteTime = Date.now();
        deletedArticleIds = delList;
        try { localStorage.setItem('DELETED_ARTICLE_IDS', JSON.stringify(delList)); } catch (e) {}
        if (typeof fetch === 'function') {
            fetch(FIREBASE_DELETED_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(delList)
            }).catch(e => {});
        }
    }

    function saveDeletedCategoryNamesToCloud(delCatsList) {
        lastCloudWriteTime = Date.now();
        deletedCategoryNames = delCatsList;
        try { localStorage.setItem('DELETED_CATEGORY_NAMES', JSON.stringify(delCatsList)); } catch (e) {}
        if (typeof fetch === 'function') {
            fetch(FIREBASE_DELETED_CATS_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(delCatsList)
            }).catch(e => {});
        }
    }

    function saveCustomArticlesToCloud(articlesList) {
        lastCloudWriteTime = Date.now();
        customArticles = articlesList;
        try { localStorage.setItem('CUSTOM_ARTICLES', JSON.stringify(articlesList)); } catch (e) {}
        if (typeof fetch === 'function') {
            fetch(FIREBASE_ARTICLES_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(articlesList)
            }).catch(err => console.warn("Firebase Cloud custom articles PUT warning:", err));
        }
    }

    function getCombinedArticles() {
        let articlesMap = new Map();
        
        defaultArticles.forEach(art => {
            if (art && art.id && !deletedArticleIds.includes(art.id) && (!art.category || !deletedCategoryNames.includes(art.category))) {
                articlesMap.set(art.id, art);
            }
        });

        customArticles.forEach(art => {
            if (art && art.id && !deletedArticleIds.includes(art.id) && (!art.category || !deletedCategoryNames.includes(art.category))) {
                articlesMap.set(art.id, art);
            }
        });

        return Array.from(articlesMap.values());
    }

    let allArticles = getCombinedArticles();
    let categories = [];

    function refreshCategories() {
        let catSet = new Set();

        defaultCategories.forEach(c => {
            if (c && !deletedCategoryNames.includes(c)) catSet.add(c);
        });

        customCategories.forEach(c => {
            if (c && !deletedCategoryNames.includes(c)) catSet.add(c);
        });

        allArticles.forEach(a => {
            if (a && a.category && !deletedCategoryNames.includes(a.category)) {
                catSet.add(a.category);
            }
        });

        categories = Array.from(catSet).sort();
    }
    refreshCategories();

    // App Navigation State
    let activeCategory = 'ALL';
    let searchQuery = '';
    let currentArticleId = null;

    // Smart Vietnamese Diacritics & Word Boundary Helper Functions
    function hasDiacritics(str) {
        return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(str);
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function buildSearchRegex(query) {
        const q = query.trim();
        const isAccented = hasDiacritics(q);
        const escaped = escapeRegExp(q);
        const vnCharPattern = 'a-zA-Z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ';
        
        if (isAccented) {
            // Strict exact accent & word boundary match
            return {
                isNormalized: false,
                regex: new RegExp(`(?:^|[^${vnCharPattern}])(${escaped})(?:$|[^${vnCharPattern}])`, 'gi')
            };
        } else {
            // Accent-insensitive word boundary match
            const normQ = normalizeSearchText(q);
            const normEscaped = escapeRegExp(normQ);
            return {
                isNormalized: true,
                regex: new RegExp(`(?:^|[^${vnCharPattern}])(${normEscaped})(?:$|[^${vnCharPattern}])`, 'gi')
            };
        }
    }

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

    // Extract ONLY matching message snippets with exact word/accent boundaries
    function getAllMatchedSnippets(articleContent, rawQuery, maxSnippets = 4) {
        if (!articleContent || !rawQuery || !rawQuery.trim()) return [];

        const msgs = parseMessagesFromContent(articleContent);
        const matcher = buildSearchRegex(rawQuery);
        let snippets = [];

        msgs.forEach((m, msgIdx) => {
            let isMatch = false;
            if (matcher.isNormalized) {
                const normBody = normalizeSearchText(m.bodyText);
                matcher.regex.lastIndex = 0;
                isMatch = matcher.regex.test(normBody);
            } else {
                matcher.regex.lastIndex = 0;
                isMatch = matcher.regex.test(m.bodyText);
            }

            if (isMatch) {
                let matchIdx = -1;
                if (matcher.isNormalized) {
                    const normBody = normalizeSearchText(m.bodyText);
                    matchIdx = normBody.indexOf(normalizeSearchText(rawQuery));
                } else {
                    matchIdx = m.bodyText.toLowerCase().indexOf(rawQuery.toLowerCase());
                }
                if (matchIdx < 0) matchIdx = 0;

                const start = Math.max(0, matchIdx - 35);
                const end = Math.min(m.bodyText.length, matchIdx + rawQuery.length + 65);

                let snipText = m.bodyText.substring(start, end).replace(/\n+/g, ' ').trim();
                if (start > 0) snipText = '... ' + snipText;
                if (end < m.bodyText.length) snipText = snipText + ' ...';

                snippets.push({
                    msgIdx: msgIdx,
                    snippet: snipText
                });
            }
        });

        return snippets.slice(0, maxSnippets);
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

        // Hero Stats & Activity Badge
        if (statArticlesCount) statArticlesCount.textContent = allArticles.length;
        if (statCategoryCount) statCategoryCount.textContent = categories.length;
        if (statSidebarArticles) statSidebarArticles.textContent = `Đã lưu ${allArticles.length} chủ đề`;
        updateActivityBadge();
    }

    // Select Category & AUTO-CLEAR SEARCH QUERY
    function selectCategory(cat) {
        activeCategory = cat;
        
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        document.body.classList.remove('is-searching');

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

    // Category Action Handlers with CUSTOM INPUT MODAL
    if (editCategoryBtn) {
        editCategoryBtn.onclick = () => {
            if (activeCategory === 'ALL') return;
            showCustomInput(
                "✏️ Sửa Tên Chuyên Mục",
                `Nhập tên mới cho chuyên mục "${activeCategory}":`,
                activeCategory,
                (newName) => {
                    if (!newName || newName === activeCategory) return;
                    const oldCat = activeCategory;

                    allArticles.forEach(art => {
                        if (art.category === activeCategory) {
                            art.category = newName;
                            const parsedMsgs = parseMessagesFromContent(art.content);
                            saveUpdatedMessagesToArticle(art, parsedMsgs);
                        }
                    });

                    // Add oldCat to deletedCategoryNames so defaultCategories won't bring oldCat back on refresh
                    if (!deletedCategoryNames.includes(oldCat)) {
                        deletedCategoryNames.push(oldCat);
                    }
                    saveDeletedCategoryNamesToCloud(deletedCategoryNames);

                    // Remove newName from deletedCategoryNames if it was previously deleted
                    const delIdx = deletedCategoryNames.indexOf(newName);
                    if (delIdx >= 0) {
                        deletedCategoryNames.splice(delIdx, 1);
                        saveDeletedCategoryNamesToCloud(deletedCategoryNames);
                    }

                    const idx = defaultCategories.indexOf(activeCategory);
                    if (idx >= 0) defaultCategories[idx] = newName;
                    
                    const cIdx = customCategories.indexOf(activeCategory);
                    if (cIdx >= 0) customCategories[cIdx] = newName;
                    else if (!customCategories.includes(newName)) customCategories.push(newName);

                    // OPTIMISTIC INSTANT UI UPDATES (0ms delay)
                    saveCategoriesToCloud(customCategories);
                    saveCustomArticlesToCloud(customArticles);
                    
                    allArticles = getCombinedArticles();
                    refreshCategories();
                    selectCategory(newName);
                    logActivity(`Đổi tên chuyên mục "${oldCat}" thành "${newName}"`);
                    showToast(`Đã đổi tên chuyên mục thành "${newName}"`, 'success');
                }
            );
        };
    }

    if (deleteCategoryBtn) {
        deleteCategoryBtn.onclick = () => {
            if (activeCategory === 'ALL') return;
            showCustomConfirm(
                "🗑️ Xóa Chuyên Mục",
                `Bạn có chắc chắn muốn xóa chuyên mục "${activeCategory}" và tất cả các chủ đề bên trong không?`,
                () => {
                    const deletedName = activeCategory;
                    const articlesToDelete = allArticles.filter(a => a.category === activeCategory);
                    articlesToDelete.forEach(art => {
                        if (!deletedArticleIds.includes(art.id)) {
                            deletedArticleIds.push(art.id);
                        }
                    });

                    saveDeletedIdsToCloud(deletedArticleIds);

                    // Mark activeCategory as deleted so defaultCategories won't bring it back on F5
                    if (!deletedCategoryNames.includes(deletedName)) {
                        deletedCategoryNames.push(deletedName);
                    }
                    saveDeletedCategoryNamesToCloud(deletedCategoryNames);

                    const catIdx = defaultCategories.indexOf(activeCategory);
                    if (catIdx >= 0) defaultCategories.splice(catIdx, 1);

                    const cIdx = customCategories.indexOf(activeCategory);
                    if (cIdx >= 0) customCategories.splice(cIdx, 1);

                    saveCategoriesToCloud(customCategories);

                    allArticles = getCombinedArticles();
                    refreshCategories();
                    logActivity(`Xóa chuyên mục "${deletedName}" (${articlesToDelete.length} chủ đề)`);
                    selectCategory('ALL');
                    showToast(`Đã xóa chuyên mục "${deletedName}"`, 'danger');
                }
            );
        };
    }

    // Render Article Grid List with Prioritized Exact Search Matching
    function renderArticleList() {
        if (!articleGrid) return;
        
        let filtered = allArticles;
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery !== '') {
            document.body.classList.add('is-searching');
            if (categoryActionsGroup) categoryActionsGroup.style.display = 'none';
            if (headerRightActions) headerRightActions.style.display = 'none';

            const matcher = buildSearchRegex(trimmedQuery);
            let matchedList = [];

            filtered.forEach(a => {
                let titleMatch = false;
                if (matcher.isNormalized) {
                    matcher.regex.lastIndex = 0;
                    titleMatch = matcher.regex.test(normalizeSearchText(a.title));
                } else {
                    matcher.regex.lastIndex = 0;
                    titleMatch = matcher.regex.test(a.title);
                }

                const matchedSnippets = getAllMatchedSnippets(a.content, trimmedQuery, 4);

                if (titleMatch || matchedSnippets.length > 0) {
                    matchedList.push({
                        article: a,
                        titleMatch: titleMatch,
                        snippets: matchedSnippets,
                        snippetCount: matchedSnippets.length
                    });
                }
            });

            // Priority Sorting Logic:
            // Rank 1: Title matches first
            // Rank 2: Higher snippet counts
            matchedList.sort((a, b) => {
                if (a.titleMatch && !b.titleMatch) return -1;
                if (!a.titleMatch && b.titleMatch) return 1;
                return b.snippetCount - a.snippetCount;
            });

            filtered = matchedList.map(item => ({
                ...item.article,
                matchedSnippets: item.snippets
            }));

        } else {
            document.body.classList.remove('is-searching');
            if (activeCategory !== 'ALL') {
                filtered = filtered.filter(a => a.category === activeCategory);
                if (categoryActionsGroup) categoryActionsGroup.style.display = 'inline-flex';
                if (headerRightActions) headerRightActions.style.display = 'flex';
            } else {
                if (categoryActionsGroup) categoryActionsGroup.style.display = 'none';
                if (headerRightActions) headerRightActions.style.display = 'none';
            }
        }

        if (currentCategoryTitle) {
            if (trimmedQuery) {
                currentCategoryTitle.textContent = `Kết quả tìm kiếm chính xác: "${trimmedQuery}"`;
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
                    <h3>Không tìm thấy chủ đề nào chứa đúng từ khóa "${escapeHtml(trimmedQuery)}"</h3>
                    <p>Hệ thống chỉ hiển thị kết quả khớp <b>chính xác đúng từ và đúng dấu</b>. Hãy thử tìm với từ khóa khác hoặc bấm nút <b>"➕ Tạo chủ đề"</b>.</p>
                `;
            }
            return;
        }
        if (noResults) noResults.style.display = 'none';

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let displayTitle = escapeHtml(art.title || 'Chủ đề');
            if (trimmedQuery) {
                displayTitle = highlightText(displayTitle, trimmedQuery);
            }

            card.innerHTML = `
                <div class="card-tags">
                    <span class="tag-cat">${escapeHtml(art.category)}</span>
                    ${art.isThread ? '<span class="tag-thread">Thread</span>' : ''}
                    <span class="tag-msg">💬 ${art.msgCount || 0} luận giải</span>
                </div>
                <h3 class="card-heading">${displayTitle}</h3>
            `;

            if (trimmedQuery) {
                const matchedSnippets = art.matchedSnippets || getAllMatchedSnippets(art.content, trimmedQuery, 4);
                if (matchedSnippets.length > 0) {
                    const snippetsListDiv = document.createElement('div');
                    snippetsListDiv.className = 'card-matched-snippets';

                    matchedSnippets.forEach(snipObj => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'snippet-item';
                        itemDiv.innerHTML = highlightText(escapeHtml(snipObj.snippet), trimmedQuery);
                        
                        itemDiv.onclick = (e) => {
                            e.stopPropagation();
                            openReaderView(art.id, searchQuery, snipObj.msgIdx);
                        };

                        snippetsListDiv.appendChild(itemDiv);
                    });

                    card.appendChild(snippetsListDiv);
                } else {
                    const p = document.createElement('p');
                    p.className = 'card-snippet';
                    p.innerHTML = highlightText(escapeHtml(art.preview || "Nội dung..."), trimmedQuery);
                    card.appendChild(p);
                }
            } else {
                const p = document.createElement('p');
                p.className = 'card-snippet';
                p.textContent = art.preview || "Nội dung bài viết...";
                card.appendChild(p);
            }

            card.onclick = () => openReaderView(art.id, searchQuery);
            articleGrid.appendChild(card);
        });
    }

    // SAFE HTML HIGHLIGHTER (NEVER REPLACES INSIDE HTML TAGS OR SRC ATTRIBUTES!)
    function highlightText(htmlText, query) {
        if (!query || !query.trim() || !htmlText) return htmlText;
        const q = query.trim();
        const escaped = escapeRegExp(q);
        const searchRegex = new RegExp(`(${escaped})`, 'gi');

        return htmlText.replace(/(<[^>]+>)|([^<]+)/g, (match, isTag, isText) => {
            if (isTag) {
                // Return HTML tags completely untouched (leaves <img src="data:image..."> safe!)
                return isTag;
            } else if (isText) {
                return isText.replace(searchRegex, '<mark class="search-hl">$1</mark>');
            }
            return match;
        });
    }

    // Parse Markdown Content into Individual Messages
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

    // Reader View & Interactive Message Rendering
    function openReaderView(id, activeSearchQuery = '', targetMsgIdx = null) {
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

        if (listView) listView.classList.remove('active');
        if (readerView) readerView.classList.add('active');

        // Show back button on the single global sticky search header!
        if (backToListBtnHeader) backToListBtnHeader.style.display = 'inline-flex';

        // Update URL Hash state for refresh persistence!
        updateUrlHash('article', id);

        if (targetMsgIdx !== null && targetMsgIdx !== undefined) {
            setTimeout(() => {
                const targetEl = readerContent.querySelector(`[data-msg-idx="${targetMsgIdx}"]`);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetEl.classList.add('pulse-search-match');
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 120);
        } else if (activeSearchQuery && activeSearchQuery.trim()) {
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

        parsedMsgs.forEach((msg, idx) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg-block';
            msgDiv.setAttribute('data-msg-idx', idx);

            if (activeSearchQuery && activeSearchQuery.trim()) {
                const matcher = buildSearchRegex(activeSearchQuery);
                let isMatch = false;
                if (matcher.isNormalized) {
                    matcher.regex.lastIndex = 0;
                    isMatch = matcher.regex.test(normalizeSearchText(msg.bodyText));
                } else {
                    matcher.regex.lastIndex = 0;
                    isMatch = matcher.regex.test(msg.bodyText);
                }
                if (isMatch) {
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
                renderedBody = highlightText(renderedBody, activeSearchQuery);
            }

            msgDiv.innerHTML = `
                <div class="msg-block-header">
                    <div class="msg-author-tag">
                        <span class="msg-author-name">${escapeHtml(msg.author)}</span>
                        <span class="msg-timestamp">${escapeHtml(msg.timestamp)}</span>
                    </div>
                    <div class="msg-actions">
                        <button class="btn-icon-sm edit-msg-btn" title="Sửa nội dung này"><span>✏️</span><span class="btn-text"> Sửa</span></button>
                        <button class="btn-icon-sm delete-msg-btn" style="color:#EF4444;" title="Xóa nội dung này"><span>🗑️</span><span class="btn-text"> Xóa</span></button>
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
                                    <label for="editMsgImgInput_${idx}" class="btn btn-outline-sm"><span>📷</span><span class="btn-text"> Đính kèm ảnh</span></label>
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
                                logActivity(`Sửa đoạn luận giải trong chủ đề "${article.title}"`);
                                showToast('Đã lưu chỉnh sửa đoạn luận giải', 'success');
                            }
                        };
                    }
                };
            }

            // Delete single message
            const deleteBtn = msgDiv.querySelector('.delete-msg-btn');
            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    showCustomConfirm(
                        "🗑️ Xóa luận giải",
                        "Bạn có chắc chắn muốn xóa đoạn luận giải này không?",
                        () => {
                            parsedMsgs.splice(idx, 1);
                            saveUpdatedMessagesToArticle(article, parsedMsgs);
                            logActivity(`Xóa đoạn luận giải trong chủ đề "${article.title}"`);
                            showToast('Đã xóa đoạn luận giải', 'danger');
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
        
        // INSTANT OPTIMISTIC UI RE-RENDER (0ms delay)
        saveCustomArticlesToCloud(customArticles);
        allArticles = getCombinedArticles();
        renderReaderMessages(article);
    }

    // Image Upload & Paste Handler (~50KB Auto Compression)
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
                        showToast('Đã dán đính kèm ảnh thành công', 'info');
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
                        showToast('Đã đính kèm ảnh thành công', 'info');
                    });
                }
            }
        };
    }

    // Submit Inline Quick Add Message with Hanoi Timezone Timestamp
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

            const hanoiTimeStr = getVietnamTimeString();
            const newMsgFormatted = `### **${currentUsername}** (\`${hanoiTimeStr}\`)\n${newMsgBody}\n\n`;

            article.content = (article.content || '').trim() + '\n\n' + newMsgFormatted;
            
            const parsedMsgs = parseMessagesFromContent(article.content);
            article.msgCount = parsedMsgs.length;

            let custIdx = customArticles.findIndex(a => a.id === article.id);
            if (custIdx >= 0) {
                customArticles[custIdx] = article;
            } else {
                customArticles.push(article);
            }
            
            // INSTANT OPTIMISTIC UI RE-RENDER (0ms delay)
            saveCustomArticlesToCloud(customArticles);
            allArticles = getCombinedArticles();

            if (inlineMsgTextarea) inlineMsgTextarea.value = '';
            pendingBase64Images = [];
            renderImagePreviews();

            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }

            logActivity(`Đăng luận giải mới vào chủ đề "${article.title}"`);
            showToast('Đã thêm luận giải mới thành công', 'success');
            renderReaderMessages(article);
        };
    }

    // Category Modal
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

            // Remove from deletedCategoryNames if it was previously deleted
            const delIdx = deletedCategoryNames.indexOf(newCat);
            if (delIdx >= 0) {
                deletedCategoryNames.splice(delIdx, 1);
                saveDeletedCategoryNamesToCloud(deletedCategoryNames);
            }

            if (!customCategories.includes(newCat)) {
                customCategories.push(newCat);
                saveCategoriesToCloud(customCategories);
            }

            // INSTANT OPTIMISTIC UI RE-RENDER (0ms delay)
            refreshCategories();
            renderNavigation();
            selectCategory(newCat);
            logActivity(`Tạo chuyên mục mới "${newCat}"`);
            showToast(`Đã tạo chuyên mục mới "${newCat}"`, 'success');
            if (newCategoryTitleInput) newCategoryTitleInput.value = "";
            categoryModal.classList.remove('active');
        };
    }

    // Streamlined Topic Modal
    function openTopicModal(articleToEdit = null) {
        renderNavigation();
        
        if (articleToEdit) {
            if (topicModalHeaderTitle) topicModalHeaderTitle.textContent = "✏️ Chỉnh Sửa Chủ Đề (Kênh)";
            if (saveTopicModalSubmitBtn) saveTopicModalSubmitBtn.textContent = "Lưu Chỉnh Sửa";
            if (editTopicId) editTopicId.value = articleToEdit.id;
            
            if (topicCategoryBadge) topicCategoryBadge.style.display = 'none';
            if (topicCategorySelect) {
                topicCategorySelect.style.display = 'block';
                topicCategorySelect.value = articleToEdit.category;
            }
            if (newTopicTitleInput) newTopicTitleInput.value = articleToEdit.title;
        } else {
            if (topicModalHeaderTitle) topicModalHeaderTitle.textContent = "➕ Thêm Chủ Đề Mới";
            if (saveTopicModalSubmitBtn) saveTopicModalSubmitBtn.textContent = "Tạo Chủ Đề";
            if (editTopicId) editTopicId.value = "";
            
            let targetCat = categories[0] || "";
            if (activeCategory !== 'ALL' && categories.includes(activeCategory)) {
                targetCat = activeCategory;
            }

            if (topicCategoryBadge && topicCategoryBadgeName) {
                topicCategoryBadge.style.display = 'flex';
                topicCategoryBadgeName.textContent = targetCat;
            }
            if (topicCategorySelect) {
                topicCategorySelect.style.display = 'none';
                topicCategorySelect.value = targetCat;
            }
            if (newTopicTitleInput) newTopicTitleInput.value = "";
        }

        if (newTopicTitleInput) newTopicTitleInput.focus();
        if (topicModal) topicModal.classList.add('active');
    }

    if (addChannelBtnCategory) addChannelBtnCategory.onclick = () => openTopicModal(null);

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
            
            let cat = "";
            if (id) {
                cat = topicCategorySelect ? topicCategorySelect.value.trim() : "";
            } else {
                cat = (activeCategory !== 'ALL' && categories.includes(activeCategory)) ? activeCategory : (topicCategorySelect ? topicCategorySelect.value.trim() : categories[0]);
            }
            
            const title = newTopicTitleInput ? newTopicTitleInput.value.trim() : "";

            if (!cat || !title) {
                showCustomAlert("Thiếu thông tin", "Vui lòng nhập Tên Chủ Đề / Kênh!");
                return;
            }

            const normTitle = normalizeSearchText(title);
            let existingArticle = allArticles.find(a => a.category === cat && normalizeSearchText(a.title) === normTitle);

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
                    logActivity(`Chỉnh sửa tên chủ đề thành "${title}"`);
                    showToast(`Đã cập nhật chủ đề "${title}"`, 'success');
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
                logActivity(`Tạo chủ đề mới "${title}" trong chuyên mục "${cat}"`);
                showToast(`Đã tạo chủ đề mới "${title}"`, 'success');
            }

            // INSTANT OPTIMISTIC UI RE-RENDER (0ms delay)
            saveCustomArticlesToCloud(customArticles);

            allArticles = getCombinedArticles();
            refreshCategories();
            selectCategory(cat);
            if (topicModal) topicModal.classList.remove('active');

            if (targetId) {
                openReaderView(targetId);
            }
        };
    }

    // Delete Topic
    if (deleteArticleBtn) {
        deleteArticleBtn.onclick = () => {
            if (!currentArticleId) return;
            const targetArt = allArticles.find(a => a.id === currentArticleId);
            const topicTitle = targetArt ? targetArt.title : '';

            showCustomConfirm(
                "🗑️ Xóa Toàn Bộ Chủ Đề",
                "Bạn có chắc chắn muốn xóa toàn bộ chủ đề này khỏi thư viện?",
                () => {
                    if (!deletedArticleIds.includes(currentArticleId)) {
                        deletedArticleIds.push(currentArticleId);
                    }
                    saveDeletedIdsToCloud(deletedArticleIds);

                    const custIdx = customArticles.findIndex(a => a.id === currentArticleId);
                    if (custIdx >= 0) {
                        customArticles.splice(custIdx, 1);
                        saveCustomArticlesToCloud(customArticles);
                    }

                    // INSTANT OPTIMISTIC UI RE-RENDER (0ms delay)
                    logActivity(`Xóa toàn bộ chủ đề "${topicTitle}"`);
                    showToast(`Đã xóa toàn bộ chủ đề "${topicTitle}"`, 'danger');
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
            logActivity(`Tải file .md bài viết "${article.title}"`);
            showToast(`Đã tải file Markdown bài viết "${article.title}"`, 'info');
        };
    }

    if (exportBackupBtn) {
        exportBackupBtn.onclick = () => {
            const backupData = {
                exportDate: getVietnamTimeString(),
                articles: allArticles,
                customArticles: customArticles,
                customCategories: customCategories,
                deletedArticleIds: deletedArticleIds,
                deletedCategoryNames: deletedCategoryNames
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
            logActivity(`Xuất dữ liệu sao lưu hệ thống`);
            showToast('Đã xuất dữ liệu sao lưu hệ thống', 'success');
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

    // SINGLE GLOBAL SEARCH INPUT LOGIC WITH KEYBOARD DISMISS ON ENTER
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }

            showListView();

            if (searchQuery.trim()) {
                activeCategory = 'ALL';
                renderNavigation();
            }
            renderArticleList();
        };

        searchInput.onkeydown = (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                if (typeof searchInput.blur === 'function') {
                    searchInput.blur();
                }
            }
        };
    }

    if (clearSearchBtn) {
        clearSearchBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            showListView();
            renderArticleList();
            showToast('Đã xóa từ khóa tìm kiếm', 'info');
        };
    }

    if (backToListBtnHeader) backToListBtnHeader.onclick = showListView;

    if (appBrandLogo) {
        appBrandLogo.onclick = () => {
            selectCategory('ALL');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // Sticky Title Scroll Indicator
    function handleStickyTitleScroll() {
        const titleEl = document.getElementById('readerTitle');
        if (!titleEl || !readerView || !readerView.classList.contains('active')) return;

        const searchSection = document.getElementById('globalStickySearchSection');
        if (!searchSection) return;

        const searchBottom = searchSection.getBoundingClientRect().bottom;
        const titleRect = titleEl.getBoundingClientRect();

        if (titleRect.top <= searchBottom + 4) {
            titleEl.classList.add('is-stuck');
        } else {
            titleEl.classList.remove('is-stuck');
        }
    }

    window.addEventListener('scroll', handleStickyTitleScroll, { passive: true });

    // RESTORE STATE FROM URL HASH ON PAGE LOAD / REFRESH!
    function restoreStateFromHash() {
        const hash = (window.location && window.location.hash) ? window.location.hash : '';
        if (hash.startsWith('#article/')) {
            const artId = hash.replace('#article/', '');
            const targetArt = allArticles.find(a => a.id === artId);
            if (targetArt) {
                openReaderView(artId);
                return true;
            }
        } else if (hash.startsWith('#search/')) {
            const queryVal = decodeURIComponent(hash.replace('#search/', ''));
            if (queryVal) {
                if (searchInput) searchInput.value = queryVal;
                searchQuery = queryVal;
                if (clearSearchBtn) clearSearchBtn.style.display = 'block';
                renderArticleList();
                showListView();
                return true;
            }
        } else if (hash.startsWith('#category/')) {
            const catVal = decodeURIComponent(hash.replace('#category/', ''));
            if (catVal && categories.includes(catVal)) {
                selectCategory(catVal);
                return true;
            }
        }
        return false;
    }

    renderNavigation();
    
    if (!restoreStateFromHash()) {
        renderArticleList();
    }

    // INITIAL UNIFIED CLOUD MASTER FETCH
    syncAllFromCloud();

    // AUTOMATIC LIVE REALTIME CLOUD SYNC POLLING ENGINE (Tự động đồng bộ Realtime ngầm mỗi 3 giây)
    setInterval(syncAllFromCloud, 3000);

    window.onhashchange = restoreStateFromHash;
    console.log("App initialization completed. Zero-Delay Optimistic UI Active. Articles loaded:", allArticles.length);
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
