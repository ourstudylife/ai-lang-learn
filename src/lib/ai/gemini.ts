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

const VERSION = "V1.0.6-FINAL-LLM";

export async function generateLanguageContent(promptName: string, variables: Record<string, string>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(`[${VERSION}] Error: GEMINI_API_KEY is missing in Vercel.`);
    }

    // Comprehensive list of models to try
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro" // Most compatible legacy model
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
            console.log(`[${VERSION}] Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // This is a server-side call
            const result = await model.generateContent(combinedPrompt);
            const response = await result.response;
            let text = response.text();

            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0];
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0];
            }

            return JSON.parse(text.trim());

        } catch (error: any) {
            console.error(`[${VERSION}] ${modelName} failed:`, error.message);
            lastError = error;

            // If it's not a 404, the issue might be Auth/Quota, so we report and stop
            if (!error.message.includes('404') && !error.message.includes('not found')) {
                break;
            }
            continue;
        }
    }

    throw new Error(`[${VERSION}] AI 404: ไม่มีรุ่นไหนใช้งานได้เลย. โปรดตรวจสอบว่า API Key ของคุณเป็นชนิด "Google AI Studio API Key" และลองสร้าง Key ใหม่ในโปรเจกต์ใหม่ครับ`);
}
