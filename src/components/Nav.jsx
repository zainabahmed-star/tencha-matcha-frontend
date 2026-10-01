import { Link } from "react-router"
import { useCart } from "../contexts/CartContext"

const Nav = (props) => {
    const { count } = useCart()

    const handleSignOut = () => {
        localStorage.removeItem('token')
        props.setUser(null)
    }

    return (
        <nav>
            <Link className="nav-brand" to="/">Tencha Matcha</Link>
            {props.user ? (
                <ul>
                    <li>Welcome, {props.user.username}!</li>
                    <li><Link to="/">Shop</Link></li>
                    <li><Link to="/cart">Cart ({count})</Link></li>
                    <li><Link to="/orders">My orders</Link></li>
                    {props.user.role === 'admin' && (
                        <li><Link to="/admin/orders">Admin</Link></li>
                    )}
                    <li><Link to="/" onClick={handleSignOut}>Sign Out</Link></li>
                </ul>
            ) : (
                <ul>
                    <li><Link to="/">Shop</Link></li>
                    <li><Link to="/cart">Cart ({count})</Link></li>
                    <li><Link to="/sign-up">Sign Up</Link></li>
                    <li><Link to="/sign-in">Sign In</Link></li>
                </ul>
            )}
        </nav>
    )
}

export default Nav