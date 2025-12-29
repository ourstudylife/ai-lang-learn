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
        throw new Error("ไม่พบ GEMINI_API_KEY กรุณาตั้งค่าใน Vercel Environment Variables");
    }

    // Use a single, most stable model for now to avoid timeout on fallbacks
    // and explicitly set apiVersion to 'v1'
    const modelName = "gemini-1.5-flash";

    try {
        console.log(`🚀 Requesting Google AI with model: ${modelName}`);

        // Explicitly use v1 API which is more stable than v1beta
        const model = genAI.getGenerativeModel(
            { model: modelName },
            { apiVersion: 'v1' }
        );

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
        console.error(`❌ AI Generation Error:`, error);

        let errorMessage = error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";

        if (errorMessage.includes('404')) {
            errorMessage = `ไม่พบโมเดล ${modelName} (404). กรุณาตรวจสอบว่า API Key ของคุณเปิดใช้งานโปรเจกต์ Gemini 1.5 แล้ว`;
        } else if (errorMessage.includes('429')) {
            errorMessage = "โควต้า API เต็มแล้ว กรุณารอสักครู่แล้วลองใหม่";
        } else if (errorMessage.includes('API key not valid')) {
            errorMessage = "API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่าใน Vercel";
        }

        throw new Error(errorMessage);
    }
}
