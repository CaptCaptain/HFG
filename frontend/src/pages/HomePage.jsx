import React, { useContext } from "react";
import { useState, useEffect, useMemo } from "react";
import { CartContext } from "../cart/CartContext";
import { GetAllGames, BACKEND_URL } from "../lib/api";
import GameCarousel from "../components/GameCarousel";
import HeroCanvas from "../components/HeroCanvas";
import "./HomePage.css";
import ItemPrice from "../components/ItemPrice";
import ErrorPage from "./ErrorPage";

const mapGame = (game) => ({
  title: game.title,
  genres: game.genres || [],
  desc: game.description,
  price: parseFloat(game.price),
  img: game.cover_image_url,
  url: `/game/${game.id}`,
});

const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under $10", value: "under10" },
  { label: "Under $20", value: "under20" },
  { label: "$20 – $50", value: "20to50" },
];

export default function HomePage() {
  const { addToCart } = useContext(CartContext);
  const [FEATURED_SLIDES, setFeaturedSlides] = useState([]);
  const [GAME_GRID, setGameGrid] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [allGenres, setAllGenres] = useState([]);

  useEffect(() => {
    const getRandomColor = () => {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    setLoading(true);
    GetAllGames(1, 100)
      .then((data) => {
        setFeaturedSlides(
          data.games.slice(0, 10).map((game) => ({
            title: game.title,
            genre: "",
            desc: game.description,
            tags: [],
            price: game.price,
            img: game.cover_image_url,
            url: `/game/${game.id}`,
            bg: `linear-gradient(135deg, #0a1a0a 0%, ${getRandomColor()} 100%)`,
          })),
        );

        const gridGames = data.games.slice(10).map(mapGame);
        setGameGrid(gridGames);

        // Collect all unique genres
        const genres = new Set();
        gridGames.forEach((g) => g.genres.forEach((gen) => genres.add(gen)));
        setAllGenres(["All", ...Array.from(genres).sort()]);

        setLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        setLoading(false);
      });
  }, []);

  const filteredGames = useMemo(() => {
    const results = GAME_GRID.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGenre =
        selectedGenre === "All" || game.genres.includes(selectedGenre);

      const matchesPrice =
        selectedPrice === "all" ||
        (selectedPrice === "under10" && game.price < 10) ||
        (selectedPrice === "under20" && game.price < 20) ||
        (selectedPrice === "20to50" && game.price >= 20 && game.price <= 50);

      return matchesSearch && matchesGenre && matchesPrice;
    });

    return results;
  }, [GAME_GRID, search, selectedGenre, selectedPrice]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedGenre, selectedPrice]);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero-content">
          <p className="hero-eyebrow">🎮 Your Game Store</p>
          <h1 className="hero-title">
            Have Fun
            <br />
            <span className="hero-title-accent">Games</span>
          </h1>
          <p className="hero-sub">
            Discover, buy, and play the best titles across every platform.
          </p>
          <div className="hero-actions">
            <a href="/signup" className="btn-primary">
              Get Started
            </a>
            <a href="#featured" className="btn-ghost">
              Browse Games
            </a>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-controller">🕹️</div>
        </div>
      </section>

      {/* Featured Carousel */}
      <section className="featured" id="featured">
        <h2 className="section-title">Featured &amp; Recommended</h2>
        <GameCarousel slides={FEATURED_SLIDES} />
      </section>

      {/* Game Grid */}
      <section className="browse" id="browse">
        <h2 className="section-title">Browse All</h2>

        {/* Filters */}
        <div className="filters">
          {/* Search */}
          <input
            className="filter-search"
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Price */}
          <div className="filter-group">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.value}
                className={`filter-btn ${selectedPrice === range.value ? "active" : ""}`}
                onClick={() => setSelectedPrice(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Genres */}
          <div className="filter-group filter-genres">
            {allGenres.map((genre) => (
              <button
                key={genre}
                className={`filter-btn ${selectedGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: "white", textAlign: "center" }}>Loading...</p>
        ) : (
          <>
            {filteredGames.length === 0 ? (
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                No games found matching your filters.
              </p>
            ) : (
              <div className="game-grid">
                {filteredGames.slice(0, page * 10).map((game) => (
                  <div className="game-card" key={game.title}>
                    <div className="game-card-thumb">
                      <img
                        src={game.img}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div className="game-card-info">
                      <span className="game-card-genre">
                        {game.genres[0] || ""}
                      </span>
                      <h3 className="game-card-title">
                        <a href={game.url}>{game.title}</a>
                      </h3>
                      <div className="game-card-footer">
                        <span className="game-card-price">
                          <ItemPrice price={game.price} />
                        </span>
                        <button
                          className="btn-add"
                          onClick={() => addToCart({ name: game.title, price: game.price, image: game.img, url: game.url })}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {page * 10 < filteredGames.length && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "2rem",
                  paddingBottom: "2rem",
                }}
              >
                <button
                  className="btn-primary"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
