const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const index = async () => {
    const res = await fetch(`${BASE_URL}/products`)
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

const show = async (productId) => {
    const res = await fetch(`${BASE_URL}/products/${productId}`)
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

// admin: all products, including hidden ones
const adminIndex = async () => {
    const res = await fetch(`${BASE_URL}/products/admin/all`, {
        headers: authHeader(),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

// admin: formData includes name, origin, category, description,
// isActive, variants (JSON string) and an optional image file
const create = async (formData) => {
    const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

const update = async (productId, formData) => {
    const res = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: formData,
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

const remove = async (productId) => {
    const res = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: authHeader(),
    })
    const data = await res.json()
    if (data.err) throw new Error(data.err)
    return data
}

export { index, show, adminIndex, create, update, remove }