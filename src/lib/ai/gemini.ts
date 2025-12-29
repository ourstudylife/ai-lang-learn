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

const VERSION = "V1.0.8-STABLE";

export async function generateLanguageContent(promptName: string, variables: Record<string, string>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(`[${VERSION}] Error: GEMINI_API_KEY is missing. Please add it to Vercel Environment Variables.`);
    }

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    let lastError = null;

    // Verify prompts can be read
    const systemPrompt = await getPrompt('00_system_core.txt');
    const targetPromptFile = await getPrompt(promptName);

    if (!systemPrompt || !targetPromptFile) {
        console.error(`[${VERSION}] Failed to read prompts. Check if 'prompts' folder exists in root.`);
        throw new Error(`[${VERSION}] ไม่สามารถอ่านไฟล์ Prompt ได้ กรุณาตรวจสอบว่ามีโฟลเดอร์ prompts ในโปรเจกต์หรือไม่`);
    }

    let targetPrompt = targetPromptFile;
    for (const [key, value] of Object.entries(variables)) {
        targetPrompt = targetPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const combinedPrompt = `${systemPrompt}\n\n${targetPrompt}`;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[${VERSION}] Trying ${modelName} with API v1...`);

            // FORCING v1 API which is the stable production version
            const model = genAI.getGenerativeModel(
                { model: modelName },
                { apiVersion: 'v1' }
            );

            const result = await model.generateContent(combinedPrompt);
            const response = await result.response;
            const text = response.text();

            let cleanJson = text;
            if (cleanJson.includes('```json')) {
                cleanJson = cleanJson.split('```json')[1].split('```')[0];
            } else if (cleanJson.includes('```')) {
                cleanJson = cleanJson.split('```')[1].split('```')[0];
            }

            return JSON.parse(cleanJson.trim());

        } catch (error: any) {
            console.error(`[${VERSION}] ${modelName} Error:`, error.message);
            lastError = error;

            // If it's a 404, we continue. If it's 401/429, we stop.
            if (!error.message.includes('404') && !error.message.includes('not found')) {
                break;
            }
        }
    }

    throw new Error(`[${VERSION}] AI 404: ไม่พบรุ่นที่รองรับ. สาเหตุส่วนใหญ่คือ API Key ไม่ถูกต้อง หรือภูมิภาคเซิร์ฟเวอร์ยังไม่เปิดให้ใช้รุ่นนี้. ข้อความจาก Google: ${lastError?.message}`);
}
