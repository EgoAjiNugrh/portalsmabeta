// ===== GLOBAL VARIABLES =====
let adminData = null;
let currentUserLevel = null;
let unsavedChanges = false;

// ===== INITIALIZATION =====
function initAdminPanel() {
    // Check authentication
    checkAuthentication();
    
    // Load data
    loadAdminData();
    
    // Setup UI based on user level
    setupUIForUserLevel();
    
    // Load all sections
    loadDashboardStats();
    loadQuickEditSection();
    loadGuruIzinSection();
    loadGuruPiketSection();
    loadKepsekInfoSection();
    loadAgendaSection();
    loadPengumumanSection();
    loadBackupSection();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show admin container
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
    
    // Auto-save reminder
    setInterval(checkUnsavedChanges, 30000);
}

// ===== AUTHENTICATION =====
function checkAuthentication() {
    const savedUser = localStorage.getItem('smaidrm_current_user');
    if (!savedUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(savedUser);
    currentUserLevel = user.level;
    
    // Update UI with user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userLevel').textContent = getLevelDisplay(user.level);
    document.getElementById('welcomeName').textContent = user.name;
    document.getElementById('welcomeLevel').textContent = getLevelDisplay(user.level);
    document.getElementById('welcomeLevel').className = 'level-badge ' + user.level;
    
    // Check URL parameter for level override
    const urlLevel = getUrlParameter('level');
    if (urlLevel && urlLevel !== user.level) {
        alert('Akses tidak sesuai! Redirecting...');
        window.location.href = 'login.html';
    }
}

function getLevelDisplay(level) {
    switch(level) {
        case 'guru': return 'Guru';
        case 'kepsek': return 'Kepala Sekolah';
        case 'admin': return 'Admin Super';
        default: return 'Unknown';
    }
}

function logout() {
    if (unsavedChanges && !confirm('Ada perubahan yang belum disimpan. Yakin ingin logout?')) {
        return;
    }
    
    // Clear user session
    localStorage.removeItem('smaidrm_current_user');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// ===== DATA MANAGEMENT =====
function loadAdminData() {
    const data = localStorage.getItem('smaidrm_data');
    if (!data) {
        // Initialize with default data
        adminData = getDefaultData();
        saveAdminData();
    } else {
        adminData = JSON.parse(data);
    }
}

function saveAdminData() {
    adminData.meta.lastUpdate = new Date().toISOString();
    localStorage.setItem('smaidrm_data', JSON.stringify(adminData));
    unsavedChanges = false;
    
    // Update UI
    updateLastUpdateDisplay();
    showNotification('Data berhasil disimpan!', 'success');
}

function getDefaultData() {
    return {
        guruIzin: [],
        guruPiket: [],
        kepsek: {
            nama: "Dr. Ahmad Wijaya, M.Pd",
            status: "hadir",
            keterangan: "Sedang bertugas di sekolah",
            lokasi: "",
            waktuKembali: ""
        },
        agenda: [],
        pengumuman: {
            aktif: true,
            tipe: "info",
            pesan: "Selamat datang di Papan Informasi Digital SMAI DRM"
        },
        settings: {
            whatsappNumber: "6281234567890"
        },
        meta: {
            lastUpdate: new Date().toISOString(),
            version: "1.0.0"
        }
    };
}

// ===== UI SETUP =====
function setupUIForUserLevel() {
    // Hide admin-only sections for non-admin users
    if (currentUserLevel !== 'admin') {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Remove admin-only nav items
        const adminNavItems = document.querySelectorAll('.nav-section.admin-only');
        adminNavItems.forEach(el => {
            el.remove();
        });
    }
    
    // Disable certain features for kepsek
    if (currentUserLevel === 'kepsek') {
        // Kepsek can only edit certain sections
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllChanges);
    }
    
    // Form inputs mark unsaved changes
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            unsavedChanges = true;
            updateSaveButtonState();
        });
        input.addEventListener('change', () => {
            unsavedChanges = true;
            updateSaveButtonState();
        });
    });
    
    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        if (unsavedChanges) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan*';
            saveBtn.classList.add('has-changes');
        } else {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Semua';
            saveBtn.classList.remove('has-changes');
        }
    }
}

