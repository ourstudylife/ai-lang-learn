import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hero Section */}
      <section style={{ 
        width: '100%', 
        padding: '120px 20px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }} className="animate-fade-in">
        <div className="glass" style={{ padding: '8px 20px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          🚀 ยกระดับการเรียนภาษาด้วย AI
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '700', lineHeight: '1.1' }}>
          <span className="title-gradient">AI Language learning</span><br />
          เพื่อคนไทยยุคใหม่
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'rgba(255, 255, 255, 0.7)', 
          maxWidth: '600px', 
          lineHeight: '1.6',
          margin: '10px 0 30px 0'
        }}>
          เรียนรู้ภาษาเป้าหมายอย่างเป็นธรรมชาติ ด้วยเทคโนโลยี AI ที่ปรับแต่งบทเรียนให้เข้ากับคุณโดยเฉพาะ 
          ไม่ว่าจะเป็น อาหรับ, ญี่ปุ่น, จีน หรือภาษาอื่นๆ
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/lessons">
            <button className="btn-primary" style={{ fontSize: '1.1rem' }}>
              เริ่มเรียนฟรีตอนนี้
            </button>
          </Link>
          <button className="glass" style={{ 
            padding: '12px 24px', 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            color: 'white',
            cursor: 'pointer'
          }}>
            ดูฟีเจอร์ทั้งหมด
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        width: '100%', 
        maxWidth: '1000px', 
        padding: '60px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
      }}>
        <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }} className="title-gradient">AI Tutor</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>สอนแบบตัวต่อตัว 24 ชั่วโมง</p>
        </div>
        <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }} className="title-gradient">Adaptive</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>ปรับระดับตามความเก่งของคุณ</p>
        </div>
        <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }} className="title-gradient">Native</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>เน้นการใช้งานจริงในชีวิตประจำวัน</p>
        </div>
      </section>

      {/* Background Decorative Elements */}
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        zIndex: -1,
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        zIndex: -1,
        borderRadius: '50%'
      }}></div>
    </main>
  );
}
