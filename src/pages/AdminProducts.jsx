import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import * as productService from '../services/products'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

const emptyForm = {
    name: '',
    origin: '',
    category: 'Matcha',
    description: '',
    isActive: true,
    variants: [{ size: '', price: '', stock: '' }],
}

const AdminProducts = ({ user }) => {
    const isAdmin = user && user.role === 'admin'

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [image, setImage] = useState(null)
    const [saving, setSaving] = useState(false)

    const fetchProducts = async () => {
        try {
            const data = await productService.adminIndex()
            setProducts(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) fetchProducts()
    }, [isAdmin])

    const startAdd = () => {
        setForm(emptyForm)
        setEditingId(null)
        setImage(null)
        setError('')
    }

    const startEdit = (product) => {
        setForm({
            name: product.name,
            origin: product.origin || '',
            category: product.category || '',
            description: product.description || '',
            isActive: product.isActive,
            variants: product.variants.map((v) => ({
                size: v.size,
                price: String(v.price),
                stock: String(v.stock),
            })),
        })
        setEditingId(product._id)
        setImage(null)
        setError('')
    }

    const cancelForm = () => {
        setForm(null)
        setEditingId(null)
        setImage(null)
    }

    const handleField = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    }

    const handleVariant = (index, field, value) => {
        const variants = form.variants.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
        )
        setForm({ ...form, variants })
    }

    const addVariant = () => {
        setForm({
            ...form,
            variants: [...form.variants, { size: '', price: '', stock: '' }],
        })
    }

    const removeVariant = (index) => {
        setForm({
            ...form,
            variants: form.variants.filter((_, i) => i !== index),
        })
    }

    const handleImage = (e) => {
        const file = e.target.files[0]
        setError('')

        if (!file) {
            setImage(null)
            return
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Image must be a JPG, PNG or WebP file.')
            setImage(null)
            e.target.value = ''
            return
        }
        if (file.size > MAX_SIZE) {
            setError('Image must be smaller than 5 MB.')
            setImage(null)
            e.target.value = ''
            return
        }
        setImage(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.variants.length === 0) {
            setError('Add at least one size.')
            return
        }

        const variants = form.variants.map((v) => ({
            size: v.size.trim(),
            price: Number(v.price),
            stock: Number(v.stock),
        }))

        if (variants.some((v) => !v.size || Number.isNaN(v.price) || Number.isNaN(v.stock))) {
            setError('Every size needs a name, a price and a stock number.')
            return
        }

        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('origin', form.origin)
        formData.append('category', form.category)
        formData.append('description', form.description)
        formData.append('isActive', form.isActive)
        formData.append('variants', JSON.stringify(variants))
        if (image) formData.append('image', image)

        setSaving(true)
        try {
            if (editingId) {
                await productService.update(editingId, formData)
            } else {
                await productService.create(formData)
            }
            cancelForm()
            await fetchProducts()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? To just hide it from the shop, edit it and untick "Visible in shop" instead.`)) {
            return
        }
        try {
            await productService.remove(product._id)
            await fetchProducts()
        } catch (err) {
            setError(err.message)
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
            <h1>Products</h1>

            {error && <p>{error}</p>}

            {!form && <button onClick={startAdd}>Add product</button>}

            {form && (
                <form onSubmit={handleSubmit}>
                    <h2>{editingId ? 'Edit product' : 'New product'}</h2>

                    <label>
                        Name:
                        <input name="name" value={form.name} onChange={handleField} required />
                    </label>
                    <label>
                        Origin:
                        <input name="origin" value={form.origin} onChange={handleField} />
                    </label>
                    <label>
                        Category:
                        <input name="category" value={form.category} onChange={handleField} />
                    </label>
                    <label>
                        Description:
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleField}
                        />
                    </label>

                    <label>
                        Image (JPG, PNG or WebP, max 5 MB):
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} />
                    </label>
                    {editingId && <p>Leave the image empty to keep the current one.</p>}

                    <h3>Sizes, prices and stock</h3>
                    {form.variants.map((v, i) => (
                        <div key={i} className="variant-row">
                            <input
                                placeholder="Size (e.g. 30g)"
                                value={v.size}
                                onChange={(e) => handleVariant(i, 'size', e.target.value)}
                            />
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="Price (BD)"
                                value={v.price}
                                onChange={(e) => handleVariant(i, 'price', e.target.value)}
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Stock"
                                value={v.stock}
                                onChange={(e) => handleVariant(i, 'stock', e.target.value)}
                            />
                            <button type="button" onClick={() => removeVariant(i)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addVariant}>Add size</button>

                    <label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleField}
                        />
                        Visible in shop
                    </label>

                    <div className="actions">
                        <button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save product'}
                        </button>
                        <button type="button" onClick={cancelForm}>Cancel</button>
                    </div>
                </form>
            )}

            {loading && <p>Loading...</p>}

            {products.map((product) => (
                <div key={product._id} className="order-card">
                    {product.image && (
                        <img src={product.image} alt={product.name} style={{ maxWidth: '120px' }} />
                    )}
                    <h2>
                        {product.name} {!product.isActive && '(hidden)'}
                    </h2>
                    <p>{product.origin}</p>
                    <ul>
                        {product.variants.map((v) => (
                            <li key={v._id}>
                                {v.size}: {v.price.toFixed(3)} BD, stock {v.stock}
                            </li>
                        ))}
                    </ul>
                    <div className="actions">
                        <button onClick={() => startEdit(product)}>Edit</button>
                        <button onClick={() => handleDelete(product)}>Delete</button>
                    </div>
                </div>
            ))}
        </section>
    )
}

export default AdminProducts