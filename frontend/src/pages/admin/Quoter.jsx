import { useState, useEffect } from 'react'
import { quoterApi, productsApi } from '../../services/api'

export default function AdminQuoter() {
  const [cost, setCost] = useState('')
  const [margin, setMargin] = useState(30)
  const [result, setResult] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [newMargin, setNewMargin] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => { productsApi.list(false).then(r => setProducts(r.data)) }, [])

  const calculate = async () => {
    if (!cost) return
    const r = await quoterApi.calculate({ cost_per_kg: parseFloat(cost), margin_percent: parseFloat(margin) })
    setResult(r.data)
  }

  const applyMargin = async () => {
    if (!selectedProduct || !newMargin) return
    try {
      await quoterApi.updateMargin(selectedProduct, parseFloat(newMargin))
      setMsg({ type: 'success', text: 'Margen actualizado correctamente.' })
      productsApi.list(false).then(r => setProducts(r.data))
    } catch {
      setMsg({ type: 'error', text: 'Error al actualizar margen.' })
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Cotizador de Margen</h1>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <p className="section-title">Calculadora de Precio</p>
          <div className="form-group">
            <label>Costo por kg ($)*</label>
            <input type="number" step="0.01" placeholder="Ej: 4500" value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Margen de ganancia (%)</label>
            <input type="range" min="0" max="200" value={margin} onChange={e => setMargin(e.target.value)} style={{ padding: 0, border: 'none', background: 'none', accentColor: 'var(--accent)' }} />
            <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '1.25rem' }}>{margin}%</div>
          </div>
          <button className="btn-primary" onClick={calculate} style={{ width: '100%' }}>Calcular</button>

          {result && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="card" style={{ background: 'var(--surface2)' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>PRECIO DE VENTA</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>${Number(result.price_per_kg).toFixed(2)}/kg</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="card" style={{ flex: 1, background: 'var(--surface2)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>COSTO</div>
                  <div style={{ fontWeight: 700 }}>${Number(result.cost_per_kg).toFixed(2)}</div>
                </div>
                <div className="card" style={{ flex: 1, background: 'var(--surface2)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>GANANCIA/kg</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>${Number(result.profit_per_kg).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <p className="section-title">Actualizar Margen de Producto</p>
          <div className="form-group">
            <label>Producto</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">Selecciona un producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} — actual: {Number(p.margin_percent).toFixed(1)}%</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nuevo margen (%)</label>
            <input type="number" step="0.5" value={newMargin} onChange={e => setNewMargin(e.target.value)} placeholder="Ej: 35" />
          </div>
          {msg && <p className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: '0.75rem' }}>{msg.text}</p>}
          <button className="btn-primary" onClick={applyMargin} style={{ width: '100%' }}>Aplicar margen</button>

          <div style={{ marginTop: '1.5rem' }}>
            <p className="section-title">Fórmula de Precio</p>
            <div className="card" style={{ background: 'var(--surface2)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 2 }}>
              Precio Venta = Costo/kg × (1 + %Margen / 100)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
