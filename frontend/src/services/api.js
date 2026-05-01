import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error:', err.response?.data ?? err.message)
    return Promise.reject(err)
  },
)

export const productsApi = {
  list: (activeOnly = true) => api.get(`/products?active_only=${activeOnly}`),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  remove: (id, logical = true) => api.delete(`/products/${id}?logical=${logical}`),
}

export const ordersApi = {
  list: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status?new_status=${status}`),
}

export const quoterApi = {
  calculate: (data) => api.post('/quoter/calculate', data),
  quoteMix: (items) => api.post('/quoter/mix', { items }),
  updateMargin: (productId, margin) => api.patch(`/quoter/products/${productId}/margin?margin_percent=${margin}`),
}

export const inventoryApi = {
  list: () => api.get('/inventory'),
  alerts: () => api.get('/inventory/alerts'),
  updateStock: (id, stock_kg) => api.patch(`/inventory/${id}/stock`, { stock_kg }),
  updateThreshold: (id, threshold) => api.patch(`/inventory/${id}/threshold`, { stock_alert_threshold: threshold }),
}
