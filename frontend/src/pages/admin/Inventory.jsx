import { useEffect, useState } from 'react'
import { inventoryApi } from '../../services/api'

export default function AdminInventory() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState({})

  const load = () => inventoryApi.list().then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const updateStock = async (id) => {
    const val = editing[`stock_${id}`]
    if (val === undefined) return
    await inventoryApi.updateStock(id, parseFloat(val))
    setEditing(p => { const n = { ...p }; delete n[`stock_${id}`]; return n })
    load()
  }

  const updateThreshold = async (id) => {
    const val = editing[`threshold_${id}`]
    if (val === undefined) return
    await inventoryApi.updateThreshold(id, parseFloat(val))
    setEditing(p => { const n = { ...p }; delete n[`threshold_${id}`]; return n })
    load()
  }

  const getBarWidth = (item) => {
    const pct = Math.min((item.stock_kg / (item.stock_alert_threshold * 3)) * 100, 100)
    return Math.max(pct, 2)
  }

  return (
    <div className="page">
      <h1 className="page-title">Control de Inventario</h1>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>TOTAL PRODUCTOS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{items.length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>ALERTAS ACTIVAS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>
            {items.filter(i => i.status !== 'ok').length}
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>CRÍTICOS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
            {items.filter(i => i.status === 'critical').length}
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Producto</th><th>Stock actual</th><th>Umbral alerta</th><th>Estado</th><th>Nivel</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number" step="0.1" min="0"
                      defaultValue={Number(item.stock_kg).toFixed(2)}
                      style={{ width: '90px' }}
                      onChange={e => setEditing(p => ({ ...p, [`stock_${item.id}`]: e.target.value }))}
                    />
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>kg</span>
                    <button className="btn-secondary btn-sm" onClick={() => updateStock(item.id)}>✓</button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number" step="0.1" min="0"
                      defaultValue={Number(item.stock_alert_threshold).toFixed(2)}
                      style={{ width: '90px' }}
                      onChange={e => setEditing(p => ({ ...p, [`threshold_${item.id}`]: e.target.value }))}
                    />
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>kg</span>
                    <button className="btn-secondary btn-sm" onClick={() => updateThreshold(item.id)}>✓</button>
                  </div>
                </td>
                <td><span className={`badge badge-${item.status}`}>{item.status === 'ok' ? 'OK' : item.status === 'warning' ? 'Bajo' : 'Crítico'}</span></td>
                <td style={{ minWidth: '140px' }}>
                  <div className="stock-bar-wrap">
                    <div className="stock-bar-bg">
                      <div className={`stock-bar-fill fill-${item.status}`} style={{ width: `${getBarWidth(item)}%` }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', minWidth: '35px' }}>
                      {Number(item.stock_kg).toFixed(1)}
                    </span>
                  </div>
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
