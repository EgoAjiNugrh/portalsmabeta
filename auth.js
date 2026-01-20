// ===== PASSWORD CONFIGURATION =====
const PASSWORDS = {
    KEPSEK: 'Drm84',
    ADMIN: 'Darul84'
};

// ===== USER LEVELS =====
const USER_LEVELS = {
    GURU: 'guru',
    KEPSEK: 'kepsek',
    ADMIN: 'admin'
};

// ===== CURRENT USER STATE =====
let currentUser = null;

// ===== DOM ELEMENTS =====
let levelGuru, levelKepsek, levelAdmin;
let kepsekPasswordInput, adminPasswordInput;
let btnKepsek, btnAdmin;

// ===== INITIALIZATION =====
function initAuth() {
    // Get DOM elements
    levelGuru = document.getElementById('levelGuru');
    levelKepsek = document.getElementById('levelKepsek');
    levelAdmin = document.getElementById('levelAdmin');
    
    kepsekPasswordInput = document.getElementById('kepsekPassword');
    adminPasswordInput = document.getElementById('adminPassword');
    
    btnKepsek = document.getElementById('btnKepsek');
    btnAdmin = document.getElementById('btnAdmin');
    
    // Load saved user if exists
    const savedUser = localStorage.getItem('smaidrm_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        redirectBasedOnUser();
    }
    
    // Setup event listeners
    setupEventListeners();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Level selection
    if (levelGuru) levelGuru.addEventListener('click', () => selectLevel(USER_LEVELS.GURU));
    if (levelKepsek) levelKepsek.addEventListener('click', () => selectLevel(USER_LEVELS.KEPSEK));
    if (levelAdmin) levelAdmin.addEventListener('click', () => selectLevel(USER_LEVELS.ADMIN));
    
    // Login buttons
    if (btnKepsek) btnKepsek.addEventListener('click', (e) => {
        e.stopPropagation();
        showPasswordInput(USER_LEVELS.KEPSEK);
    });
    
    if (btnAdmin) btnAdmin.addEventListener('click', (e) => {
        e.stopPropagation();
        showPasswordInput(USER_LEVELS.ADMIN);
    });
}

// ===== LEVEL SELECTION =====
function selectLevel(level) {
    // Reset all selections
    [levelGuru, levelKepsek, levelAdmin].forEach(el => {
        if (el) el.style.borderColor = '#EEEEEE';
    });
    
    // Highlight selected
    if (level === USER_LEVELS.GURU && levelGuru) {
        levelGuru.style.borderColor = '#4FC3F7';
        loginAsGuru();
    } else if (level === USER_LEVELS.KEPSEK && levelKepsek) {
        levelKepsek.style.borderColor = '#4FC3F7';
    } else if (level === USER_LEVELS.ADMIN && levelAdmin) {
        levelAdmin.style.borderColor = '#4FC3F7';
    }
}

// ===== PASSWORD INPUT =====
function showPasswordInput(level) {
    // Hide all password inputs first
    if (kepsekPasswordInput) kepsekPasswordInput.style.display = 'none';
    if (adminPasswordInput) adminPasswordInput.style.display = 'none';
    
    // Show selected
    if (level === USER_LEVELS.KEPSEK && kepsekPasswordInput) {
        kepsekPasswordInput.style.display = 'flex';
        if (btnKepsek) btnKepsek.style.display = 'none';
        document.getElementById('inputKepsekPassword').focus();
    } else if (level === USER_LEVELS.ADMIN && adminPasswordInput) {
        adminPasswordInput.style.display = 'flex';
        if (btnAdmin) btnAdmin.style.display = 'none';
        document.getElementById('inputAdminPassword').focus();
    }
    
    // Select the level
    selectLevel(level);
}

function hidePasswordInput(level) {
    if (level === USER_LEVELS.KEPSEK && kepsekPasswordInput) {
        kepsekPasswordInput.style.display = 'none';
        if (btnKepsek) btnKepsek.style.display = 'block';
    } else if (level === USER_LEVELS.ADMIN && adminPasswordInput) {
        adminPasswordInput.style.display = 'none';
        if (btnAdmin) btnAdmin.style.display = 'block';
    }
}

