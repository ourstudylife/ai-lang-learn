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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = await getPrompt('00_system_core.txt');
    let targetPrompt = await getPrompt(promptName);

    // Replace variables in {{VARIABLE}} format
    for (const [key, value] of Object.entries(variables)) {
        targetPrompt = targetPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const combinedPrompt = `${systemPrompt}\n\n${targetPrompt}`;

    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up JSON if AI includes markdown code blocks
    if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
    } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '').replace(/\n?```/, '');
    }

    return JSON.parse(text);
}
