// ===== DATABASE & STATE MANAGEMENT =====
const defaultData = {
    // Data Guru Izin
    guruIzin: [
        {
            id: 1,
            nama: "BUDI SANTOSO, S.Pd",
            mapel: "Matematika",
            alasan: "Sakit",
            tanggal: "2024-03-20",
            waktu: "08:00 - 12:00",
            status: "pending"
        },
        {
            id: 2,
            nama: "SITI AMINAH, M.Pd",
            mapel: "Bahasa Indonesia",
            alasan: "Dinas",
            tanggal: "2024-03-20",
            waktu: "09:00 - 15:00",
            status: "approved"
        }
    ],
    
    // Guru Piket
    guruPiket: [
        { nama: "Dra. Siti Aminah", mapel: "Matematika" },
        { nama: "Agus Wibowo, S.Pd", mapel: "IPA" },
        { nama: "Rina Dewi, M.Pd", mapel: "Bahasa Inggris" }
    ],
    
    // Kepala Sekolah
    kepsek: {
        nama: "Dr. Ahmad Wijaya, M.Pd",
        status: "hadir",
        keterangan: "Sedang memimpin rapat koordinasi guru",
        lokasi: "Ruang Kepala Sekolah",
        waktuKembali: "15:00 WIB",
        lastUpdate: "2024-03-20 08:00"
    },
    
    // Agenda
    agenda: [
        { waktu: "08:00 - 09:00", kegiatan: "Upacara Bendera" },
        { waktu: "10:00 - 12:00", kegiatan: "Rapat Koordinasi Guru" },
        { waktu: "13:00 - 15:00", kegiatan: "Kunjungan Dinas Pendidikan" }
    ],
    
    // Pengumuman Banner
    pengumuman: {
        aktif: true,
        tipe: "info", // info, warning, danger
        pesan: "Selamat datang di Papan Informasi Digital SMAI DRM - Update informasi real-time tersedia",
        warna: "#FF5252"
    },
    
    // Informasi Lain
    kontak: {
        kepsek: "081234567890",
        tataUsaha: "081345678901"
    },
    
    // Settings
    settings: {
        jamSekolah: "07:00 - 15:00",
        hariSekolah: "Senin - Jumat",
        whatsappNumber: "6281234567890"
    },
    
    // Metadata
    meta: {
        lastUpdate: new Date().toISOString(),
        version: "1.0.0"
    }
};

// ===== INITIALIZE LOCALSTORAGE =====
function initializeData() {
    if (!localStorage.getItem('smaidrm_data')) {
        localStorage.setItem('smaidrm_data', JSON.stringify(defaultData));
    }
    return JSON.parse(localStorage.getItem('smaidrm_data'));
}

let appData = initializeData();

// ===== JAM DIGITAL REAL-TIME =====
function updateDigitalClock() {
    const now = new Date();
    
    // Format waktu
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Update display
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    
    // Format tanggal Indonesia
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('id-ID', options);
}

