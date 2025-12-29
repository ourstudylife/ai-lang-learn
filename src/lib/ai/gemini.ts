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
    // Try multiple model variants in case one is not found in the current region/API version
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    const systemPrompt = await getPrompt('00_system_core.txt');
    let targetPrompt = await getPrompt(promptName);

    // Replace variables in {{VARIABLE}} format
    for (const [key, value] of Object.entries(variables)) {
        targetPrompt = targetPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const combinedPrompt = `${systemPrompt}\n\n${targetPrompt}`;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to use model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
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
        } catch (error: any) {
            console.error(`Error with model ${modelName}:`, error.message);
            lastError = error;
            // If it's a 404, we try the next model. Otherwise, it might be a quota/auth issue, so we stop.
            if (!error.message.includes('404') && !error.message.includes('not found')) {
                break;
            }
            continue;
        }
    }

    throw lastError || new Error("Failed to generate content with any available model");
}