// ===== SECTION MANAGEMENT =====
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        switch(sectionId) {
            case 'dashboard':
                pageTitle.textContent = 'Dashboard Admin';
                pageSubtitle.textContent = 'SMAI DRM - Sistem Informasi Digital';
                break;
            case 'quick-edit':
                pageTitle.textContent = 'Edit Cepat';
                pageSubtitle.textContent = 'Perubahan cepat untuk informasi harian';
                break;
            case 'guru-izin':
                pageTitle.textContent = 'Kelola Guru Izin';
                pageSubtitle.textContent = 'Hanya Admin yang dapat mengedit';
                break;
            case 'guru-piket':
                pageTitle.textContent = 'Kelola Guru Piket';
                pageSubtitle.textContent = 'Atur jadwal piket harian';
                break;
            case 'kepsek-info':
                pageTitle.textContent = 'Informasi Kepala Sekolah';
                pageSubtitle.textContent = 'Update status dan agenda pribadi';
                break;
            case 'agenda':
                pageTitle.textContent = 'Kelola Agenda';
                pageSubtitle.textContent = 'Atur jadwal kegiatan harian';
                break;
            case 'pengumuman':
                pageTitle.textContent = 'Kelola Pengumuman';
                pageSubtitle.textContent = 'Buat dan edit pengumuman banner';
                break;
            case 'backup':
                pageTitle.textContent = 'Backup & Restore';
                pageSubtitle.textContent = 'Cadangkan dan pulihkan data sistem';
                break;
            case 'reset':
                pageTitle.textContent = 'Reset Data';
                pageSubtitle.textContent = 'Hati-hati: Tindakan ini permanen!';
                break;
        }
        
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Hide sidebar on mobile
    if (window.innerWidth < 768) {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.remove('active');
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');
}

// ===== DASHBOARD SECTION =====
function loadDashboardStats() {
    // Guru Izin
    const today = new Date().toISOString().split('T')[0];
    const izinHariIni = adminData.guruIzin.filter(izin => 
        izin.tanggal === today
    ).length;
    document.getElementById('statIzin').textContent = izinHariIni;
    
    // Guru Piket
    document.getElementById('statPiket').textContent = adminData.guruPiket.length;
    
    // Agenda
    document.getElementById('statAgenda').textContent = adminData.agenda.length;
    
    // Last Update
    updateLastUpdateDisplay();
    
    // Load recent activities
    loadRecentActivities();
}

function updateLastUpdateDisplay() {
    const lastUpdate = adminData.meta.lastUpdate;
    const date = new Date(lastUpdate);
    const formatted = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('statUpdate').textContent = formatted;
}

