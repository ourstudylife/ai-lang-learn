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

const VERSION = "V1.0.5-DIAGNOSTIC";

export async function generateLanguageContent(promptName: string, variables: Record<string, string>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(`[${VERSION}] ไม่พบ GEMINI_API_KEY ใน Vercel.`);
    }

    const modelName = "gemini-1.5-flash";

    try {
        console.log(`[${VERSION}] Starting generation with ${modelName}`);

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

        // Basic JSON extraction
        if (text.includes('```json')) {
            text = text.split('```json')[1].split('```')[0];
        } else if (text.includes('```')) {
            text = text.split('```')[1].split('```')[0];
        }

        return JSON.parse(text.trim());

    } catch (error: any) {
        console.error(`[${VERSION}] Error:`, error);

        // Return a very specific error message so we KNOW this code is running
        throw new Error(`[${VERSION}] ติดปัญหาการเชื่อมต่อ AI: ${error.message}. หากขึ้น 404 แสดงว่า API Key ของคุณยังไม่รองรับรุ่น ${modelName}`);
    }
}
