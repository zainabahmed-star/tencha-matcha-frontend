import { Link } from 'react-router'
import { useCart } from '../contexts/CartContext'

const Cart = () => {
    const { items, updateQuantity, removeItem, total } = useCart()

    if (items.length === 0) {
        return (
            <section>
                <h1>Your cart</h1>
                <p>Your cart is empty.</p>
                <Link to="/">Continue shopping</Link>
            </section>
        )
    }

    return (
        <section>
            <h1>Your cart</h1>

            {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="cart-item">
                    <div>
                        <strong>{item.name}</strong>
                        <p>{item.size} - {item.price.toFixed(3)} BD</p>
                    </div>
                    <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) =>
                            updateQuantity(item.productId, item.size, e.target.value)
                        }
                    />
                    <p>{(item.price * item.quantity).toFixed(3)} BD</p>
                    <button onClick={() => removeItem(item.productId, item.size)}>
                        Remove
                    </button>
                </div>
            ))}

            <h2>Total: {total.toFixed(3)} BD</h2>
            <Link to="/checkout">Go to checkout</Link>
        </section>
    )
}

export default Cart