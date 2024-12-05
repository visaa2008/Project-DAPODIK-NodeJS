// Menyimpan pengaturan entri per halaman ke sesi pengguna
function saveEntriesPerPage(entriesPerPage) {
    sessionStorage.setItem('entriesPerPage', entriesPerPage);
}

// Mendapatkan pengaturan entri per halaman dari sesi pengguna
function getEntriesPerPage() {
    return sessionStorage.getItem('entriesPerPage') || 5; // Default 5 jika tidak ada pengaturan
}

// Contoh penggunaan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
    var entriesPerPage = getEntriesPerPage();
    console.log('Entries per page:', entriesPerPage);
});