import { useEffect, useState } from 'react'
import { productsApi } from '../../services/api'

const empty = { name: '', description: '', category: '', cost_per_kg: '', margin_percent: 30, stock_kg: 0, stock_alert_threshold: 5, image_url: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)

  const load = () => productsApi.list(false).then(r => setProducts(r.data))
  useEffect(() => { load() }, [])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async () => {
    try {
      if (editing) {
        await productsApi.update(editing, form)
        setMsg({ type: 'success', text: 'Producto actualizado.' })
      } else {
        await productsApi.create(form)
        setMsg({ type: 'success', text: 'Producto creado.' })
      }
      setForm(empty); setEditing(null); setShowForm(false); load()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error.' })
    }
  }

  const startEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', category: p.category || '', cost_per_kg: p.cost_per_kg, margin_percent: p.margin_percent, stock_kg: p.stock_kg, stock_alert_threshold: p.stock_alert_threshold, image_url: p.image_url || '' })
    setEditing(p.id); setShowForm(true)
  }

  const remove = async (id, logical) => {
    await productsApi.remove(id, logical); load()
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Gestión de Productos</h1>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty) }}>
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {msg && <p className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: '1rem' }}>{msg.text}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="section-title">{editing ? 'Editar Producto' : 'Nuevo Producto'}</p>
          <div className="form-row">
            <div className="form-group"><label>Nombre*</label><input name="name" value={form.name} onChange={handle} /></div>
            <div className="form-group"><label>Categoría</label><input name="category" value={form.category} onChange={handle} /></div>
          </div>
          <div className="form-group"><label>Descripción</label><textarea name="description" value={form.description} onChange={handle} rows={2} /></div>
          <div className="form-row">
            <div className="form-group"><label>Costo/kg*</label><input name="cost_per_kg" type="number" step="0.01" value={form.cost_per_kg} onChange={handle} /></div>
            <div className="form-group"><label>Margen %</label><input name="margin_percent" type="number" step="0.5" value={form.margin_percent} onChange={handle} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Stock inicial (kg)</label><input name="stock_kg" type="number" step="0.1" value={form.stock_kg} onChange={handle} /></div>
            <div className="form-group"><label>Umbral alerta (kg)</label><input name="stock_alert_threshold" type="number" step="0.1" value={form.stock_alert_threshold} onChange={handle} /></div>
          </div>
          <div className="form-group"><label>URL Imagen</label><input name="image_url" value={form.image_url} onChange={handle} /></div>
          <button className="btn-primary" onClick={submit}>{editing ? 'Guardar cambios' : 'Crear producto'}</button>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Costo/kg</th><th>Margen</th><th>Precio/kg</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={8} className="empty">Sin productos</td></tr>}
            {products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category || '—'}</td>
                <td>${Number(p.cost_per_kg).toFixed(2)}</td>
                <td>{Number(p.margin_percent).toFixed(1)}%</td>
                <td style={{ color: 'var(--accent)', fontWeight: 700 }}>${Number(p.price_per_kg).toFixed(2)}</td>
                <td>{Number(p.stock_kg).toFixed(2)} kg</td>
                <td><span className={`badge badge-${p.active ? 'ok' : 'critical'}`}>{p.active ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-secondary btn-sm" onClick={() => startEdit(p)}>Editar</button>
                    <button className="btn-danger btn-sm" onClick={() => remove(p.id, true)}>Desactivar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
