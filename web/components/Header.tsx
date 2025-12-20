import Link from 'next/link'

export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          textDecoration: 'none',
        }}
      >
        Singapore Math
      </Link>
    </header>
  )
}
