import { NextResponse } from 'next/server';
import { generateLanguageContent } from '@/lib/ai/gemini';

export async function POST(req: Request) {
    try {
        const { language, type, level, prompt_type } = await req.json();

        if (!prompt_type) {
            return NextResponse.json({ error: "Missing prompt_type" }, { status: 400 });
        }

        let result;
        if (prompt_type === 'lesson') {
            result = await generateLanguageContent('01_master_lesson_prompt.txt', {
                LANGUAGE: language || 'arabic',
                TYPE: type || 'vocabulary',
                LEVEL: level || 'beginner'
            });
        } else if (prompt_type === 'quiz') {
            result = await generateLanguageContent('02_listening_quiz_prompt.txt', {
                LANGUAGE: language || 'arabic',
                TYPE: type || 'vocabulary',
                LEVEL: level || 'beginner'
            });
        } else {
            return NextResponse.json({ error: "Invalid prompt_type" }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 });
    }
}
