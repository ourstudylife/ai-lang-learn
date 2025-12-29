"use client";

import Link from 'next/link';

const LANGUAGES = [
    { id: 'arabic', name: 'อาหรับ (Arabic)', icon: '🌙' },
    { id: 'japanese', name: 'ญี่ปุ่น (Japanese)', icon: '🌸' },
    { id: 'chinese', name: 'จีน (Chinese)', icon: '🏮' },
    { id: 'english', name: 'อังกฤษ (English)', icon: '🇬🇧' },
];

const LESSON_TYPES = [
    { id: 'alphabet', title: 'ตัวอักษร (Alphabet)', desc: 'พื้นฐานการอ่านแะเขียน' },
    { id: 'vocabulary', title: 'คำศัพท์ (Vocabulary)', desc: 'คลังคำศัพท์ที่ใช้บ่อย' },
    { id: 'grammar', title: 'ไวยากรณ์ (Grammar)', desc: 'โครงสร้างประโยคเบื้องต้น' },
];

export default function LessonsPage() {
    return (
        <main style={{ minHeight: '100vh', padding: '100px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '12px' }}>
                    เลือกภาษาที่คุณต้องการเรียน
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '40px' }}>
                    เริ่มต้นเส้นทางการเรียนรู้ภาษาใหม่ด้วยบทเรียนที่สร้างโดย AI
                </p>

                {/* Language Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '60px'
                }}>
                    {LANGUAGES.map((lang) => (
                        <div key={lang.id} className="glass" style={{ padding: '30px', transition: 'all 0.3s ease' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{lang.icon}</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>{lang.name}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {LESSON_TYPES.map((type) => (
                                    <Link key={type.id} href={`/lessons/${type.id}?lang=${lang.id}`}>
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{type.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>{type.desc}</div>
                                            </div>
                                            <span>→</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/">
                    <button className="glass" style={{ padding: '10px 20px', color: 'white' }}>← กลับหน้าหลัก</button>
                </Link>
            </div>
        </main>
    );
}
