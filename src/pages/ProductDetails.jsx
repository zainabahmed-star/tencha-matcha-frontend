import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import * as productService from '../services/products'
import { useCart } from '../contexts/CartContext'

const ProductDetail = () => {
    const { productId } = useParams()
    const { addItem } = useCart()
    const [product, setProduct] = useState(null)
    const [size, setSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [error, setError] = useState('')
    const [added, setAdded] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.show(productId)
                setProduct(data)
                setSize(data.variants[0].size)
            } catch (err) {
                setError(err.message)
            }
        }
        fetchProduct()
    }, [productId])

    if (error) return <p>{error}</p>
    if (!product) return <p>Loading...</p>

    const variant = product.variants.find((v) => v.size === size)

    const handleAdd = () => {
        addItem({
            productId: product._id,
            name: product.name,
            image: product.image,
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
            quantity: Math.max(1, Math.min(quantity, variant.stock)),
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <section className="product-detail">
            {product.image ? (
                <img src={product.image} alt={product.name} />
            ) : (
                <div className="image-placeholder">No image yet</div>
            )}

            <h1>{product.name}</h1>
            <p>{product.origin}</p>
            <p>{product.description}</p>

            <label>
                Size:
                <select
                    value={size}
                    onChange={(e) => {
                        setSize(e.target.value)
                        setQuantity(1)
                    }}
                >
                    {product.variants.map((v) => (
                        <option key={v._id} value={v.size}>
                            {v.size} - {v.price.toFixed(3)} BD
                        </option>
                    ))}
                </select>
            </label>

            <p>
                <strong>{variant.price.toFixed(3)} BD</strong>
            </p>

            {variant.stock === 0 ? (
                <p>Out of stock</p>
            ) : (
                <>
                    <label>
                        Quantity:
                        <input
                            type="number"
                            min="1"
                            max={variant.stock}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </label>
                    <button onClick={handleAdd}>Add to cart</button>
                    {added && <p>Added to cart!</p>}
                </>
            )}
        </section>
    )
}

export default ProductDetail