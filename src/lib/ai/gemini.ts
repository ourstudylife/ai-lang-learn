import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getPrompt(filename: string) {
    try {
        const filePath = path.join(process.cwd(), 'prompts', filename);
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`Error reading prompt ${filename}:`, error);
        return "";
    }
}

export async function generateLanguageContent(promptName: string, variables: Record<string, string>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("ไม่พบ GEMINI_API_KEY ในระบบ. กรุณาเพิ่ม Environment Variable ใน Vercel");
    }

    // Diagnostic: Log first 5 chars of API Key to Vercel logs (safe)
    console.log(`🔑 API Key starts with: ${apiKey.substring(0, 5)}...`);

    // Models to try in order of preference
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro" // High compatibility legacy name
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🚀 Attempting AI model: ${modelName}`);

            const model = genAI.getGenerativeModel({ model: modelName });

            const systemPrompt = await getPrompt('00_system_core.txt');
            let targetPrompt = await getPrompt(promptName);

            for (const [key, value] of Object.entries(variables)) {
                targetPrompt = targetPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }

            const combinedPrompt = `${systemPrompt}\n\n${targetPrompt}`;

            const result = await model.generateContent(combinedPrompt);
            const response = await result.response;
            let text = response.text();

            // Clean up JSON formatting
            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0];
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0];
            }

            return JSON.parse(text.trim());

        } catch (error: any) {
            console.error(`❌ Model ${modelName} failed:`, error.message);
            lastError = error;

            // If it's not a 404, the issue is likely the API Key itself or Quota
            if (!error.message.includes('404') && !error.message.includes('not found')) {
                break;
            }
            continue;
        }
    }

    throw new Error(`AI ยังไม่พร้อมใช้งาน (404): กรุณาตรวจสอบว่า API Key ใน Vercel ถูกต้อง และเป็น Key จาก "Google AI Studio" ไม่ใช่ Vertex AI`);
}
