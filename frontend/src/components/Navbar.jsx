import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { mix } = useCart()

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        🌰 Frutos<span>Secos</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/catalogo" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Catálogo</NavLink>
        <NavLink to="/mixer" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          The Mixer {mix.length > 0 && <span style={{ background: 'var(--accent)', color: '#0d0f14', borderRadius: '999px', padding: '0 6px', fontSize: '0.72rem', fontWeight: 800, marginLeft: '4px' }}>{mix.length}</span>}
        </NavLink>
        <div className="nav-divider" />
        <NavLink to="/admin/productos" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Productos</NavLink>
        <NavLink to="/admin/pedidos" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Pedidos</NavLink>
        <NavLink to="/admin/inventario" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Inventario</NavLink>
        <NavLink to="/admin/cotizador" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Cotizador</NavLink>
      </div>
    </nav>
  )
}
