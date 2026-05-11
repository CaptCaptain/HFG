import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

function LibraryPage() {
  const { library } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-heading">My Library</h1>
        {library.length === 0 ? (
          <div className="cart-empty">
            <p>You do not own any games yet. Purchase a game to add it to your library.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Browse Games
            </button>
          </div>
        ) : (
          <div className="library-grid">
            {library.map((game) => (
              <div key={game.id} className="library-card">
                <div className="library-card-info">
                  <h2>{game.name}</h2>
                  <p className="library-key">Key: <code>{game.activationKey}</code></p>
                  <p className="library-date">Purchased: {game.purchasedAt}</p>
                </div>
                <a className="btn-primary" href={game.downloadUrl}>
                  Download / Activate
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
