import { useContext } from "react";
import { CartContext } from "./CartContext";

const CartPage = () => {
  const { cart, removeFromCart } = useContext(CartContext);

  return (
    <div>
      <h1>Cart</h1>
      {cart.map((item, i) => (
        <div key={i}>
          <p>{item.name}</p>
          <button onClick={() => removeFromCart(i)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default CartPage;