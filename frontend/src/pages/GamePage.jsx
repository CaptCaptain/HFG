import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { GetGameInfo } from "../lib/api";
import { RatingStar } from "rating-star";

import ErrorPage from "./ErrorPage";

import HeroCanvas from "../components/HeroCanvas";
import ItemPrice from "../components/ItemPrice";

import PurchaseButton from "../components/CartButton";
import Thumbnail from "../components/Thumbnail";

import styles from "./GamePage.module.css";
import CartButton from "../components/CartButton";

export default function GamePage() {
	const params = useParams();

	const [gameData, setGameData] = useState({});
	// Price wasn't showing up correctly so we use a separate state
	const [gamePrice, setGamePrice] = useState(0);
	const [dataReady, setDataReady] = useState(false);
	const [error, setError] = useState(false);

	// Since the game ID is a UID, we do not need to fetch from the backend if the parameter provided is not a UID.
	const UID_REGEX =
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

	useEffect(() => {
		if (!UID_REGEX.test(params.id)) return;
		GetGameInfo(params.id)
			.then((data) => {
				if (data.error) setError(true);
				setGameData(data);
				setGamePrice(data.price);
				setDataReady(true);
			})
			.catch((err) => console.warn(err));
	}, [params.id]);

	if (!UID_REGEX.test(params.id) || error)
		return (
			<>
				<ErrorPage message="This item is not available" />
			</>
		);

	return (
		<>
			<div className={styles.center}>
				<div className={`${styles.gamePage} ${dataReady ? "" : styles.hidden}`}>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignContent: "center",
							justifyContent: "center",
							padding: "60px",
						}}
					>
						{/* Game Cover */}
						<img
							src={gameData.cover_image_url}
							className={styles.dropShadow}
							style={{
								width: "25%",
								objectFit: "cover",
							}}
						/>
					</div>
					<div className={styles.gamePageContent}>
						<div
							className={`${styles.gamePageSection} ${styles.gamePageSectionLeft}`}
						>
							{/* Purchase Modal */}
							<div className={styles.purchaseModal}>
								<div className={styles.purchaseModalTitle}>
									{gamePrice != "0" ? "Buy" : "Get"} {gameData.title}
								</div>
								<ItemPrice price={gamePrice} />
								<div style={{ display: "flex" }}>
									<div
										style={{
											display: "flex",
											justifyContent: "left",
											width: "50%",
											marginTop: "50px",
										}}
									>
										<CartButton game={{
										name: gameData.title,
										price: parseFloat(gamePrice),
										image: gameData.cover_image_url,
										url: `/game/${params.id}`,
									}} />
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "right",
											width: "50%",
										}}
									></div>
								</div>
							</div>
						</div>
						<div
							className={`${styles.gamePageSection} ${styles.gamePageSectionRight}`}
						>
							{/* Game Trailer */}
							<video
								style={{ width: "100%", aspectRatio: 16 / 9 }}
								autoPlay
								playsInline
								muted
								loop
								src={gameData.micro_trailer_url}
							/>
							<div style={{ display: "flex", flexDirection: "column" }}>
								<p>Release Date: {gameData.release_date}</p>
								<p>Developer: {gameData.developer}</p>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "baseline",
										height: "50px",
									}}
								>
									<p>Ratings: </p>
									<RatingStar
										maxScore={1}
										rating={gameData.rating * 100}
										size="20"
									/>
								</div>
							</div>
						</div>
					</div>
					{/* Game Description */}
					<div style={{ padding: "10px 60px 60px 60px" }}>
						{gameData.description}
					</div>
				</div>
			</div>
			<div className={`${styles.background} ${dataReady ? "" : styles.hidden}`}>
				<HeroCanvas />
			</div>
		</>
	);
}
