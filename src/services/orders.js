const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
})

// formData is a FormData object (items, shipping, receipt file).
// Don't set Content-Type here: the browser sets it for file uploads.
const create = async (formData) => {
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

const mine = async () => {
    const res = await fetch(`${BASE_URL}/orders/mine`, {
        headers: authHeader(),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

// admin: all orders, optional status filter
const all = async (status = '') => {
    const query = status ? `?status=${status}` : ''
    const res = await fetch(`${BASE_URL}/orders${query}`, {
        headers: authHeader(),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

// admin: confirm payment
const confirm = async (orderId) => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/confirm`, {
        method: 'PUT',
        headers: authHeader(),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

// admin: reject receipt with a reason
const reject = async (orderId, reason) => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/reject`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

export { create, mine, all, confirm, reject }