// Can be used on any page to add an item to the cart.
import { useContext } from "react";
import { CartContext } from "../cart/CartContext";

export default function CartButton({ text, game }) {
	// Default text if not specified
	if (!text) text = "Add to Cart";

	const { addToCart } = useContext(CartContext);

	const handleClick = () => {
		if (!game) return;
		addToCart(game);
	};

	return (
		<>
			<button onClick={handleClick}>{text}</button>
		</>
	);
}
