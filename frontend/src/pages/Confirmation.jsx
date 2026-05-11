import { useLocation, useSearchParams, Link } from "react-router-dom";
import ItemPrice from "../components/ItemPrice";
import styles from "./Confirmation.module.css";

export default function ConfirmationPage() {
	// Support both Stripe redirect (?session_id=...) and local router state
	const { state } = useLocation();
	const [searchParams] = useSearchParams();
	const sessionId = searchParams.get("session_id");

	const accountName = state?.accountName ?? "Guest";
	const total = state?.total ?? 0;

	return (
		<>
			<div className={styles.center}>
				<div className={styles.confirmationModal}>
					<div className={styles.confirmationHeader}>
						Thank you for your purchase!
					</div>
				</div>
				<div className={styles.confirmationModal}>
					<div className={styles.confirmationHeader}>Receipt</div>
					{sessionId ? (
						<div className={styles.confirmationMessage}>
							Payment confirmed ✓
						</div>
					) : (
						<>
							<div className={styles.confirmationMessage}>
								Account: {accountName}
							</div>
							<div className={styles.confirmationMessage}>
								Total: {<ItemPrice price={total} numberOnly />}
							</div>
						</>
					)}
					<div style={{ display: "flex", gap: "1rem", marginTop: "30px" }}>
						<Link to="/orders">
							<button>View Orders</button>
						</Link>
						<Link to="/library">
							<button>My Library</button>
						</Link>
						<Link to="/">
							<button>Return to Home</button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
