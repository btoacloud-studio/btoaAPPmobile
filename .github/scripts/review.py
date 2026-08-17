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
diff_response = requests.get(diff_url, headers=github_headers)
diff = diff_response.text

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

Jika kode sudah sempurna dan bebas bug, balas dengan singkat: "✅ Audit Selesai: Kode tampak solid dan siap digabungkan. Tidak ditemukan bug kritis."
"""
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
openai_response = requests.post("https://api.openai.com/v1/chat/completions", headers=openai_headers, json=openai_payload)
response_data = openai_response.json()
Cek apakah OpenAI mengembalikan jawaban atau justru error (saldo habis, server down, dll)
if "choices" in response_data:
review_comment = response_data["choices"][0]["message"]["content"]
else:
# Mengambil pesan error dari OpenAI jika proses gagal
review_comment = f"⚠️ OpenAI API Error:\njson\n{json.dumps(response_data, indent=2)}\n"
# ==========================================
# 5. Posting Hasil Review ke Komentar GitHub PR
# ==========================================
comment_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
print("Memposting hasil review ke GitHub PR...")
post_response = requests.post(
comment_url,
headers={
"Authorization": f"Bearer {GITHUB_TOKEN}",
"Accept": "application/vnd.github+json"
},
json={"body": review_comment}
)
if post_response.status_code == 201:
print("Script selesai berjalan! Hasil audit atau log error berhasil diposting ke GitHub.")
else:
print(f"Gagal memposting ke GitHub. Status Code: {post_response.status_code}")
print(post_response.text)
