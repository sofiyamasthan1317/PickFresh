import React from "react";
import Header from '../Header'
import { CartContext } from "../../context/CartContext";
import "./index.css";

const CartPage = () => {
  return (
    <CartContext.Consumer>
      {({ cart }) => {
        const cartItems = Object.values(cart);

        const getTotalAmount = () => {
          return cartItems.reduce((total, item) => {
            const price = parseInt(item.price.replace("₹", ""), 10);
            return total + price * item.count;
          }, 0);
        };

        return (
          <>
          <Header />
          <div className="cart-page">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p>{item.quantity}</p>
                        <p>Price: {item.price}</p>
                        <p>Qty: {item.count}</p>
                        <p>
                          Total: ₹
                          {parseInt(item.price.replace("₹", ""), 10) *
                            item.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <h3>Total Amount: ₹{getTotalAmount()}</h3>
                </div>
              </>
            )}
          </div>
          </>
        );
      }}
    </CartContext.Consumer>
  );
};

export default CartPage;
