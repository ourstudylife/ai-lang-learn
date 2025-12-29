import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';

// genAI will be initialized inside the function to ensure latest API Key is used

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

const VERSION = "V1.1.0-ULTIMATE-SYNC";

export async function generateLanguageContent(promptName: string, variables: Record<string, string>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(`[${VERSION}] Error: GEMINI_API_KEY is missing. Please add it to Vercel Environment Variables.`);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = [
        { name: "gemini-1.5-flash", version: "v1" },
        { name: "gemini-1.5-flash", version: "v1beta" },
        { name: "gemini-1.5-flash-latest", version: "v1" },
        { name: "gemini-1.5-pro", version: "v1" },
        { name: "gemini-1.5-pro", version: "v1beta" },
        { name: "gemini-pro", version: "v1beta" },
        { name: "gemini-1.0-pro", version: "v1" }
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

    for (const config of modelsToTry) {
        try {
            console.log(`[${VERSION}] Attempting ${config.name} on ${config.version}...`);

            const model = genAI.getGenerativeModel(
                { model: config.name },
                { apiVersion: config.version }
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
            console.error(`[${VERSION}] ${config.name} (${config.version}) Error:`, error.message);
            lastError = error;

            // If it's a 404, we continue. If it's 401/429, we stop.
            if (!error.message.includes('404') && !error.message.includes('not found')) {
                break;
            }
        }
    }

    throw new Error(`[${VERSION}] AI ยังไม่พร้อมใช้งาน: ขอแนะนำให้คุณลอง "สร้าง API KEY ใหม่ในโปรเจกต์ใหม่" จาก AI Studio ครับ. (Error: ${lastError?.message})`);
}
