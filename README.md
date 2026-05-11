# Have Fun Games

S

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 19 | UI component library |
| Vite 7 | Dev server & bundler |
| React Router DOM 7 | Client-side routing |
| @supabase/supabase-js | Auth & database client |
| @stripe/stripe-js | Stripe.js loader |
| keen-slider | Game carousel component |

### Backend
| Tool | Purpose |
|---|---|
| Node.js (ESM) | Runtime |
| Express 5 | HTTP server & routing |
| Supabase | PostgreSQL database + Auth |
| Stripe | Payment processing |
| cors | Cross-origin request handling |
| dotenv | Environment variable loading |

### External APIs
- **Supabase** – database (games, cart, auth) and user authentication
- **Stripe** – hosted Checkout Sessions for card payments
- **RAWG API** – game metadata (titles, descriptions, genres, cover images)

---

## Environment Variables

Create a `.env` file in the **project root** (one level above `frontend/` and `backend/`):

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vite (frontend)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe (backend)
STRIPE_SECRET_KEY=sk_test_...

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

## Running the Application

### Prerequisites
- Node.js v18+
- A Supabase project with the `games`, `cart`, and `game_genres` tables seeded
- Stripe test API keys

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm start
# Server running on http://localhost:3000
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
# Dev server running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing Payments (Stripe test mode)

Use the test card number `4242 4242 4242 4242` with any future expiry and any 3-digit CVC on the Stripe Checkout page.

---

## Code Snippets

### 1. Stripe Checkout Session — `backend/src/routes/payments.js`

```js
router.post("/create-checkout-session", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { items, successUrl, cancelUrl } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.price * 100), // Stripe requires cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  res.json({ url: session.url, sessionId: session.id });
});
```

This Express route receives the user's cart items and creates a Stripe Checkout Session server-side. Prices from the database (stored as decimals in USD) are multiplied by 100 to convert them to cents, which is what Stripe requires. The response includes a hosted Stripe URL that the frontend redirects the user to — keeping all payment logic off the client.

---

### 2. Persistent Cart with localStorage — `frontend/src/cart/CartContext.jsx`

```js
const [cart, setCart] = useState(() => {
  const saved = localStorage.getItem("cart");
  return saved ? JSON.parse(saved) : [];
});

const addToCart = (product) => {
  const existing = cart.find((item) => item.name === product.name);

  const updated = existing
    ? cart.map((item) =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [...cart, { ...product, quantity: 1 }];

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
};
```

`CartContext` provides global cart state to the entire app using React Context. The `useState` initializer lazily reads from `localStorage` so the cart survives page refreshes. `addToCart` checks for an existing entry — if the same game is already in the cart, it increments the quantity rather than creating a duplicate entry.

---

### 3. Dynamic Genre & Price Filters — `frontend/src/pages/HomePage.jsx`

```js
const filtered = useMemo(() => {
  return GAME_GRID.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesGenre =
      selectedGenre === "All" || game.genres.includes(selectedGenre);

    const matchesPrice =
      selectedPrice === "all"
        ? true
        : selectedPrice === "under10"
        ? game.price < 10
        : selectedPrice === "under20"
        ? game.price < 20
        : game.price >= 20 && game.price <= 50;

    return matchesSearch && matchesGenre && matchesPrice;
  });
}, [GAME_GRID, search, selectedGenre, selectedPrice]);
```

`useMemo` recomputes the filtered game list only when the source data or one of the three filter values changes, avoiding unnecessary re-renders on every keystroke. All three filters — text search, genre, and price range — are applied together so they compose naturally: a user can filter by "Action" games under $20 that match a search term simultaneously.

---

## Challenges & How We Overcame Them

### 1. Frontend couldn't reach the backend from other devices on the network

**Problem:** `VITE_BACKEND_URL` was hardcoded to a remote IP address (`146.245.228.248:3000`) that was no longer active. Any device on the local network trying to access the app would get `ERR_CONNECTION_REFUSED` because `localhost:3000` on that device resolves to itself, not the machine running the backend.

**Solution:** We cleared `VITE_BACKEND_URL` to an empty string and configured a Vite dev server proxy instead. All `/api` requests from the frontend now go through Vite, which forwards them to `http://localhost:3000` on the host machine. This means the frontend only ever makes same-origin requests, and the proxy handles routing to the backend regardless of which IP the app is accessed from.

```js
// frontend/vite.config.js
server: {
  host: true, // expose on LAN
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

---

### 2. CORS errors blocking requests from LAN devices

**Problem:** The backend's CORS config only allowed the single origin stored in `FRONTEND_URL`. When teammates accessed the app from their own machines (e.g. `http://192.168.1.157:5173`), the browser blocked every API request with a CORS error because that IP wasn't in the allowed list.

**Solution:** We replaced the static origin check with a dynamic function that uses a regex to permit any `localhost`, `127.0.0.1`, or `192.168.x.x` origin. This lets any device on the local network use the app during development without having to update the `.env` file every time.

```js
// backend/src/server.js
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
```

---

### 3. Stripe payment route returning 404 after adding it to the backend

**Problem:** After creating `backend/src/routes/payments.js` and registering it in `server.js`, the frontend kept getting a 404 on `POST /api/payments/create-checkout-session`. The route existed in the code but wasn't being hit.

**Solution:** The issue was that the backend process running at the time had been started *before* the payments route was added — it was serving the old, unmodified code from memory. Node.js doesn't hot-reload by default. We identified the stale process using `lsof -ti:3000`, killed it, and restarted the server fresh. The route responded correctly immediately after.
