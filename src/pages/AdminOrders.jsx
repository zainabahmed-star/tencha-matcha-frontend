import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import * as orderService from '../services/orders'

const STATUS_LABELS = {
    awaiting_verification: 'Awaiting verification',
    paid: 'Confirmed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
}

const AdminOrders = ({ user }) => {
    const [orders, setOrders] = useState([])
    const [status, setStatus] = useState('awaiting_verification')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState('')

    const isAdmin = user && user.role === 'admin'

    const fetchOrders = async (filter) => {
        setLoading(true)
        setError('')
        try {
            const data = await orderService.all(filter)
            setOrders(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) fetchOrders(status)
    }, [status, isAdmin])

    const handleConfirm = async (order) => {
        if (!window.confirm(`Confirm order ${order.reference}? Only do this after you see the money in your account.`)) {
            return
        }
        setBusyId(order._id)
        setError('')
        try {
            await orderService.confirm(order._id)
            await fetchOrders(status)
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyId('')
        }
    }

    const handleReject = async (order) => {
        const reason = window.prompt('Reason for rejecting (the customer will see this):')
        if (reason === null) return
        setBusyId(order._id)
        setError('')
        try {
            await orderService.reject(order._id, reason)
            await fetchOrders(status)
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyId('')
        }
    }

    if (!isAdmin) {
        return (
            <section>
                <h1>Admin</h1>
                <p>This page is for the shop owner only.</p>
                <Link to="/sign-in">Sign In</Link>
            </section>
        )
    }

    return (
        <section>
            <h1>Orders</h1>

            <label>
                Show:
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="awaiting_verification">Awaiting verification</option>
                    <option value="paid">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All orders</option>
                </select>
            </label>

            {error && <p>{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && orders.length === 0 && <p>No orders here.</p>}

            {orders.map((order) => (
                <div key={order._id} className="order-card">
                    <h2>{order.reference}</h2>
                    <p>
                        {new Date(order.createdAt).toLocaleString()} -{' '}
                        <strong>{STATUS_LABELS[order.status] || order.status}</strong>
                    </p>

                    <h3>Items</h3>
                    <ul>
                        {order.items.map((item) => (
                            <li key={item._id}>
                                {item.name} ({item.size}) x {item.quantity} -{' '}
                                {(item.price * item.quantity).toFixed(3)} BD
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total to check in your account: {order.total.toFixed(3)} BD</strong>
                    </p>

                    <h3>Delivery</h3>
                    <p>
                        {order.shipping.fullName}
                        <br />
                        {order.shipping.phone} - {order.shipping.email}
                        <br />
                        Area: {order.shipping.area}, House: {order.shipping.house}, Block:{' '}
                        {order.shipping.block}, Road: {order.shipping.road}
                    </p>

                    <h3>Receipt</h3>
                    <a href={order.receiptUrl} target="_blank" rel="noreferrer">
                        Open receipt in a new tab
                    </a>
                    {!order.receiptUrl.toLowerCase().endsWith('.pdf') && (
                        <div>
                            <img
                                src={order.receiptUrl}
                                alt={`Receipt for ${order.reference}`}
                                style={{ maxWidth: '300px' }}
                            />
                        </div>
                    )}

                    {order.status === 'rejected' && order.rejectionReason && (
                        <p>Reason: {order.rejectionReason}</p>
                    )}

                    {order.status === 'awaiting_verification' && (
                        <div className="actions">
                            <button
                                onClick={() => handleConfirm(order)}
                                disabled={busyId === order._id}
                            >
                                Confirm payment
                            </button>
                            <button
                                onClick={() => handleReject(order)}
                                disabled={busyId === order._id}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </section>
    )
}

export default AdminOrders