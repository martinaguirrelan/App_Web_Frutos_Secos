import { useEffect, useState } from 'react'
import { productsApi, ordersApi, quoterApi } from '../services/api'

export default function Mixer() {
  const [products, setProducts] = useState([])
  const [mix, setMix] = useState([])
  const [quote, setQuote] = useState(null)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    productsApi.list().then(r => setProducts(r.data))
  }, [])

  const addProduct = (product) => {
    if (mix.find(i => i.product_id === product.id)) return
    setMix(prev => [...prev, { product_id: product.id, name: product.name, price_per_kg: product.price_per_kg, weight_kg: 0.5 }])
  }

  const updateWeight = (id, val) => {
    setMix(prev => prev.map(i => i.product_id === id ? { ...i, weight_kg: parseFloat(val) || 0 } : i))
  }

  const removeItem = (id) => setMix(prev => prev.filter(i => i.product_id !== id))

  const total = mix.reduce((acc, i) => acc + i.price_per_kg * i.weight_kg, 0)

  const handleQuote = async () => {
    const items = mix.map(i => ({ product_id: i.product_id, weight_kg: i.weight_kg }))
    const r = await quoterApi.quoteMix(items)
    setQuote(r.data)
  }

  const handleOrder = async () => {
    try {
      const items = mix.map(i => ({ product_id: i.product_id, weight_kg: i.weight_kg }))
      await ordersApi.create({ ...customer, items })
      setMsg({ type: 'success', text: '¡Pedido creado correctamente!' })
      setMix([])
      setQuote(null)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error al crear pedido.' })
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">The Mixer 🌰</h1>
      <div className="mixer-layout">
        <div>
          <p className="section-title">Selecciona productos</p>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {products.map(p => (
              <div
                key={p.id}
                className="product-card"
                style={{ cursor: 'pointer' }}
                onClick={() => addProduct(p)}
              >
                <div className="product-card-body">
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-price">${Number(p.price_per_kg).toFixed(2)}/kg</div>
                </div>
              </div>
            ))}
          </div>

          <p className="section-title">Tu Mix</p>
          {mix.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Haz clic en un producto para agregarlo.</p>}
          {mix.map(item => (
            <div key={item.product_id} className="mix-item">
              <span className="mix-item-name">{item.name}</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={item.weight_kg}
                onChange={e => updateWeight(item.product_id, e.target.value)}
                className="mix-item-weight"
              />
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>kg</span>
              <span className="mix-item-subtotal">${(item.price_per_kg * item.weight_kg).toFixed(2)}</span>
              <button className="btn-danger btn-sm" onClick={() => removeItem(item.product_id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="mix-summary">
          <p className="section-title">Resumen</p>
          <div className="mix-total">${total.toFixed(2)}</div>

          {quote && (
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              <div>Costo total: ${Number(quote.total_cost).toFixed(2)}</div>
              <div>Ganancia: ${Number(quote.total_profit).toFixed(2)}</div>
              <div style={{ color: quote.is_profitable ? 'var(--success)' : 'var(--danger)' }}>
                {quote.is_profitable ? '✓ Rentable' : '✗ No rentable'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Nombre cliente</label>
              <input placeholder="Opcional" value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input placeholder="Opcional" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input placeholder="Opcional" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          {msg && <p className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: '0.75rem' }}>{msg.text}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleQuote} disabled={mix.length === 0}>Ver cotización</button>
            <button className="btn-primary" onClick={handleOrder} disabled={mix.length === 0}>Añadir al Carrito</button>
          </div>
        </div>
      </div>
    </div>
  )
}
