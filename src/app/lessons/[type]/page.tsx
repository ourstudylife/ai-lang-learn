"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface LessonData {
    language: string;
    lesson_type: string;
    script: {
        main: string;
        phonetic: string;
        extra: string;
    };
    meaning: string;
    tips: string;
    example: {
        target_sentence: string;
        thai_translation: string;
    };
}

export default function LessonView({ params }: { params: { type: string } }) {
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'arabic';
    const type = params.type;

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLesson = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: lang,
                    type: type,
                    level: 'beginner',
                    prompt_type: 'lesson'
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setLesson(data);
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการโหลดบทเรียน");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [lang, type]);

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="title-gradient" style={{ fontSize: '1.5rem', fontWeight: '600' }}>AI กำลังเตรียมบทเรียนให้คุณ...</div>
                    <div style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.4)' }}>ปรับเนื้อหาให้เหมาะกับคุณโดยเฉพาะ</div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div className="glass" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                    <h2 style={{ color: 'var(--error)', marginBottom: '16px' }}>ขออภัย!</h2>
                    <p style={{ marginBottom: '24px' }}>{error}</p>
                    <button className="btn-primary" onClick={fetchLesson}>ลองใหม่อีกครั้ง</button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', padding: '100px 20px' }} className="animate-fade-in">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <Link href="/lessons">
                        <button className="glass" style={{ padding: '8px 16px', color: 'white', fontSize: '0.9rem' }}>← กลับ</button>
                    </Link>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        บทเรียน: {type} | ภาษา: {lang}
                    </div>
                </div>

                {lesson && (
                    <div className="glass" style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
                        {/* Background Glow */}
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                            zIndex: 0
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                                    คำศัพท์ประจำวัน
                                </div>
                                <h2 style={{ fontSize: '5rem', fontWeight: '700', marginBottom: '8px' }}>{lesson.script.main}</h2>
                                <div style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' }}>
                                    {lesson.script.phonetic} {lesson.script.extra && `| ${lesson.script.extra}`}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                                <div className="glass" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--secondary)' }}>ความหมาย</h3>
                                    <div style={{ fontSize: '1.3rem' }}>{lesson.meaning}</div>
                                </div>
                                <div className="glass" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--accent)' }}>AI Tips</h3>
                                    <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.8)' }}>{lesson.tips}</div>
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '30px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📝</span> ตัวอย่างประโยค
                                </h3>
                                <div style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '8px' }}>{lesson.example.target_sentence}</div>
                                <div style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.6)' }}>{lesson.example.thai_translation}</div>
                            </div>

                            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                                <button className="btn-primary" onClick={fetchLesson} style={{ padding: '12px 40px' }}>
                                    บทเรียนถัดไป
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
