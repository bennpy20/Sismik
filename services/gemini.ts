
import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAcademicAdvice = async (data: AppData) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Anda adalah penasihat akademik AI. Berikut adalah data mahasiswa:
    Mata Kuliah: ${JSON.stringify(data.courses)}
    Nilai: ${JSON.stringify(data.grades)}
    
    Tolong berikan:
    1. Analisis performa saat ini (IPK).
    2. Rekomendasi mata kuliah mana yang perlu diperhatikan jika ada nilai rendah.
    3. Motivasi singkat.
    4. Tips belajar berdasarkan beban SKS yang diambil.
    
    Gunakan format Markdown yang rapi dalam Bahasa Indonesia.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, asisten AI sedang tidak tersedia saat ini.";
  }
};
