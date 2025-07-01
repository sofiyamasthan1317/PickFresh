import React, { Component, createRef } from 'react'
import Header from '../Header'
import './index.css'
import { CartContext } from '../../context/CartContext' // ✅ import this

const categories = [
  'Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Personal Care',
  'Household', 'Meat', 'Frozen', 'Baby Care', 'Stationery', 'Organic'
]

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCategory: 'Produce',
      allCategoryProducts: {},
    }
    this.categoryRefs = {}
    categories.forEach(cat => {
      this.categoryRefs[cat] = createRef()
    })
  }

  componentDidMount() {
    categories.forEach(category => this.fetchProducts(category))
  }

  fetchProducts = async category => {
    try {
      const response = await fetch(`http://localhost:3000/products/${category}`)
      const data = await response.json()
      this.setState(prev => ({
        allCategoryProducts: {
          ...prev.allCategoryProducts,
          [category]: data
        }
      }))
    } catch (error) {
      console.error(`Failed to fetch products for ${category}:`, error)
    }
  }

  scrollToCategory = category => {
    this.setState({ selectedCategory: category })
    const ref = this.categoryRefs[category]
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  render() {
    const { selectedCategory, allCategoryProducts } = this.state

    return (
      <CartContext.Consumer>
        {({ cart, addToCart, removeFromCart }) => (
          <div>
            <Header />
            <div className="home-container">
              <div className="sidebar">
                <h2 className="category-title">Categories</h2>
                <ul className="category-list">
                  {categories.map(category => (
                    <li
                      key={category}
                      className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => this.scrollToCategory(category)}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="product-section">
                {categories.map(category => (
                  <div key={category} ref={this.categoryRefs[category]} className="category-block">
                    <h2 className="product-title">{category}</h2>
                    <div className="product-list">
                      {(allCategoryProducts[category] || []).map(product => (
                        <div key={product.id} className="product-card">
                          <img src={product.image} alt={product.name} className="product-image" />
                          <h3>{product.name}</h3>
                          <p className="quantity">{product.quantity}</p>
                          <p className="price">{product.price}</p>
                          <div className="quantity-controls">
                            <button onClick={() => removeFromCart(product.id)}>-</button>
                            <span>{cart[product.id]?.count || 0}</span>
                            <button onClick={() => addToCart(product)}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CartContext.Consumer>
    )
  }
}

export default Home
