// File ini menangani semua interaksi JavaScript untuk halaman panel Pterodactyl
// Sinkron dengan struktur HTML: navbar, modal order, form, dan tombol beli

// ======================== KONFIGURASI ========================
const ADMIN_WA_NUMBER = '6282210756431'; // Nomor admin (format 62, tanpa +)
// Ganti nomor di atas dengan nomor admin yang sebenarnya

// ======================== ELEMEN DOM ========================
const orderModal = document.getElementById('orderModal');
const successModal = document.getElementById('successModal');
const packageInput = document.getElementById('package');
const orderForm = document.getElementById('orderForm');
const paymentProof = document.getElementById('paymentProof');
const fileNameDisplay = document.getElementById('file-name');

// ======================== FUNGSI MODAL ORDER ========================
// Fungsi untuk membuka modal order dan mengisi field paket
function openOrderModal(packageName) {
    if (packageInput) {
        packageInput.value = packageName;
    }
    if (orderModal) {
        orderModal.style.display = 'flex';
    }
    // Reset file input
    if (paymentProof) {
        paymentProof.value = '';
    }
    if (fileNameDisplay) {
        fileNameDisplay.innerText = 'Tidak ada file dipilih';
    }
}

// Fungsi untuk menutup modal order
function closeOrderModal() {
    if (orderModal) {
        orderModal.style.display = 'none';
    }
}

// ======================== FUNGSI MODAL SUKSES ========================
function closeSuccessModal() {
    if (successModal) {
        successModal.style.display = 'none';
    }
}

// ======================== FUNGSI UPLOAD FILE ========================
// Memperbarui nama file yang dipilih
function updateFileName() {
    if (paymentProof && fileNameDisplay) {
        if (paymentProof.files.length > 0) {
            const file = paymentProof.files[0];
            // Batasi nama file agar tidak terlalu panjang
            let fileName = file.name;
            if (fileName.length > 30) {
                fileName = fileName.substring(0, 27) + '...';
            }
            fileNameDisplay.innerText = '📎 ' + fileName;
        } else {
            fileNameDisplay.innerText = 'Tidak ada file dipilih';
        }
    }
}

// ======================== FUNGSI SUBMIT FORM ========================
// Menangani submit form order dan redirect ke WhatsApp
function submitOrder(event) {
    event.preventDefault(); // Mencegah form submit secara default

    // Validasi form
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const whatsapp = document.getElementById('whatsapp')?.value.trim();
    const paket = document.getElementById('package')?.value;
    const game = document.getElementById('game')?.value;
    const notes = document.getElementById('notes')?.value.trim();
    const fileInput = document.getElementById('paymentProof');

    // Validasi field wajib
    if (!name || !email || !whatsapp || !paket) {
        alert('⚠️ Harap isi semua field wajib (Nama, Email, WhatsApp)');
        return;
    }

    // Validasi email sederhana
    if (!email.includes('@') || !email.includes('.')) {
        alert('⚠️ Masukkan alamat email yang valid');
        return;
    }

    // Validasi nomor WhatsApp (minimal 10 digit)
    const waDigits = whatsapp.replace(/\D/g, '');
    if (waDigits.length < 10 || waDigits.length > 15) {
        alert('⚠️ Nomor WhatsApp tidak valid (harus 10-15 digit)');
        return;
    }

    // Validasi bukti pembayaran
    if (!fileInput || fileInput.files.length === 0) {
        alert('⚠️ Mohon upload bukti pembayaran (screenshot QRIS / transfer)');
        return;
    }

    // Ambil informasi file untuk dikirim dalam pesan
    const fileInfo = fileInput.files[0] ? ` (${fileInput.files[0].name})` : ' (file terlampir)';

    // Siapkan pesan WhatsApp
    const pesan = `Halo Admin PteroHost, saya ingin order panel:

📦 *PAKET*: ${paket}
👤 *NAMA*: ${name}
📧 *EMAIL*: ${email}
📱 *WA*: ${whatsapp}
🎮 *GAME*: ${game || 'Tidak disebutkan'}
📝 *CATATAN*: ${notes || '-'}
🖼️ *BUKTI*: Sudah saya upload ${fileInfo}

Mohon diproses dan dikirim akses panelnya. Terima kasih.`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(pesan);

    // Buat URL WhatsApp
    const waURL = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodedMessage}`;

    // Buka WhatsApp di tab baru
    window.open(waURL, '_blank');

    // Tutup modal order
    closeOrderModal();

    // Tampilkan modal sukses (dengan sedikit delay)
    setTimeout(() => {
        if (successModal) {
            successModal.style.display = 'flex';
        }
    }, 300);
}

// ======================== FUNGSI BELI LANGSUNG (UNTUK TOMBOL DI PAKET) ========================
// Fungsi ini dipanggil dari tombol "Beli Sekarang" di kartu paket
function buyNow(paket, harga) {
    // Format harga ke Rupiah
    const hargaFormat = new Intl.NumberFormat('id-ID').format(harga);
    
    // Buat pesan template untuk pembelian langsung
    const pesan = `Halo kak, saya ingin order panel Pterodactyl:

🔹 *Paket*: ${paket}
🔹 *Harga*: Rp ${hargaFormat}
🔹 *Saya sudah melakukan pembayaran via QRIS.*

Berikut bukti transfernya (saya lampirkan):
[ upload foto bukti ]

Mohon segera diproses dan dikirim akses panelnya. 
Terima kasih.`;

    // Encode pesan
    const encodedMessage = encodeURIComponent(pesan);
    
    // Buat URL WhatsApp
    const waURL = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodedMessage}`;
    
    // Buka WhatsApp di tab baru
    window.open(waURL, '_blank');
}

// ======================== CLICK OUTSIDE MODAL ========================
// Menutup modal ketika klik di luar area modal
window.onclick = function(event) {
    if (orderModal && event.target == orderModal) {
        orderModal.style.display = 'none';
    }
    if (successModal && event.target == successModal) {
        successModal.style.display = 'none';
    }
}

// ======================== INITIALIZATION SAAT HALAMAN DIMUAT ========================
document.addEventListener('DOMContentLoaded', function() {
    // Tambahkan event listener untuk form jika ada
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }

    // Tambahkan event listener untuk file input
    if (paymentProof) {
        paymentProof.addEventListener('change', updateFileName);
    }

    // Smooth scroll untuk anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== "#") {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    console.log('✅ Script.js siap dan sinkron dengan halaman!');
});
