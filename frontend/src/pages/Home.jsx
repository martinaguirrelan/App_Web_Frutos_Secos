import { useEffect, useState } from 'react'
import { api } from '../services/api'

function Home() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data))
      .catch(() => setError('No se pudo conectar con el backend.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home">
      <h1>Bienvenido a Fullstack App</h1>
      <p>React + Vite · FastAPI · Supabase PostgreSQL</p>

      <div className="status-card">
        <h2>Estado del Backend</h2>
        {loading && <p>Verificando conexión...</p>}
        {error && <p className="error">{error}</p>}
        {status && (
          <p className="success">
            ✓ {status.message} — DB: {status.db}
          </p>
        )}
      </div>
    </div>
  )
}

export default Home
