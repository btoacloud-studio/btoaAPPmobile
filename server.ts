import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini AI Helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Gemini: Smart Assistant for Dashboard / Life Assistant
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback friendly response if no API key is provided
      return res.json({
        success: true,
        response: `Halo! Saya Asisten AI NusaLife Anda. Berdasarkan ringkasan aktivitas Anda, saat ini kondisi keuangan dan produktivitas Anda cukup seimbang. Jangan lupa selesaikan tugas prioritas hari ini dan jaga kesehatan password Anda! (Tips: Sambungkan API Key untuk analisis cerdas lebih mendalam).`,
      });
    }

    const systemInstruction = `Anda adalah Asisten Kehidupan Digital (NusaLife AI Assistant) yang ramah, bijak, praktis, dan berbicara dalam Bahasa Indonesia yang santun dan suportif.
Tugas Anda adalah memberikan saran cepat, analisis keuangan, rencana perjalanan singkat, rekomendasi keamanan password, atau pemecahan tugas (breakdown to-do) sesuai permintaan pengguna. Berikan jawaban yang terstruktur, padat, dan actionable dengan bullet points jika relevan.`;

    const fullPrompt = `Konteks Pengguna Saat Ini:\n${JSON.stringify(context || {}, null, 2)}\n\nPermintaan Pengguna:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      success: true,
      response: response.text || "Tidak ada respons yang dihasilkan.",
    });
  } catch (error: any) {
    console.error("Error in AI assistant route:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Gagal memproses permintaan AI",
    });
  }
});

// API Gemini: Itinerary / Travel Planner
app.post("/api/ai/travel-planner", async (req, res) => {
  try {
    const { destination, duration, budget, style } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        plan: {
          title: `Rencana Perjalanan ke ${destination || "Destinasi Impian"}`,
          summary: `Itinerary cerdas untuk ${duration || "3 hari"} dengan estimasi budget ${budget || "hemat"}.`,
          highlights: [
            "Hari 1: Eksplorasi spot lokal & kuliner legendaris",
            "Hari 2: Kunjungan objek wisata utama & hunting foto",
            "Hari 3: Belanja oleh-oleh & persiapan pulang",
          ],
          tips: ["Siapkan e-money dan uang tunai secukupnya", "Gunakan aplikasi navigasi offline"],
          estimatedCost: budget || "Rp 1.500.000",
        },
      });
    }

    const systemInstruction = `Anda adalah travel advisor ahli Indonesia. Berikan rencana perjalanan singkat dan padat dalam format JSON yang valid.
Format JSON harus:
{
  "title": "Judul Menarik",
  "summary": "Ringkasan 2 kalimat",
  "highlights": ["Hari 1: ...", "Hari 2: ...", "Hari 3: ..."],
  "tips": ["Tips 1", "Tips 2", "Tips 3"],
  "estimatedCost": "Rp X.XXX.XXX"
}`;

    const prompt = `Destinasi: ${destination}, Durasi: ${duration}, Estimasi Budget: ${budget}, Gaya Traveling: ${style}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error("Error in travel planner:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Gagal membuat itinerary perjalanan",
    });
  }
});

// API Gemini: Task Breakdown
app.post("/api/ai/breakdown-task", async (req, res) => {
  try {
    const { taskTitle, taskCategory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        subtasks: [
          `Identifikasi langkah awal untuk ${taskTitle}`,
          `Kumpulkan bahan & referensi yang dibutuhkan`,
          `Eksekusi bagian utama tahap 1`,
          `Review & cek kualitas hasil akhir`,
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Bantu pecah tugas besar ini menjadi 3-5 sub-tugas yang konkret dan mudah dikerjakan:\nJudul Tugas: "${taskTitle}"\nKategori: "${taskCategory}"`,
      config: {
        systemInstruction: `Anda adalah pakar manajemen produktivitas. Kembalikan array JSON berisi string daftar langkah sub-tugas. Contoh: ["Langkah 1", "Langkah 2", "Langkah 3"]`,
        responseMimeType: "application/json",
      },
    });

    const subtasks = JSON.parse(response.text || "[]");
    return res.json({ success: true, subtasks });
  } catch (error: any) {
    console.error("Error in task breakdown:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Gagal memecah tugas",
    });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NusaLife Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
