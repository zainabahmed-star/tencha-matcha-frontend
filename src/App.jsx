import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import SignInForm from "./pages/SignInForm"
import ProductList from "./pages/ProductList"
import ProductDetail from "./pages/ProductDetails"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import OrderSuccess from "./pages/OrderSuccess"
import MyOrders from "./pages/MyOrders"
import AdminOrders from "./pages/AdminOrders"
import AdminProducts from "./pages/AdminProducts"
import './App.css'
import { Routes, Route } from "react-router"
import { useState } from "react"

const getUserFromToken = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  return JSON.parse(atob(token.split('.')[1])).payload
}

const App = () => {

  const [user, setUser] = useState(getUserFromToken())

  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
        <Routes>
          <Route path='/' element={<ProductList />} />
          <Route path='/products/:productId' element={<ProductDetail />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout user={user} />} />
          <Route path='/order-success' element={<OrderSuccess />} />
          <Route path='/orders' element={<MyOrders user={user} />} />
          <Route path='/admin/orders' element={<AdminOrders user={user} />} />
          <Route path='/admin/products' element={<AdminProducts user={user} />} />
          <Route path='/sign-up' element={<SignUpForm setUser={setUser} />} />
          <Route path='/sign-in' element={<SignInForm setUser={setUser} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App