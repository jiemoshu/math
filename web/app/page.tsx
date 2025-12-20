import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
          padding: '40px 20px',
          background: '#f9fafb',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '24px',
            }}
          >
            🚧
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '16px',
            }}
          >
            正在建造中
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.6',
            }}
          >
            Singapore Math 平台正在开发中，敬请期待...
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
