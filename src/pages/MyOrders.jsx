import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import * as orderService from '../services/orders'

const STATUS_LABELS = {
    awaiting_verification: 'Checking your payment',
    paid: 'Confirmed, being prepared',
    rejected: 'Payment not verified',
    cancelled: 'Cancelled',
}

const MyOrders = ({ user }) => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }
        const fetchOrders = async () => {
            try {
                const data = await orderService.mine()
                setOrders(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [user])

    if (!user) {
        return (
            <section>
                <h1>My orders</h1>
                <p>Please sign in to see your orders.</p>
                <Link to="/sign-in">Sign In</Link>
            </section>
        )
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <section>
            <h1>My orders</h1>
            {orders.length === 0 && <p>You have no orders yet.</p>}

            {orders.map((order) => (
                <div key={order._id} className="order-card">
                    <h2>{order.reference}</h2>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>
                        <strong>{STATUS_LABELS[order.status] || order.status}</strong>
                    </p>
                    {order.status === 'rejected' && order.rejectionReason && (
                        <p>Reason: {order.rejectionReason}</p>
                    )}
                    <ul>
                        {order.items.map((item) => (
                            <li key={item._id}>
                                {item.name} ({item.size}) x {item.quantity}
                            </li>
                        ))}
                    </ul>
                    <p>Total: {order.total.toFixed(3)} BD</p>
                </div>
            ))}
        </section>
    )
}

export default MyOrders