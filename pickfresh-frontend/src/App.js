import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import LoginForm from './components/LoginForm'
import CartPage from './components/CartPage'
import { CartProvider } from './context/CartContext' 
import ProtectedRoute from './components/ProtectedRoute'

const App = () => (
  <CartProvider> {/* Wrap everything with CartProvider */}
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  </CartProvider>
)

export default App
