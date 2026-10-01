import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '../contexts/CartContext'
import * as orderService from '../services/orders'

const PAYMENT_DETAILS = {
    method: 'Benefit / BenefitPay',
    name: 'REPLACE_WITH_OWNER_NAME',
    number: 'REPLACE_WITH_BENEFIT_NUMBER',
    iban: 'IBAN_NUMBER_HERE',
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 5 * 1024 * 1024

const Checkout = ({ user }) => {
    const navigate = useNavigate()
    const { items, total, clearCart } = useCart()

    const [shipping, setShipping] = useState({
        fullName: '',
        email: '',
        phone: '',
        area: '',
        house: '',
        block: '',
        road: '',
    })
    const [receipt, setReceipt] = useState(null)
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!user) {
        return (
            <section>
                <h1>Checkout</h1>
                <p>Please sign in to place your order.</p>
                <Link to="/sign-in">Sign In</Link> or <Link to="/sign-up">Sign Up</Link>
            </section>
        )
    }

    if (items.length === 0) {
        return (
            <section>
                <h1>Checkout</h1>
                <p>Your cart is empty.</p>
                <Link to="/">Continue shopping</Link>
            </section>
        )
    }

    const handleChange = (e) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value })
    }

    const handleFile = (e) => {
        const file = e.target.files[0]
        setMessage('')

        if (!file) {
            setReceipt(null)
            return
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage('Receipt must be a JPG, PNG, WebP or PDF file.')
            setReceipt(null)
            e.target.value = ''
            return
        }
        if (file.size > MAX_SIZE) {
            setMessage('Receipt must be smaller than 5 MB.')
            setReceipt(null)
            e.target.value = ''
            return
        }
        setReceipt(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!receipt) {
            setMessage('Please upload your payment receipt.')
            return
        }

        setSubmitting(true)
        setMessage('')

        try {
            const formData = new FormData()
            formData.append(
                'items',
                JSON.stringify(
                    items.map((i) => ({
                        productId: i.productId,
                        size: i.size,
                        quantity: i.quantity,
                    }))
                )
            )
            formData.append('shipping', JSON.stringify(shipping))
            formData.append('receipt', receipt)

            const order = await orderService.create(formData)
            clearCart()
            navigate('/order-success', { state: { order } })
        } catch (err) {
            setMessage(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section>
            <h1>Checkout</h1>

            <h2>Your order</h2>
            {items.map((item) => (
                <p key={`${item.productId}-${item.size}`}>
                    {item.name} ({item.size}) x {item.quantity} -{' '}
                    {(item.price * item.quantity).toFixed(3)} BD
                </p>
            ))}
            <h3>Total: {total.toFixed(3)} BD</h3>

            <h2>How to pay</h2>
            <ol>
                <li>
                    Transfer <strong>{total.toFixed(3)} BD</strong> using{' '}
                    {PAYMENT_DETAILS.method}.
                </li>
                <li>
                    Account name: <strong>{PAYMENT_DETAILS.name}</strong>
                    <br />
                    Number: <strong>{PAYMENT_DETAILS.number}</strong>
                    <br />
                    IBAN: <strong>{PAYMENT_DETAILS.iban}</strong>
                </li>
                <li>Take a screenshot of the receipt and upload it below.</li>
            </ol>

            <form onSubmit={handleSubmit}>
                <h2>Delivery details</h2>
                <label>
                    Name:
                    <input
                        type="text"
                        name="fullName"
                        value={shipping.fullName}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={shipping.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="tel"
                        name="phone"
                        value={shipping.phone}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Area:
                    <input
                        type="text"
                        name="area"
                        value={shipping.area}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    House number:
                    <input
                        type="text"
                        name="house"
                        value={shipping.house}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Block:
                    <input
                        type="text"
                        name="block"
                        value={shipping.block}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Road:
                    <input
                        type="text"
                        name="road"
                        value={shipping.road}
                        onChange={handleChange}
                        required
                    />
                </label>

                <h2>Payment receipt</h2>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFile}
                />

                {message && <p>{message}</p>}

                <button type="submit" disabled={!receipt || submitting}>
                    {submitting ? 'Placing order...' : 'Place order'}
                </button>
            </form>
        </section>
    )
}

export default Checkout