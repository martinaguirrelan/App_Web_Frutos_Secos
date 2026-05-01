import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [mix, setMix] = useState([])

  const addToMix = (product) => {
    setMix(prev => {
      if (prev.find(i => i.product_id === product.id)) return prev
      return [...prev, { product_id: product.id, name: product.name, price_per_kg: Number(product.price_per_kg), weight_kg: 0.5 }]
    })
  }

  const updateWeight = (id, weight_kg) => {
    setMix(prev => prev.map(i => i.product_id === id ? { ...i, weight_kg } : i))
  }

  const removeFromMix = (id) => setMix(prev => prev.filter(i => i.product_id !== id))

  const clearMix = () => setMix([])

  const total = mix.reduce((acc, i) => acc + i.price_per_kg * i.weight_kg, 0)

  return (
    <CartContext.Provider value={{ mix, addToMix, updateWeight, removeFromMix, clearMix, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
