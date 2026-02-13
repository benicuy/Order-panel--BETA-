// File ini menangani semua interaksi JavaScript untuk halaman panel Pterodactyl
// Versi dengan upload gambar ke ImgBB dan menghasilkan link

// ======================== KONFIGURASI ========================
const ADMIN_WA_NUMBER = '6282210756431'; // Nomor admin (format 62, tanpa +)
const IMGBB_API_KEY = '2f8a5a1f8c8e8d7f6a5b4c3d2e1f0a9b'; // Dapatkan API key gratis di https://api.imgbb.com
// Ganti API_KEY di atas dengan milik Anda sendiri (daftar gratis di imgbb.com)

// ======================== ELEMEN DOM ========================
const orderModal = document.getElementById('orderModal');
const successModal = document.getElementById('successModal');
const packageInput = document.getElementById('package');
const orderForm = document.getElementById('orderForm');
const paymentProof = document.getElementById('paymentProof');
const fileNameDisplay = document.getElementById('file-name');
const uploadStatus = document.getElementById('upload-status');
const submitBtn = document.getElementById('submit-order-btn');

// ======================== FUNGSI MODAL ORDER ========================
function openOrderModal(packageName) {
    if (packageInput) {
        packageInput.value = packageName;
    }
    if (orderModal) {
        orderModal.style.display = 'flex';
    }
    // Reset form
    resetForm();
}

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

// ======================== FUNGSI RESET FORM ========================
function resetForm() {
    if (orderForm) orderForm.reset();
    if (paymentProof) paymentProof.value = '';
    if (fileNameDisplay) fileNameDisplay.innerText = 'Tidak ada file dipilih';
    if (uploadStatus) uploadStatus.innerHTML = '';
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Kirim Pesanan';
    }
}

// ======================== FUNGSI UPLOAD KE IMGBB ========================
async function uploadToImgBB(file) {
    try {
        // Tampilkan status upload
        if (uploadStatus) {
            uploadStatus.innerHTML = '<span class="uploading">⏫ Mengupload gambar...</span>';
        }

        const formData = new FormData();
        formData.append('image', file);

        // Upload ke ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Upload berhasil
            if (uploadStatus) {
                uploadStatus.innerHTML = `<span class="success">✅ Upload berhasil! Link: <a href="${data.data.url}" target="_blank">Lihat Gambar</a></span>`;
            }
            
            return {
                success: true,
                url: data.data.url,
                displayUrl: data.data.display_url,
                thumbnail: data.data.thumb?.url || data.data.url,
                deleteUrl: data.data.delete_url
            };
        } else {
            throw new Error(data.error?.message || 'Gagal upload ke ImgBB');
        }
    } catch (error) {
        console.error('Upload error:', error);
        if (uploadStatus) {
            uploadStatus.innerHTML = `<span class="error">❌ Gagal upload: ${error.message}</span>`;
        }
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================== FUNGSI UPLOAD FILE ========================
async function updateFileName() {
    if (paymentProof && fileNameDisplay) {
        if (paymentProof.files.length > 0) {
            const file = paymentProof.files[0];
            
            // Validasi tipe file
            if (!file.type.match('image.*')) {
                alert('⚠️ Hanya file gambar yang diperbolehkan (JPG, PNG, GIF)');
                paymentProof.value = '';
                fileNameDisplay.innerText = 'Tidak ada file dipilih';
                return;
            }
            
            // Validasi ukuran (max 5MB untuk ImgBB free)
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ Ukuran file maksimal 5MB');
                paymentProof.value = '';
                fileNameDisplay.innerText = 'Tidak ada file dipilih';
                return;
            }
            
            // Batasi nama file agar tidak terlalu panjang
            let fileName = file.name;
            if (fileName.length > 30) {
                fileName = fileName.substring(0, 27) + '...';
            }
            fileNameDisplay.innerText = '📎 ' + fileName;
            
            // Auto upload ke ImgBB (opsional, bisa juga diupload saat submit)
            // Uncomment baris di bawah jika ingin auto upload saat pilih file
            // await uploadToImgBB(file);
        } else {
            fileNameDisplay.innerText = 'Tidak ada file dipilih';
        }
    }
}

