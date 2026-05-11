import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import ItemPrice from "../components/ItemPrice";

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-heading">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Browse Games
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.name} className="cart-item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-img"
                    />
                  )}
                  <div className="cart-item-details">
                    <a href={item.url} className="cart-item-name">{item.name}</a>
                    <span className="cart-item-price">
                      <ItemPrice price={item.price} />
                    </span>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => decreaseQty(item.name)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => increaseQty(item.name)}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-subtotal">
                    <ItemPrice price={item.price * item.quantity} />
                  </span>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.name)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span><ItemPrice price={total} /></span>
              </div>
              <div className="cart-footer-actions">
                <button className="btn-ghost-dark" onClick={() => navigate("/")}>
                  Continue Shopping
                </button>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;