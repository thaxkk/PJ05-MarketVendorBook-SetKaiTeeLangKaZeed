# Frontend starter

React + Vite frontend for Night Market Vendor Booking. The basic auth, spot, and booking flows are implemented.

Public signup creates a member account only; admin accounts are provisioned separately. Members enter a shop name when booking a spot.

The configured Atlas database already has an admin account; see the [root README](../README.md#admin-account). Admins use the same login page as members.

## Run locally

```bash
cd client
npm ci
npm run dev
```

Run the backend separately from the repository root with `npm run dev`. Frontend uses `http://localhost:3000` and Vite proxies `/api` and `/health` to `http://localhost:5001`. This project's local backend port is 5001 because macOS Control Center uses 5000 on this machine. Copy `config/config.example.env` to `config/config.env` and set `MONGO_URI` there for data-backed endpoints; the local file is ignored by Git. Use `npm run build` here to check the production build.

For the one-domain Vercel Services deployment, leave `VITE_API_BASE_URL` unset so the browser uses `/api/v1/*` on the current origin. For a separate API host, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL`; the backend CORS origin must then allow the frontend host.

## Shared contracts

- `api(path, options)` in `src/shared/api/client.js` returns the response's `data` field and throws `ApiError` with `status` on failure.
- `useAuth()` in `src/shared/auth/AuthContext.jsx` exposes `user`, `loading`, `signIn(authData)`, and `signOut()`.
