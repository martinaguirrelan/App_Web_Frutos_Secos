import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'
import Mixer from './pages/Mixer'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminInventory from './pages/admin/Inventory'
import AdminQuoter from './pages/admin/Quoter'
import './App.css'

export default function App() {
  return (
    <div className="layout">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/catalogo" replace />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/mixer" element={<Mixer />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/inventario" element={<AdminInventory />} />
          <Route path="/admin/cotizador" element={<AdminQuoter />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} Frutos Secos — React · FastAPI · Supabase</footer>
    </div>
  )
}
