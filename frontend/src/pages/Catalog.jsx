import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import { useCart } from '../context/CartContext'

const CATEGORIES = ['Todas', 'Nueces', 'Frutas', 'Semillas', 'Mix']
const EMOJI = { Nueces: '🥜', Frutas: '🍇', Semillas: '🌻', Mix: '🌰' }

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('Todas')
  const [loading, setLoading] = useState(true)
  const { addToMix, mix } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    productsApi.list().then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'Todas' ? products : products.filter(p => p.category === filter)

  const handleAdd = (p) => {
    addToMix(p)
    navigate('/mixer')
  }

  return (
    <div className="page">
      <h1 className="page-title">Catálogo de Productos</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={filter === c ? 'btn-primary' : 'btn-secondary'}
            style={{ borderRadius: '999px' }}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="empty">Cargando productos...</p>}
      {!loading && filtered.length === 0 && <p className="empty">No hay productos en esta categoría.</p>}

      <div className="grid-4">
        {filtered.map(p => {
          const inMix = mix.some(i => i.product_id === p.id)
          return (
            <div key={p.id} className="product-card">
              <div className="product-card-img">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (EMOJI[p.category] || '🌰')}
              </div>
              <div className="product-card-body">
                <div className="product-card-category">{p.category || 'General'}</div>
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-desc">{p.description || 'Sin descripción.'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <div className="product-card-price">${Number(p.price_per_kg).toFixed(2)} / kg</div>
                  <button
                    className={inMix ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                    onClick={() => handleAdd(p)}
                  >
                    {inMix ? '✓ En Mixer' : '+ Agregar'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