// ===== LOGIN FUNCTIONS =====
function loginAsGuru() {
    currentUser = {
        level: USER_LEVELS.GURU,
        name: 'Guru',
        loginTime: new Date().toISOString()
    };
    
    saveUserAndRedirect();
}

function loginKepsek() {
    const password = document.getElementById('inputKepsekPassword').value;
    
    if (password !== PASSWORDS.KEPSEK) {
        alert('Password salah! Password Kepala Sekolah: Drm84');
        document.getElementById('inputKepsekPassword').value = '';
        document.getElementById('inputKepsekPassword').focus();
        return;
    }
    
    currentUser = {
        level: USER_LEVELS.KEPSEK,
        name: 'Kepala Sekolah',
        loginTime: new Date().toISOString()
    };
    
    saveUserAndRedirect();
}

function loginAdmin() {
    const password = document.getElementById('inputAdminPassword').value;
    
    if (password !== PASSWORDS.ADMIN) {
        alert('Password salah! Password Admin: Darul84');
        document.getElementById('inputAdminPassword').value = '';
        document.getElementById('inputAdminPassword').focus();
        return;
    }
    
    currentUser = {
        level: USER_LEVELS.ADMIN,
        name: 'Admin Super',
        loginTime: new Date().toISOString()
    };
    
    saveUserAndRedirect();
}

// ===== USER MANAGEMENT =====
function saveUserAndRedirect() {
    // Save to localStorage
    localStorage.setItem('smaidrm_current_user', JSON.stringify(currentUser));
    
    // Log login activity
    logActivity(`User ${currentUser.name} logged in as ${currentUser.level}`);
    
    // Redirect based on level
    redirectBasedOnUser();
}

function redirectBasedOnUser() {
    if (!currentUser) return;
    
    switch(currentUser.level) {
        case USER_LEVELS.GURU:
            window.location.href = 'index.html';
            break;
        case USER_LEVELS.KEPSEK:
            window.location.href = 'admin-panel.html?level=kepsek';
            break;
        case USER_LEVELS.ADMIN:
            window.location.href = 'admin-panel.html?level=admin';
            break;
    }
}

function logout() {
    // Log logout activity
    if (currentUser) {
        logActivity(`User ${currentUser.name} logged out`);
    }
    
    // Clear user data
    localStorage.removeItem('smaidrm_current_user');
    currentUser = null;
    
    // Redirect to login
    window.location.href = 'login.html';
}

// ===== ACTIVITY LOGGING =====
function logActivity(message) {
    const activity = {
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.name : 'Unknown',
        action: message,
        ip: 'localhost' // In real app, get from server
    };
    
    // Save to localStorage
    let logs = JSON.parse(localStorage.getItem('smaidrm_logs') || '[]');
    logs.unshift(activity);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs = logs.slice(0, 100);
    }
    
    localStorage.setItem('smaidrm_logs', JSON.stringify(logs));
}

// ===== UTILITY FUNCTIONS =====
function getCurrentUserLevel() {
    return currentUser ? currentUser.level : null;
}

function getUserDisplayName() {
    return currentUser ? currentUser.name : 'Pengunjung';
}

function checkPermission(requiredLevel) {
    const userLevel = getCurrentUserLevel();
    const levelHierarchy = {
        [USER_LEVELS.GURU]: 1,
        [USER_LEVELS.KEPSEK]: 2,
        [USER_LEVELS.ADMIN]: 3
    };
    
    if (!userLevel || levelHierarchy[userLevel] < levelHierarchy[requiredLevel]) {
        return false;
    }
    
    return true;
}

// ===== URL PARAMETER UTILS =====
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ===== INITIALIZE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// ===== EXPORTS (for admin-panel.html) =====
window.auth = {
    getCurrentUserLevel,
    getUserDisplayName,
    checkPermission,
    logout,
    USER_LEVELS
};