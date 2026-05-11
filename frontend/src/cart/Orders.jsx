import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import ItemPrice from "../components/ItemPrice";

function OrdersPage() {
  const { orders } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-heading">Order History</h1>
        {orders.length === 0 ? (
          <div className="cart-empty">
            <p>No orders yet. Complete a purchase to see your order history.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Browse Games
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-id">{order.id}</span>
                  <span className="order-status">{order.status}</span>
                  <span className="order-date">{order.date}</span>
                </div>
                <ul className="order-items">
                  {order.items.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      <span>× {item.quantity}</span>
                      <span><ItemPrice price={item.price * item.quantity} /></span>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>Total</span>
                  <span><ItemPrice price={order.total} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