// ======================== FUNGSI SUBMIT FORM ========================
async function submitOrder(event) {
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
        alert('⚠️ Harap isi semua field wajib (Nama, Email, WhatsApp, Paket)');
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

    // Disable tombol submit selama proses
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Mengupload...';
    }

    // Upload file ke ImgBB
    const file = fileInput.files[0];
    const uploadResult = await uploadToImgBB(file);

    if (!uploadResult.success) {
        alert('❌ Gagal mengupload bukti pembayaran. Silakan coba lagi.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Kirim Pesanan';
        }
        return;
    }

    // Dapatkan URL gambar dari hasil upload
    const imageUrl = uploadResult.url;
    const thumbnailUrl = uploadResult.thumbnail;

    // Siapkan pesan WhatsApp dengan LINK gambar
    const pesan = `Halo Admin PteroHost, saya ingin order panel:

📦 *PAKET*: ${paket}
👤 *NAMA*: ${name}
📧 *EMAIL*: ${email}
📱 *WA*: ${whatsapp}
🎮 *GAME*: ${game || 'Tidak disebutkan'}
📝 *CATATAN*: ${notes || '-'}

🖼️ *BUKTI PEMBAYARAN*: 
${imageUrl}

(Link gambar di atas bisa langsung diklik untuk melihat bukti)

Mohon diproses dan dikirim akses panelnya. Terima kasih.`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(pesan);

    // Buat URL WhatsApp
    const waURL = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodedMessage}`;

    // Simpan URL gambar untuk referensi (opsional)
    console.log('Gambar berhasil diupload:', imageUrl);
    console.log('Thumbnail:', thumbnailUrl);

    // Buka WhatsApp di tab baru
    window.open(waURL, '_blank');

    // Tutup modal order
    closeOrderModal();

    // Tampilkan modal sukses
    setTimeout(() => {
        if (successModal) {
            successModal.style.display = 'flex';
        }
        // Reset form untuk pemesanan berikutnya
        resetForm();
    }, 500);
}

// ======================== FUNGSI BELI LANGSUNG ========================
function buyNow(paket, harga) {
    // Format harga ke Rupiah
    const hargaFormat = new Intl.NumberFormat('id-ID').format(harga);
    
    // Buat pesan template untuk pembelian langsung
    const pesan = `Halo kak, saya ingin order panel Pterodactyl:

🔹 *Paket*: ${paket}
🔹 *Harga*: Rp ${hargaFormat}

Saya sudah melakukan pembayaran via QRIS.

Untuk bukti transfer, saya akan kirimkan link gambar setelah upload.

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
window.onclick = function(event) {
    if (orderModal && event.target == orderModal) {
        orderModal.style.display = 'none';
    }
    if (successModal && event.target == successModal) {
        successModal.style.display = 'none';
    }
}

// ======================== TAMBAHKAN STYLE UNTUK STATUS UPLOAD ========================
function addUploadStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #upload-status {
            margin: 10px 0;
            padding: 8px;
            border-radius: 5px;
            font-size: 14px;
        }
        #upload-status .uploading {
            color: #f39c12;
            background: #fff3e0;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
        }
        #upload-status .success {
            color: #27ae60;
            background: #e8f5e9;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
        }
        #upload-status .success a {
            color: #27ae60;
            font-weight: bold;
            text-decoration: underline;
        }
        #upload-status .error {
            color: #c0392b;
            background: #fbe9e7;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
        }
        .file-name {
            margin: 5px 0;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 13px;
        }
    `;
    document.head.appendChild(style);
}

// ======================== INITIALIZATION ========================
document.addEventListener('DOMContentLoaded', function() {
    // Tambahkan container untuk status upload jika belum ada
    if (paymentProof && !document.getElementById('upload-status')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'upload-status';
        paymentProof.parentNode.insertBefore(statusDiv, paymentProof.nextSibling);
    }

    // Tambahkan styles
    addUploadStyles();

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

    console.log('✅ Script.js dengan fitur upload gambar ke link siap digunakan!');
});
