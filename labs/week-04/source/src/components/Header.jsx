export default function Header({ title, subtitle }) {
  return (
    <header style={{ marginBottom: "1.5rem", borderBottom: "2px solid #eee", paddingBottom: "1rem" }}>
      <h1>{title}</h1>
      <p style={{ color: "#666", fontSize: "1.1rem" }}>{subtitle}</p>
    </header>
  )
}