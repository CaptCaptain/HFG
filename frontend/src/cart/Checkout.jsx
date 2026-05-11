import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../auth/AuthContext";
import ItemPrice from "../components/ItemPrice";

function Checkout() {
  const navigate = useNavigate();
  const { cart, checkoutCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          successUrl: `${window.location.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Payment failed");
      }

      const { url } = await res.json();

      // Record the order locally before redirecting
      checkoutCart();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-heading">Checkout</h1>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty. Add items before checkout.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to Store
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-summary">
              {cart.map((item) => (
                <div key={item.name} className="checkout-item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="checkout-item-img"
                    />
                  )}
                  <div className="checkout-item-info">
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × <ItemPrice price={item.price} />
                    </span>
                  </div>
                  <span className="checkout-item-subtotal">
                    <ItemPrice price={item.price * item.quantity} />
                  </span>
                </div>
              ))}
              <div className="checkout-total">
                <span>Total</span>
                <span><ItemPrice price={total} /></span>
              </div>
            </div>

            {error && (
              <p style={{ color: "#ff4757", marginBottom: "1rem" }}>{error}</p>
            )}

            <div className="checkout-actions">
              <button className="btn-ghost-dark" onClick={() => navigate("/cart")} disabled={loading}>
                Back to Cart
              </button>
              <button
                className="btn-primary"
                onClick={handlePurchase}
                disabled={loading || cart.length === 0}
              >
                {loading ? "Redirecting…" : "Pay with Stripe"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;