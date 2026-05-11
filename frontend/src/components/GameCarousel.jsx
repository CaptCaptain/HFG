import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { CartContext } from "../cart/CartContext";
import "./GameCarousel.css";

const INTERVAL = 5000; // ms per slide

function GameCarousel({ slides = [] }) {
	const { addToCart } = useContext(CartContext);
	const [current, setCurrent] = useState(0);
	const [progress, setProgress] = useState(0);
	const startRef = useRef(null);
	const rafRef = useRef(null);
	const pausedRef = useRef(false);

	const goTo = useCallback((idx) => {
		setCurrent(idx);
		setProgress(0);
		startRef.current = performance.now();
	}, []);

	const next = useCallback(() => {
		goTo((prev) => (prev + 1) % slides.length);
	}, [goTo, slides.length]);

	const prev = useCallback(() => {
		setCurrent((c) => (c - 1 + slides.length) % slides.length);
		setProgress(0);
		startRef.current = performance.now();
	}, [slides.length]);

	// Progress ticker
	useEffect(() => {
		if (!slides.length) return;
		startRef.current = performance.now();

		const tick = (now) => {
			if (!pausedRef.current) {
				const elapsed = now - startRef.current;
				const pct = Math.min((elapsed / INTERVAL) * 100, 100);
				setProgress(pct);
				if (pct >= 100) {
					setCurrent((c) => (c + 1) % slides.length);
					startRef.current = performance.now();
					setProgress(0);
				}
			}
			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [slides.length]);

	if (!slides.length) return null;

	const slide = slides[current];

	return (
		<div
			className="sc-root"
			onMouseEnter={() => {
				pausedRef.current = true;
			}}
			onMouseLeave={() => {
				pausedRef.current = false;
				startRef.current = performance.now() - (progress / 100) * INTERVAL;
			}}
		>
			{/* ── Main Feature ── */}
			<div className="sc-main">
				<div
					className="sc-art"
					style={{
						background: slide.bg || "linear-gradient(135deg,#3a0a14,#1a0508)",
					}}
				>
					{slide.img ? (
						<img
							src={slide.img}
							style={{ objectFit: "contain" }}
							alt={slide.title}
							className="sc-art-img"
						/>
					) : (
						<div className="sc-art-placeholder">🎮</div>
					)}

					{/* Prev / Next arrows */}
					<button
						className="sc-arrow sc-arrow--left"
						onClick={prev}
						aria-label="Previous"
					>
						<svg viewBox="0 0 24 24">
							<path d="M16.67 0l2.83 2.83-9.34 9.17 9.34 9.17-2.83 2.83L4.5 12z" />
						</svg>
					</button>
					<button
						className="sc-arrow sc-arrow--right"
						onClick={next}
						aria-label="Next"
					>
						<svg viewBox="0 0 24 24">
							<path d="M7.33 24l-2.83-2.83 9.34-9.17L4.5 2.83 7.33 0l12.17 12z" />
						</svg>
					</button>
				</div>

				{/* Info bar below art */}
				<div className="sc-info">
					<div className="sc-info-left">
						<h2 className="sc-title">
							<a href={slide.url}>{slide.title}</a>
						</h2>
						<div className="sc-tags">
							{(slide.tags || []).map((t) => (
								<span className="sc-tag" key={t}>
									{t}
								</span>
							))}
						</div>
						<p className="sc-desc">{slide.desc}</p>
					</div>
					<div className="sc-info-right">
						<div className="sc-price">
							{slide.price > 0
								? new Intl.NumberFormat("en-US", {
										style: "currency",
										currency: "USD",
									}).format(slide.price)
								: "Free to Play"}
						</div>
						<button
							className="sc-buy-btn"
							onClick={() => addToCart({ name: slide.title, price: slide.price, image: slide.img, url: slide.url })}
						>Add to Cart</button>
					</div>
				</div>
			</div>

			{/* ── Thumbnail Sidebar ── */}
			<div className="sc-sidebar">
				{slides.map((s, i) => (
					<button
						key={s.title}
						className={`sc-thumb${i === current ? " sc-thumb--active" : ""}`}
						onClick={() => goTo(i)}
					>
						<div
							className="sc-thumb-art"
							style={{
								background: s.bg || "linear-gradient(135deg,#3a0a14,#1a0508)",
							}}
						>
							{s.img && (
								<img src={s.img} alt={s.title} className="sc-thumb-img" />
							)}
						</div>
						<div className="sc-thumb-info">
							<span className="sc-thumb-title">{s.title}</span>
							<span className="sc-thumb-genre">{s.genre}</span>
						</div>
						{/* Progress bar — only on active */}
						{i === current && (
							<div className="sc-progress">
								<div
									className="sc-progress-bar"
									style={{ width: `${progress}%` }}
								/>
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	);
}

export default GameCarousel;