// ===== LOAD ALL DATA FUNCTIONS =====
function loadGuruIzin() {
    const izinList = document.getElementById('izinList');
    const countIzin = document.getElementById('countIzin');
    
    if (!appData.guruIzin || appData.guruIzin.length === 0) {
        izinList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>Tidak ada guru izin hari ini</p>
            </div>
        `;
        countIzin.textContent = '0';
        return;
    }
    
    // Filter hanya hari ini
    const today = new Date().toISOString().split('T')[0];
    const izinHariIni = appData.guruIzin.filter(izin => 
        izin.tanggal === today
    );
    
    countIzin.textContent = izinHariIni.length.toString();
    
    if (izinHariIni.length === 0) {
        izinList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>Tidak ada guru izin hari ini</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    izinHariIni.forEach(guru => {
        const statusClass = guru.status === 'approved' ? 'approved' : 'pending';
        const statusIcon = guru.status === 'approved' ? 'fa-check-circle' : 'fa-clock';
        
        html += `
            <div class="izin-item">
                <div class="izin-name">${guru.nama}</div>
                <div class="izin-details">${guru.mapel} • ${guru.alasan}</div>
                <div class="izin-time">
                    <i class="fas fa-clock"></i> ${guru.waktu}
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${guru.status === 'approved' ? 'Disetujui' : 'Menunggu'}
                    </span>
                </div>
            </div>
        `;
    });
    
    izinList.innerHTML = html;
}

function loadGuruPiket() {
    const piketList = document.getElementById('piketList');
    
    if (!appData.guruPiket || appData.guruPiket.length === 0) {
        piketList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-check"></i>
                <p>Belum ada jadwal piket hari ini</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    appData.guruPiket.forEach(guru => {
        html += `
            <div class="piket-item">
                <div class="piket-name">${guru.nama}</div>
                <div class="piket-subject">${guru.mapel}</div>
            </div>
        `;
    });
    
    piketList.innerHTML = html;
}

function loadKepsekInfo() {
    document.getElementById('kepsekName').textContent = appData.kepsek.nama;
    
    // Set status dot color
    const statusDot = document.querySelector('.kepsek-status .status-dot');
    statusDot.className = 'status-dot ' + appData.kepsek.status;
    
    // Set status label
    const statusLabel = document.querySelector('.status-label');
    let statusText = '';
    switch(appData.kepsek.status) {
        case 'hadir': statusText = 'HADIR'; break;
        case 'rapat': statusText = 'SEDANG RAPAT'; break;
        case 'dinas': statusText = 'DINAS LUAR'; break;
        case 'cuti': statusText = 'CUTI'; break;
        case 'sakit': statusText = 'SAKIT'; break;
        default: statusText = 'HADIR';
    }
    statusLabel.textContent = statusText;
    
    // Set keterangan
    const kepsekDetail = document.getElementById('kepsekDetail');
    let detailText = appData.kepsek.keterangan || 'Sedang bertugas';
    
    if (appData.kepsek.lokasi) {
        detailText += ` | Lokasi: ${appData.kepsek.lokasi}`;
    }
    if (appData.kepsek.waktuKembali) {
        detailText += ` | Kembali: ${appData.kepsek.waktuKembali}`;
    }
    
    kepsekDetail.innerHTML = `<i class="fas fa-info-circle"></i> ${detailText}`;
}

function loadAgenda() {
    const agendaList = document.getElementById('agendaList');
    
    if (!appData.agenda || appData.agenda.length === 0) {
        agendaList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Tidak ada agenda hari ini</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    appData.agenda.forEach(item => {
        html += `
            <li class="agenda-item">
                <span class="agenda-time">${item.waktu}</span>
                <span class="agenda-title">${item.kegiatan}</span>
            </li>
        `;
    });
    
    agendaList.innerHTML = html;
}

function loadPengumumanBanner() {
    const banner = document.getElementById('announcementBanner');
    const bannerText = document.getElementById('announcementText');
    
    if (!appData.pengumuman || !appData.pengumuman.aktif) {
        banner.style.display = 'none';
        return;
    }
    
    // Set warna berdasarkan tipe
    let bgColor = '#FF5252'; // default merah
    switch(appData.pengumuman.tipe) {
        case 'info': bgColor = '#2196F3'; break; // biru
        case 'warning': bgColor = '#FF9800'; break; // oranye
        case 'danger': bgColor = '#F44336'; break; // merah
        case 'success': bgColor = '#4CAF50'; break; // hijau
    }
    
    banner.style.background = `linear-gradient(90deg, ${bgColor} 0%, ${adjustColor(bgColor, 20)} 100%)`;
    bannerText.innerHTML = appData.pengumuman.pesan;
}

function adjustColor(color, amount) {
    // Simple color adjustment
    return color; // Implementasi lebih kompleks bisa ditambahkan
}

function updateLastUpdate() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const formattedDate = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    });
    
    document.getElementById('lastUpdate').textContent = 
        `Terakhir update: ${formattedTime} ${formattedDate}`;
}

// ===== FORM IZIN FUNCTIONS =====
function openIzinModal() {
    const modal = document.getElementById('izinModal');
    modal.style.display = 'flex';
    
    // Set tanggal otomatis ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputTanggal').value = today;
    
    // Auto focus ke input nama
    setTimeout(() => {
        document.getElementById('inputNama').focus();
    }, 100);
}

function closeIzinModal() {
    document.getElementById('izinModal').style.display = 'none';
    document.getElementById('izinForm').reset();
}

function setupIzinForm() {
    const form = document.getElementById('izinForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const nama = document.getElementById('inputNama').value.trim();
        const mapel = document.getElementById('inputMapel').value.trim();
        const alasan = document.getElementById('inputAlasan').value;
        const tanggal = document.getElementById('inputTanggal').value;
        const keterangan = document.getElementById('inputKeterangan').value.trim();
        
        // Validasi
        if (!nama || !mapel || !alasan || !tanggal) {
            alert('Harap lengkapi semua field yang wajib diisi!');
            return;
        }
        
        // Prepare WhatsApp message
        const whatsappNumber = appData.settings.whatsappNumber;
        const message = encodeURIComponent(
            `*PENGAJUAN IZIN GURU - SMAI DRM*\n\n` +
            `Nama: ${nama}\n` +
            `Mata Pelajaran: ${mapel}\n` +
            `Alasan Izin: ${alasan}\n` +
            `Tanggal: ${formatTanggalIndonesia(tanggal)}\n` +
            `Keterangan: ${keterangan || '-'}\n\n` +
            `_Dikirim dari Papan Informasi Digital_`
        );
        
        // Open WhatsApp
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        
        // Add to izin list (pending status)
        const newIzin = {
            id: Date.now(),
            nama: nama.toUpperCase(),
            mapel: mapel,
            alasan: alasan,
            tanggal: tanggal,
            waktu: getCurrentTimeRange(),
            status: 'pending'
        };
        
        appData.guruIzin.push(newIzin);
        saveData();
        
        // Close modal & reset form
        closeIzinModal();
        
        // Show success message
        alert('Form izin berhasil dikirim ke WhatsApp Kepala Sekolah! Status: Menunggu persetujuan.');
        
        // Refresh izin list
        loadGuruIzin();
    });
}

function getCurrentTimeRange() {
    const now = new Date();
    const hour = now.getHours();
    const nextHour = (hour + 4) % 24;
    
    return `${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
}

function formatTanggalIndonesia(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

// ===== DATA MANAGEMENT =====
function saveData() {
    appData.meta.lastUpdate = new Date().toISOString();
    localStorage.setItem('smaidrm_data', JSON.stringify(appData));
    updateLastUpdate();
}

function refreshData() {
    // Reload data from localStorage
    appData = JSON.parse(localStorage.getItem('smaidrm_data')) || defaultData;
    
    // Refresh all displays
    loadGuruIzin();
    loadGuruPiket();
    loadKepsekInfo();
    loadAgenda();
    loadPengumumanBanner();
    
    // Show refresh feedback
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHTML = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="fas fa-check"></i> Diperbarui';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalHTML;
        refreshBtn.disabled = false;
    }, 2000);
    
    updateLastUpdate();
}

// ===== ANNOUNCEMENT FUNCTIONS =====
function closeAnnouncement() {
    const banner = document.getElementById('announcementBanner');
    banner.style.display = 'none';
    
    // Simpan preference ke localStorage
    localStorage.setItem('hide_announcement', 'true');
}

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCurrentUser() {
    const user = localStorage.getItem('smaidrm_user');
    return user ? JSON.parse(user) : null;
}

// ===== INITIALIZATION =====
function init() {
    // Start clock
    updateDigitalClock();
    setInterval(updateDigitalClock, 1000);
    
    // Load all data
    loadGuruIzin();
    loadGuruPiket();
    loadKepsekInfo();
    loadAgenda();
    loadPengumumanBanner();
    updateLastUpdate();
    
    // Setup form
    setupIzinForm();
    
    // Check if announcement should be hidden
    if (localStorage.getItem('hide_announcement') === 'true') {
        closeAnnouncement();
    }
    
    // Setup modal close on overlay click
    const modal = document.getElementById('izinModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeIzinModal();
        }
    });
    
    // Add CSS for status badges
    const style = document.createElement('style');
    style.textContent = `
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
        }
        .status-badge.pending {
            background: #FFF3E0;
            color: #E65100;
        }
        .status-badge.approved {
            background: #E8F5E9;
            color: #1B5E20;
        }
    `;
    document.head.appendChild(style);
}

// ===== START APP =====
document.addEventListener('DOMContentLoaded', init);