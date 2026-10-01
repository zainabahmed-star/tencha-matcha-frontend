const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

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

export { index, show }