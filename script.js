// File ini menangani semua interaksi JavaScript untuk halaman panel Pterodactyl
// Versi SEDERHANA dan STABIL dengan upload gambar ke link

// ======================== KONFIGURASI ========================
const ADMIN_WA_NUMBER = '6282210756431'; // Nomor admin (format 62, tanpa +)
const IMGBB_API_KEY = '2f8a5a1f8c8e8d7f6a5b4c3d2e1f0a9b'; // Ganti dengan API key Anda

// ======================== CEK ELEMEN DOM ========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Script dimuat...');
    setupEventListeners();
    console.log('✅ Script siap digunakan!');
});

// ======================== SETUP EVENT LISTENERS ========================
function setupEventListeners() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
    
    const paymentProof = document.getElementById('paymentProof');
    if (paymentProof) {
        paymentProof.addEventListener('change', updateFileName);
    }
}

// ======================== FUNGSI MODAL ========================
function openOrderModal(packageName) {
    const modal = document.getElementById('orderModal');
    const packageInput = document.getElementById('package');
    
    if (packageInput && packageName) {
        packageInput.value = packageName;
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ======================== FUNGSI FILE NAME ========================
function updateFileName() {
    const paymentProof = document.getElementById('paymentProof');
    const fileNameDisplay = document.getElementById('file-name');
    
    if (!paymentProof || !fileNameDisplay) return;
    
    if (paymentProof.files.length > 0) {
        const file = paymentProof.files[0];
        
        if (!file.type.startsWith('image/')) {
            alert('⚠️ Harap pilih file gambar (JPG, PNG, GIF)');
            paymentProof.value = '';
            fileNameDisplay.textContent = 'Tidak ada file dipilih';
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ Ukuran file maksimal 2MB');
            paymentProof.value = '';
            fileNameDisplay.textContent = 'Tidak ada file dipilih';
            return;
        }
        
        fileNameDisplay.textContent = '📎 ' + file.name;
    } else {
        fileNameDisplay.textContent = 'Tidak ada file dipilih';
    }
}

// ======================== FUNGSI SUBMIT FORM ========================
async function submitOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const whatsapp = document.getElementById('whatsapp')?.value.trim();
    const paket = document.getElementById('package')?.value;
    const game = document.getElementById('game')?.value;
    const notes = document.getElementById('notes')?.value.trim();
    const fileInput = document.getElementById('paymentProof');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (!name || !email || !whatsapp || !paket) {
        alert('⚠️ Harap isi semua field yang wajib diisi');
        return;
    }
    
    if (!fileInput || fileInput.files.length === 0) {
        alert('⚠️ Harap upload bukti pembayaran');
        return;
    }
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';
    }
    
    try {
        const imageUrl = await uploadToImgBB(fileInput.files[0]);
        
        if (!imageUrl) {
            throw new Error('Gagal mendapatkan link gambar');
        }
        
        const message = createWhatsAppMessage({
            name, email, whatsapp, paket, game, notes, imageUrl
        });
        
        const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        closeOrderModal();
        setTimeout(() => {
            const successModal = document.getElementById('successModal');
            if (successModal) successModal.style.display = 'flex';
        }, 300);
        
        document.getElementById('orderForm')?.reset();
        const fileNameDisplay = document.getElementById('file-name');
        if (fileNameDisplay) fileNameDisplay.textContent = 'Tidak ada file dipilih';
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal memproses pesanan. Silakan coba lagi atau hubungi admin langsung.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Pesanan';
        }
    }
}

// ======================== FUNGSI UPLOAD KE IMGBB ========================
async function uploadToImgBB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const base64Data = e.target.result.split(',')[1];
                
                const formData = new FormData();
                formData.append('key', IMGBB_API_KEY);
                formData.append('image', base64Data);
                
                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(new Error('Gagal upload ke ImgBB'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Gagal membaca file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// ======================== FUNGSI BUAT PESAN WHATSAPP ========================
function createWhatsAppMessage(data) {
    const { name, email, whatsapp, paket, game, notes, imageUrl } = data;
    
    return `Halo Admin PteroPanel, saya ingin order panel:

📦 *PAKET*: ${paket}
👤 *NAMA*: ${name}
📧 *EMAIL*: ${email}
📱 *WA*: ${whatsapp}
🎮 *GAME*: ${game || '-'}
📝 *CATATAN*: ${notes || '-'}

🖼️ *BUKTI PEMBAYARAN*: 
${imageUrl}

Mohon diproses ya, terima kasih.`;
}

// ======================== FUNGSI BUY NOW ========================
function buyNow(paket, harga) {
    const pesan = `Halo kak, saya ingin order panel:

🔹 Paket: ${paket}
🔹 Harga: Rp ${harga.toLocaleString('id-ID')}

Saya akan kirim bukti pembayaran via link.`;
    
    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, '_blank');
}

// ======================== CLICK OUTSIDE MODAL ========================
window.addEventListener('click', function(event) {
    const orderModal = document.getElementById('orderModal');
    const successModal = document.getElementById('successModal');
    
    if (orderModal && event.target === orderModal) {
        orderModal.style.display = 'none';
    }
    
    if (successModal && event.target === successModal) {
        successModal.style.display = 'none';
    }
});