function loadRecentActivities() {
    const activityList = document.getElementById('activityList');
    const logs = JSON.parse(localStorage.getItem('smaidrm_logs') || '[]');
    
    if (logs.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <div>
                    <p>Belum ada aktivitas</p>
                    <small>Mulai dengan mengedit data</small>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    logs.slice(0, 5).forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="activity-item">
                <i class="fas fa-history"></i>
                <div>
                    <p>${log.action}</p>
                    <small>${time} • oleh ${log.user}</small>
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
}

// ===== QUICK EDIT SECTION =====
function loadQuickEditSection() {
    // Status Kepsek
    const statusRadio = document.querySelector(`input[name="quick-status"][value="${adminData.kepsek.status}"]`);
    if (statusRadio) statusRadio.checked = true;
    
    document.getElementById('quick-keterangan').value = adminData.kepsek.keterangan || '';
    
    // Guru Piket
    loadQuickPiketList();
    
    // Agenda
    loadQuickAgendaList();
    
    // Pengumuman
    document.getElementById('toggle-pengumuman').checked = adminData.pengumuman.aktif;
    document.getElementById('quick-pengumuman-tipe').value = adminData.pengumuman.tipe;
    document.getElementById('quick-pengumuman-pesan').value = adminData.pengumuman.pesan;
}

function loadQuickPiketList() {
    const container = document.getElementById('quick-piket-list');
    let html = '';
    
    adminData.guruPiket.forEach((guru, index) => {
        html += `
            <div class="quick-item" data-index="${index}">
                <span>${guru.nama} - ${guru.mapel}</span>
                <button class="btn-remove" onclick="removeQuickPiket(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-text">Belum ada guru piket</p>';
}

function addQuickPiket() {
    const nama = document.getElementById('new-piket-nama').value.trim();
    const mapel = document.getElementById('new-piket-mapel').value.trim();
    
    if (!nama || !mapel) {
        showNotification('Harap isi nama dan mata pelajaran!', 'error');
        return;
    }
    
    adminData.guruPiket.push({ nama, mapel });
    unsavedChanges = true;
    updateSaveButtonState();
    
    // Clear inputs
    document.getElementById('new-piket-nama').value = '';
    document.getElementById('new-piket-mapel').value = '';
    
    // Refresh list
    loadQuickPiketList();
    showNotification('Guru piket ditambahkan!', 'success');
}

function removeQuickPiket(index) {
    adminData.guruPiket.splice(index, 1);
    unsavedChanges = true;
    updateSaveButtonState();
    loadQuickPiketList();
    showNotification('Guru piket dihapus!', 'warning');
}

function clearPiket() {
    if (!confirm('Hapus semua guru piket?')) return;
    
    adminData.guruPiket = [];
    unsavedChanges = true;
    updateSaveButtonState();
    loadQuickPiketList();
    showNotification('Semua guru piket dihapus!', 'warning');
}

function loadQuickAgendaList() {
    const container = document.getElementById('quick-agenda-list');
    let html = '';
    
    adminData.agenda.forEach((item, index) => {
        html += `
            <div class="quick-item" data-index="${index}">
                <span><strong>${item.waktu}</strong> - ${item.kegiatan}</span>
                <button class="btn-remove" onclick="removeQuickAgenda(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-text">Belum ada agenda</p>';
}

function addQuickAgenda() {
    const waktu = document.getElementById('new-agenda-waktu').value.trim();
    const kegiatan = document.getElementById('new-agenda-kegiatan').value.trim();
    
    if (!waktu || !kegiatan) {
        showNotification('Harap isi waktu dan kegiatan!', 'error');
        return;
    }
    
    adminData.agenda.push({ waktu, kegiatan });
    unsavedChanges = true;
    updateSaveButtonState();
    
    // Clear inputs
    document.getElementById('new-agenda-waktu').value = '';
    document.getElementById('new-agenda-kegiatan').value = '';
    
    // Refresh list
    loadQuickAgendaList();
    showNotification('Agenda ditambahkan!', 'success');
}

function removeQuickAgenda(index) {
    adminData.agenda.splice(index, 1);
    unsavedChanges = true;
    updateSaveButtonState();
    loadQuickAgendaList();
    showNotification('Agenda dihapus!', 'warning');
}

function clearAgenda() {
    if (!confirm('Hapus semua agenda?')) return;
    
    adminData.agenda = [];
    unsavedChanges = true;
    updateSaveButtonState();
    loadQuickAgendaList();
    showNotification('Semua agenda dihapus!', 'warning');
}

function saveQuickStatus() {
    const status = document.querySelector('input[name="quick-status"]:checked').value;
    const keterangan = document.getElementById('quick-keterangan').value.trim();
    
    adminData.kepsek.status = status;
    adminData.kepsek.keterangan = keterangan;
    adminData.kepsek.lastUpdate = new Date().toISOString();
    
    unsavedChanges = true;
    updateSaveButtonState();
    showNotification('Status diperbarui!', 'success');
}

function saveQuickPengumuman() {
    const aktif = document.getElementById('toggle-pengumuman').checked;
    const tipe = document.getElementById('quick-pengumuman-tipe').value;
    const pesan = document.getElementById('quick-pengumuman-pesan').value.trim();
    
    if (!pesan) {
        showNotification('Harap isi pesan pengumuman!', 'error');
        return;
    }
    
    adminData.pengumuman.aktif = aktif;
    adminData.pengumuman.tipe = tipe;
    adminData.pengumuman.pesan = pesan;
    
    unsavedChanges = true;
    updateSaveButtonState();
    showNotification('Pengumuman diperbarui!', 'success');
}

// ===== GURU IZIN SECTION (ADMIN ONLY) =====
function loadGuruIzinSection() {
    if (currentUserLevel !== 'admin') return;
    
    const tbody = document.getElementById('izinTableBody');
    let html = '';
    
    // Sort by date descending
    const sortedIzin = [...adminData.guruIzin].sort((a, b) => 
        new Date(b.tanggal) - new Date(a.tanggal)
    );
    
    sortedIzin.forEach((izin, index) => {
        const statusClass = izin.status === 'approved' ? 'badge-success' : 
                          izin.status === 'rejected' ? 'badge-danger' : 'badge-warning';
        const statusText = izin.status === 'approved' ? 'Disetujui' : 
                          izin.status === 'rejected' ? 'Ditolak' : 'Menunggu';
        
        html += `
            <tr>
                <td>${izin.nama}</td>
                <td>${izin.mapel}</td>
                <td>${izin.alasan}</td>
                <td>${formatDateDisplay(izin.tanggal)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-action edit" onclick="editIzin(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteIzin(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html || `
        <tr>
            <td colspan="6" class="text-center">Tidak ada data izin</td>
        </tr>
    `;
}

function showAddIzinModal() {
    const modal = document.getElementById('addIzinModal');
    modal.style.display = 'flex';
    
    // Set default values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('modal-tanggal').value = today;
    document.getElementById('modal-waktu').value = '08:00 - 12:00';
}

function closeAddIzinModal() {
    document.getElementById('addIzinModal').style.display = 'none';
    document.getElementById('addIzinForm').reset();
}

function addIzinFromModal(e) {
    e.preventDefault();
    
    const izin = {
        id: Date.now(),
        nama: document.getElementById('modal-nama').value.trim(),
        mapel: document.getElementById('modal-mapel').value.trim(),
        alasan: document.getElementById('modal-alasan').value,
        tanggal: document.getElementById('modal-tanggal').value,
        waktu: document.getElementById('modal-waktu').value.trim(),
        status: document.getElementById('modal-status').value
    };
    
    // Validation
    if (!izin.nama || !izin.mapel || !izin.tanggal || !izin.waktu) {
        showNotification('Harap lengkapi semua field!', 'error');
        return;
    }
    
    adminData.guruIzin.push(izin);
    unsavedChanges = true;
    updateSaveButtonState();
    
    // Close modal and refresh
    closeAddIzinModal();
    loadGuruIzinSection();
    showNotification('Data izin berhasil ditambahkan!', 'success');
}

function editIzin(index) {
    const izin = adminData.guruIzin[index];
    
    // Fill modal with data
    document.getElementById('modal-nama').value = izin.nama;
    document.getElementById('modal-mapel').value = izin.mapel;
    document.getElementById('modal-alasan').value = izin.alasan;
    document.getElementById('modal-tanggal').value = izin.tanggal;
    document.getElementById('modal-waktu').value = izin.waktu;
    document.getElementById('modal-status').value = izin.status;
    
    // Change modal title and submit handler
    document.querySelector('#addIzinModal .modal-header h3').innerHTML = 
        '<i class="fas fa-edit"></i> Edit Data Izin';
    
    const form = document.getElementById('addIzinForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateIzin(index);
    };
    
    // Show modal
    document.getElementById('addIzinModal').style.display = 'flex';
}

function updateIzin(index) {
    const izin = {
        ...adminData.guruIzin[index],
        nama: document.getElementById('modal-nama').value.trim(),
        mapel: document.getElementById('modal-mapel').value.trim(),
        alasan: document.getElementById('modal-alasan').value,
        tanggal: document.getElementById('modal-tanggal').value,
        waktu: document.getElementById('modal-waktu').value.trim(),
        status: document.getElementById('modal-status').value
    };
    
    adminData.guruIzin[index] = izin;
    unsavedChanges = true;
    updateSaveButtonState();
    
    closeAddIzinModal();
    loadGuruIzinSection();
    showNotification('Data izin berhasil diperbarui!', 'success');
}

function deleteIzin(index) {
    if (!confirm('Hapus data izin ini?')) return;
    
    adminData.guruIzin.splice(index, 1);
    unsavedChanges = true;
    updateSaveButtonState();
    
    loadGuruIzinSection();
    showNotification('Data izin berhasil dihapus!', 'warning');
}

// ===== GURU PIKET SECTION =====
function loadGuruPiketSection() {
    const container = document.getElementById('piket-list-edit');
    let html = '';
    
    adminData.guruPiket.forEach((guru, index) => {
        html += `
            <div class="edit-list-item">
                <div class="item-content">
                    <input type="text" value="${guru.nama}" 
                           onchange="updatePiketField(${index}, 'nama', this.value)">
                    <input type="text" value="${guru.mapel}" 
                           onchange="updatePiketField(${index}, 'mapel', this.value)">
                </div>
                <button class="btn-remove" onclick="removePiket(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-text">Belum ada guru piket</p>';
}

function addPiket() {
    adminData.guruPiket.push({ nama: '', mapel: '' });
    unsavedChanges = true;
    updateSaveButtonState();
    loadGuruPiketSection();
}

function updatePiketField(index, field, value) {
    adminData.guruPiket[index][field] = value;
    unsavedChanges = true;
    updateSaveButtonState();
}

function removePiket(index) {
    adminData.guruPiket.splice(index, 1);
    unsavedChanges = true;
    updateSaveButtonState();
    loadGuruPiketSection();
}

function savePiket() {
    // Remove empty entries
    adminData.guruPiket = adminData.guruPiket.filter(guru => 
        guru.nama.trim() && guru.mapel.trim()
    );
    
    saveAdminData();
    loadGuruPiketSection();
}

// ===== KEPSEK INFO SECTION =====
function loadKepsekInfoSection() {
    document.getElementById('edit-kepsek-nama').value = adminData.kepsek.nama;
    
    // Set status radio
    const statusRadio = document.querySelector(`input[name="kepsek-status"][value="${adminData.kepsek.status}"]`);
    if (statusRadio) statusRadio.checked = true;
    
    document.getElementById('edit-kepsek-keterangan').value = adminData.kepsek.keterangan || '';
    document.getElementById('edit-kepsek-lokasi').value = adminData.kepsek.lokasi || '';
    document.getElementById('edit-kepsek-waktu-kembali').value = adminData.kepsek.waktuKembali || '';
}

function saveKepsekInfo() {
    const nama = document.getElementById('edit-kepsek-nama').value.trim();
    const status = document.querySelector('input[name="kepsek-status"]:checked').value;
    const keterangan = document.getElementById('edit-kepsek-keterangan').value.trim();
    const lokasi = document.getElementById('edit-kepsek-lokasi').value.trim();
    const waktuKembali = document.getElementById('edit-kepsek-waktu-kembali').value.trim();
    
    if (!nama) {
        showNotification('Nama kepala sekolah harus diisi!', 'error');
        return;
    }
    
    adminData.kepsek = {
        nama,
        status,
        keterangan,
        lokasi,
        waktuKembali,
        lastUpdate: new Date().toISOString()
    };
    
    saveAdminData();
}

// ===== AGENDA SECTION =====
function loadAgendaSection() {
    const container = document.getElementById('agenda-list-edit');
    let html = '';
    
    adminData.agenda.forEach((item, index) => {
        html += `
            <div class="edit-list-item">
                <div class="item-content">
                    <input type="text" value="${item.waktu}" 
                           onchange="updateAgendaField(${index}, 'waktu', this.value)">
                    <input type="text" value="${item.kegiatan}" 
                           onchange="updateAgendaField(${index}, 'kegiatan', this.value)">
                </div>
                <button class="btn-remove" onclick="removeAgenda(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="empty-text">Belum ada agenda</p>';
}

function addAgendaItem() {
    const waktu = document.getElementById('new-agenda-waktu-full').value.trim();
    const kegiatan = document.getElementById('new-agenda-kegiatan-full').value.trim();
    
    if (!waktu || !kegiatan) {
        showNotification('Harap isi waktu dan kegiatan!', 'error');
        return;
    }
    
    adminData.agenda.push({ waktu, kegiatan });
    unsavedChanges = true;
    updateSaveButtonState();
    
    // Clear inputs
    document.getElementById('new-agenda-waktu-full').value = '';
    document.getElementById('new-agenda-kegiatan-full').value = '';
    
    loadAgendaSection();
    showNotification('Agenda ditambahkan!', 'success');
}

function updateAgendaField(index, field, value) {
    adminData.agenda[index][field] = value;
    unsavedChanges = true;
    updateSaveButtonState();
}

function removeAgenda(index) {
    adminData.agenda.splice(index, 1);
    unsavedChanges = true;
    updateSaveButtonState();
    loadAgendaSection();
}

function saveAgenda() {
    // Remove empty entries
    adminData.agenda = adminData.agenda.filter(item => 
        item.waktu.trim() && item.kegiatan.trim()
    );
    
    saveAdminData();
    loadAgendaSection();
}

// ===== PENGUMUMAN SECTION =====
function loadPengumumanSection() {
    document.getElementById('pengumuman-aktif').checked = adminData.pengumuman.aktif;
    
    // Set type radio
    const typeRadio = document.querySelector(`input[name="pengumuman-tipe"][value="${adminData.pengumuman.tipe}"]`);
    if (typeRadio) typeRadio.checked = true;
    
    document.getElementById('pengumuman-pesan').value = adminData.pengumuman.pesan;
}

function savePengumuman() {
    const aktif = document.getElementById('pengumuman-aktif').checked;
    const tipe = document.querySelector('input[name="pengumuman-tipe"]:checked').value;
    const pesan = document.getElementById('pengumuman-pesan').value.trim();
    
    if (!pesan) {
        showNotification('Pesan pengumuman harus diisi!', 'error');
        return;
    }
    
    if (pesan.length > 200) {
        showNotification('Pesan terlalu panjang! Maksimal 200 karakter.', 'error');
        return;
    }
    
    adminData.pengumuman = { aktif, tipe, pesan };
    saveAdminData();
}

function previewPengumuman() {
    const aktif = document.getElementById('pengumuman-aktif').checked;
    const tipe = document.querySelector('input[name="pengumuman-tipe"]:checked').value;
    const pesan = document.getElementById('pengumuman-pesan').value.trim();
    
    if (!pesan) {
        showNotification('Tidak ada pesan untuk preview!', 'error');
        return;
    }
    
    // Create preview
    let color = '#2196F3';
    switch(tipe) {
        case 'warning': color = '#FF9800'; break;
        case 'danger': color = '#F44336'; break;
        case 'success': color = '#4CAF50'; break;
    }
    
    const preview = `
        <div style="
            background: linear-gradient(90deg, ${color} 0%, ${color}99 100%);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin: 10px 0;
            display: ${aktif ? 'block' : 'none'};
            animation: pulse 2s infinite;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-bullhorn"></i>
                <marquee style="flex: 1;">${pesan}</marquee>
                <i class="fas fa-times" style="cursor: pointer;"></i>
            </div>
        </div>
    `;
    
    // Show in modal
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-content">
            <h3><i class="fas fa-eye"></i> Preview Pengumuman</h3>
            ${preview}
            <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
                <i class="fas fa-info-circle"></i> Ini adalah preview bagaimana pengumuman akan tampil di papan informasi.
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="margin-top: 20px; padding: 8px 20px; background: #4FC3F7; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Tutup Preview
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .preview-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .preview-content {
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
        }
    `;
    document.head.appendChild(style);
}

// ===== BACKUP SECTION =====
function loadBackupSection() {
    document.getElementById('currentDataVersion').textContent = `v${adminData.meta.version}`;
    
    const lastUpdate = new Date(adminData.meta.lastUpdate);
    document.getElementById('lastDataChange').textContent = 
        lastUpdate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
}

function backupData() {
    // Create backup with metadata
    const backup = {
        data: adminData,
        exported: new Date().toISOString(),
        exportedBy: currentUserLevel,
        checksum: generateChecksum(JSON.stringify(adminData))
    };
    
    // Create download link
    const dataStr = JSON.stringify(backup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `smaidrm-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Backup berhasil diunduh!', 'success');
    logActivity(`Backup data dibuat oleh ${getUserDisplayName()}`);
}

function generateChecksum(str) {
    // Simple checksum for validation
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function previewBackupFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Validate backup structure
            if (!backup.data || !backup.checksum) {
                showNotification('File backup tidak valid!', 'error');
                return;
            }
            
            // Verify checksum
            const currentChecksum = generateChecksum(JSON.stringify(backup.data));
            if (currentChecksum !== backup.checksum) {
                showNotification('File backup rusak atau dimodifikasi!', 'error');
                return;
            }
            
            // Show preview
            const preview = document.getElementById('backupPreview');
            preview.innerHTML = `
                <div class="backup-info">
                    <h4><i class="fas fa-file-alt"></i> Informasi Backup</h4>
                    <p><strong>Tanggal Export:</strong> ${new Date(backup.exported).toLocaleString('id-ID')}</p>
                    <p><strong>Diexport oleh:</strong> ${backup.exportedBy}</p>
                    <p><strong>Versi Data:</strong> v${backup.data.meta.version}</p>
                    <p><strong>Jumlah Data:</strong></p>
                    <ul>
                        <li>Guru Izin: ${backup.data.guruIzin.length} data</li>
                        <li>Guru Piket: ${backup.data.guruPiket.length} data</li>
                        <li>Agenda: ${backup.data.agenda.length} item</li>
                    </ul>
                    <p class="backup-warning"><i class="fas fa-exclamation-triangle"></i> Restore akan mengganti semua data saat ini!</p>
                </div>
            `;
            
            // Enable restore button
            document.getElementById('restoreBtn').disabled = false;
            
        } catch (error) {
            showNotification('Error membaca file backup: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function restoreData() {
    if (!confirm('Yakin ingin restore data? Semua data saat ini akan diganti!')) {
        return;
    }
    
    const fileInput = document.getElementById('backupFile');
    if (!fileInput.files[0]) {
        showNotification('Pilih file backup terlebih dahulu!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Verify checksum
            const currentChecksum = generateChecksum(JSON.stringify(backup.data));
            if (currentChecksum !== backup.checksum) {
                showNotification('Verifikasi backup gagal!', 'error');
                return;
            }
            
            // Restore data
            adminData = backup.data;
            saveAdminData();
            
            // Clear file input
            fileInput.value = '';
            document.getElementById('backupPreview').innerHTML = '';
            document.getElementById('restoreBtn').disabled = true;
            
            // Refresh all sections
            refreshAdminData();
            
            showNotification('Data berhasil direstore!', 'success');
            logActivity(`Data direstore dari backup oleh ${getUserDisplayName()}`);
            
        } catch (error) {
            showNotification('Error restore data: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(fileInput.files[0]);
}

// ===== RESET SECTION =====
function setupResetSection() {
    const confirmInput = document.getElementById('resetConfirm');
    const resetBtn = document.getElementById('resetBtn');
    
    confirmInput.addEventListener('input', function() {
        resetBtn.disabled = this.value !== 'RESET';
    });
}

function resetData() {
    if (!confirm('YAKIN INGIN RESET SEMUA DATA?\n\nTindakan ini tidak dapat dibatalkan!')) {
        return;
    }
    
    // Reset to default data
    adminData = getDefaultData();
    saveAdminData();
    
    // Clear activities log
    localStorage.removeItem('smaidrm_logs');
    
    // Clear reset confirmation
    document.getElementById('resetConfirm').value = '';
    document.getElementById('resetBtn').disabled = true;
    
    // Refresh all data
    refreshAdminData();
    
    showNotification('Semua data telah direset ke pengaturan awal!', 'success');
    logActivity(`SEMUA DATA DIRESET oleh ${getUserDisplayName()}`);
}

// ===== UTILITY FUNCTIONS =====
function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getUserDisplayName() {
    const user = JSON.parse(localStorage.getItem('smaidrm_current_user') || '{}');
    return user.name || 'Unknown';
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
                border-left: 4px solid #4FC3F7;
            }
            .notification.success {
                border-left-color: #4CAF50;
            }
            .notification.error {
                border-left-color: #F44336;
            }
            .notification.warning {
                border-left-color: #FF9800;
            }
            .notification i:first-child {
                font-size: 1.2rem;
            }
            .notification.success i:first-child {
                color: #4CAF50;
            }
            .notification.error i:first-child {
                color: #F44336;
            }
            .notification.warning i:first-child {
                color: #FF9800;
            }
            .notification span {
                flex: 1;
                font-weight: 500;
            }
            .notification button {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            .notification button:hover {
                background: #f0f0f0;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function checkUnsavedChanges() {
    if (unsavedChanges) {
        showNotification('Ada perubahan yang belum disimpan!', 'warning');
    }
}

function refreshAdminData() {
    // Reload data
    loadAdminData();
    
    // Refresh all sections
    loadDashboardStats();
    loadQuickEditSection();
    loadGuruIzinSection();
    loadGuruPiketSection();
    loadKepsekInfoSection();
    loadAgendaSection();
    loadPengumumanSection();
    
    showNotification('Data diperbarui!', 'success');
}

function saveAllChanges() {
    saveAdminData();
}

// ===== EVENT LISTENERS SETUP =====
function setupAdminEventListeners() {
    // Add izin form
    const addIzinForm = document.getElementById('addIzinForm');
    if (addIzinForm) {
        addIzinForm.addEventListener('submit', addIzinFromModal);
    }
    
    // Modal close on overlay click
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Reset section setup
    setupResetSection();
}

// ===== INITIALIZE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initAdminPanel();
        setupAdminEventListeners();
    });
} else {
    initAdminPanel();
    setupAdminEventListeners();
}