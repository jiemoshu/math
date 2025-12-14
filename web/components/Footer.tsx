export default function Footer() {
  return (
    <footer
      style={{
        padding: '24px',
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
      }}
    >
      <p>&copy; {new Date().getFullYear()} Singapore Math. All rights reserved.</p>
    </footer>
  )
}
