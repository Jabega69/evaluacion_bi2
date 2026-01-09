import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        overflowY: 'auto'
      }}
    >
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Encabezado centrado */}
        <div style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            marginBottom: '24px',
            background: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '40px' }}>🎓</span>
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: 900,
            marginBottom: '12px',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            textAlign: 'center',
            lineHeight: 1
          }}>
            EvalResearch
          </h1>

          <p style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            Sistema de evaluación de proyectos
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <div style={{ height: '3px', width: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ height: '5px', width: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></div>
            <div style={{ height: '3px', width: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
        </div>

        {/* Formulario de login centrado */}
        <LoginForm />
      </div>
    </main>
  );
}
