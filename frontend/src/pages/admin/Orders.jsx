import { useEffect, useState } from 'react'
import { ordersApi } from '../../services/api'

const STATUS_LABELS = { pending: 'Pendiente', in_transit: 'En Camino', delivered: 'Entregado' }
const NEXT_STATUS = { pending: 'in_transit', in_transit: 'delivered' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    const params = filterStatus ? { status: filterStatus } : {}
    ordersApi.list(params).then(r => setOrders(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus])

  const advance = async (id, currentStatus) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    await ordersApi.updateStatus(id, next)
    load()
  }

  return (
    <div className="page">
      <h1 className="page-title">Gestión de Pedidos</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'pending', 'in_transit', 'delivered'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={filterStatus === s ? 'btn-primary' : 'btn-secondary'} style={{ borderRadius: '999px' }}>
            {s === '' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Items</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="empty">Cargando...</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={7} className="empty">Sin pedidos.</td></tr>}
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name || '—'}<br /><span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{o.customer_email}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 700 }}>${Number(o.total_price).toFixed(2)}</td>
                <td><span className={`badge badge-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                <td>
                  {o.items.map(i => (
                    <div key={i.id} style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                      Prod #{i.product_id} · {Number(i.weight_kg).toFixed(2)} kg
                    </div>
                  ))}
                </td>
                <td>
                  {NEXT_STATUS[o.status] && (
                    <button className="btn-primary btn-sm" onClick={() => advance(o.id, o.status)}>
                      → {STATUS_LABELS[NEXT_STATUS[o.status]]}
                    </button>
                  )}
                  {o.status === 'delivered' && <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Finalizado</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
