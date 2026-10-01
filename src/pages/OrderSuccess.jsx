import { Link, useLocation } from 'react-router'

const OrderSuccess = () => {
    const { state } = useLocation()
    const order = state?.order

    if (!order) {
        return (
            <section>
                <h1>Thank you!</h1>
                <Link to="/orders">View my orders</Link>
            </section>
        )
    }

    return (
        <section>
            <h1>Thank you for your order!</h1>
            <p>
                Your order number is <strong>{order.reference}</strong>.
            </p>
            <p>
                We received your receipt and we're checking the payment. We'll email you
                as soon as it's confirmed.
            </p>
            <p>Total: {order.total.toFixed(3)} BD</p>
            <Link to="/orders">View my orders</Link>
        </section>
    )
}

export default OrderSuccess