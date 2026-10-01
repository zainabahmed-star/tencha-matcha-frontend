import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem('cart')) || []
    } catch {
        return []
    }
}

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(loadCart)

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addItem = (item) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.productId === item.productId && i.size === item.size
            )
            if (existing) {
                return prev.map((i) =>
                    i === existing
                        ? {
                              ...i,
                              price: item.price,
                              stock: item.stock,
                              quantity: Math.min(i.quantity + item.quantity, item.stock),
                          }
                        : i
                )
            }
            return [...prev, item]
        })
    }

    const updateQuantity = (productId, size, quantity) => {
        setItems((prev) =>
            prev.map((i) =>
                i.productId === productId && i.size === size
                    ? { ...i, quantity: Math.max(1, Math.min(Number(quantity) || 1, i.stock)) }
                    : i
            )
        )
    }

    const removeItem = (productId, size) => {
        setItems((prev) =>
            prev.filter((i) => !(i.productId === productId && i.size === size))
        )
    }

    const clearCart = () => setItems([])

    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const total = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 1000) / 1000

    return (
        <CartContext.Provider
            value={{ items, addItem, updateQuantity, removeItem, clearCart, count, total }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)