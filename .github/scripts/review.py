import os
import requests
import json

# ==========================================
# 1. Inisialisasi Variabel Lingkungan
# ==========================================
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
REPO = os.environ.get("GITHUB_REPOSITORY")
PR_NUMBER = os.environ.get("PR_NUMBER")

# Validasi jika variabel lingkungan tidak ditemukan
if not all([GITHUB_TOKEN, OPENAI_API_KEY, REPO, PR_NUMBER]):
    print("Error: Variabel lingkungan tidak lengkap. Pastikan GITHUB_TOKEN, OPENAI_API_KEY, GITHUB_REPOSITORY, dan PR_NUMBER sudah diatur.")
    exit(1)

# ==========================================
# 2. Ambil Git Diff dari PR GitHub
# ==========================================
github_headers = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3.diff"
}
diff_url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}"

try:
    diff_response = requests.get(diff_url, headers=github_headers, timeout=30)
    
    # Periksa status code response dari GitHub API
    if diff_response.status_code != 200:
        print(f"Error: Gagal mengambil diff dari GitHub. Status Code: {diff_response.status_code}")
        print(f"Response: {diff_response.text}")
        exit(1)
    
    diff = diff_response.text
    
    # Validasi bahwa diff tidak kosong
    if not diff.strip():
        print("Error: Diff kosong. Tidak ada perubahan untuk diaudit.")
        exit(1)
        
except requests.exceptions.RequestException as e:
    print(f"Error: Gagal terhubung ke GitHub API: {e}")
    exit(1)

# Batasi ukuran diff agar tidak melebihi token limit AI (maks 20.000 karakter)
if len(diff) > 20000:
    diff = diff[:20000] + "\n\n... [Diff terlalu panjang, dipotong untuk alasan kapasitas]"

# ==========================================
# 3. Siapkan Prompt untuk OpenAI
# ==========================================
prompt_system = """
Anda adalah seorang Principal Software Engineer dan Security Auditor dengan misi mencapai 'zero bugs'.
Tugas Anda adalah mengaudit git diff yang diberikan dengan sangat ketat dan memperbaiki setiap error yang ditemukan.

Fokus pada:
1. Syntax error dan Runtime error (Null reference, index out of bounds, dll).
2. Logic error dan edge cases yang tidak tertangani.
3. Memory leaks atau masalah performa (inefisiensi looping, N+1 query).
4. Celah keamanan (Injection, XSS, insecure dependencies).

Format jawaban Anda HANYA dalam Markdown dengan struktur berikut untuk setiap temuan:
### 🐛 [Nama File] - [Jenis Bug]
* **Akar Masalah:** Penjelasan singkat mengapa kode ini bermasalah/berpotensi error.
* **Perbaikan:** ```[bahasa pemrograman]
// Masukkan kode yang sudah DIPERBAIKI SEPENUHNYA di sini
// Kode ini harus siap di-copy-paste oleh developer


Jika kode sudah sempurna dan bebas bug, balas dengan singkat: "✅ Audit Selesai: Kode tampak solid dan siap digabungkan. Tidak ditemukan bug kritis." """

openai_payload = {
    "model": "gpt-4o",
    "messages": [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": f"Berikut adalah perubahan kode yang perlu diaudit:\n\n{diff}"}
    ],
    "temperature": 0.1
}

# ==========================================
# 4. Kirim Data ke OpenAI & Tangani Error
# ==========================================
openai_headers = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json"
}

print("Mengirim data ke OpenAI untuk dianalisis...")

try:
    openai_response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=openai_headers,
        json=openai_payload,
        timeout=60  # Timeout lebih lama untuk request ke AI
    )
    
    # Periksa status code response dari OpenAI API
    if openai_response.status_code != 200:
        try:
            error_data = openai_response.json()
            error_message = json.dumps(error_data, indent=2)
        except json.JSONDecodeError:
            error_message = openai_response.text
        
        review_comment = f"⚠️ OpenAI API Error (Status Code: {openai_response.status_code}):\n```json\n{error_message}\n```"
    else:
        try:
            response_data = openai_response.json()
            
            # Cek apakah OpenAI mengembalikan jawaban yang valid
            if "choices" in response_data and len(response_data["choices"]) > 0:
                review_comment = response_data["choices"][0]["message"]["content"]
            else:
                # Mengambil pesan error dari OpenAI jika proses gagal
                review_comment = f"⚠️ OpenAI API Error: Response tidak mengandung 'choices':\n```json\n{json.dumps(response_data, indent=2)}\n```"
        except json.JSONDecodeError as e:
            review_comment = f"⚠️ OpenAI API Error: Gagal parse response JSON: {e}"

except requests.exceptions.Timeout:
    review_comment = "⚠️ OpenAI API Error: Request timeout setelah 60 detik."
except requests.exceptions.RequestException as e:
    review_comment = f"⚠️ OpenAI API Error: Gagal terhubung ke OpenAI API: {e}"

# ==========================================
# 5. Posting Hasil Review ke Komentar GitHub PR
# ==========================================
comment_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
print("Memposting hasil review ke GitHub PR...")

try:
    post_response = requests.post(
        comment_url,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
        },
        json={"body": review_comment},
        timeout=30
    )
    
    if post_response.status_code == 201:
        print("Script selesai berjalan! Hasil audit atau log error berhasil diposting ke GitHub.")
    else:
        print(f"Gagal memposting ke GitHub. Status Code: {post_response.status_code}")
        print(f"Response: {post_response.text}")
        exit(1)
        
except requests.exceptions.RequestException as e:
    print(f"Error: Gagal terhubung ke GitHub API saat memposting komentar: {e}")
    exit(1)