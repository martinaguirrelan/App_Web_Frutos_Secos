import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Fullstack App
        </Link>
        <nav className="nav">
          <Link to="/">Inicio</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
