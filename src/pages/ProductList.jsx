import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import * as productService from '../services/products'

const ProductList = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.index()
                setProducts(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <section>
            <h1>Our Matcha</h1>
            {products.length === 0 && <p>No products yet.</p>}
            <div className="product-grid">
                {products.map((product) => {
                    const lowestPrice = Math.min(...product.variants.map((v) => v.price))
                    return (
                        <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="product-card"
                        >
                            {product.image ? (
                                <img src={product.image} alt={product.name} />
                            ) : (
                                <div className="image-placeholder">No image yet</div>
                            )}
                            <h2>{product.name}</h2>
                            <p>{product.origin}</p>
                            <p>From {lowestPrice.toFixed(3)} BD</p>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

export default ProductList