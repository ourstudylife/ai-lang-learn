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
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("ไม่พบ GEMINI_API_KEY ใน Environment Variables ของ Vercel กรุณาตรวจสอบการตั้งค่า");
    }

    // List of models ordered from most efficient to most powerful
    const modelsToTry = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro"
    ];

    let lastError = null;

    const systemPrompt = await getPrompt('00_system_core.txt');
    let targetPrompt = await getPrompt(promptName);

    for (const [key, value] of Object.entries(variables)) {
        targetPrompt = targetPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const combinedPrompt = `${systemPrompt}\n\n${targetPrompt}`;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🚀 Attempting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(combinedPrompt);
            const response = await result.response;
            let text = response.text();

            if (text.startsWith('```json')) {
                text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
            } else if (text.startsWith('```')) {
                text = text.replace(/```\n?/, '').replace(/\n?```/, '');
            }

            return JSON.parse(text);
        } catch (error: any) {
            console.error(`❌ Model ${modelName} failed:`, error.message);
            lastError = error;

            // Only continue if it's a 404/Not Found. 
            // If it's 429 (Quota) or 401 (Auth), we should stop and report it.
            if (error.message.includes('404') || error.message.includes('not found')) {
                continue;
            }
            break;
        }
    }

    throw new Error(`AI ไม่พร้อมใช้งานชั่วคราว: ${lastError?.message || "กรุณาลองใหม่ภายหลัง"}`);
}
