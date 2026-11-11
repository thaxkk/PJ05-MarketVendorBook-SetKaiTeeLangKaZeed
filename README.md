# Night Market Vendor Spot Booking API

A RESTful backend API for browsing night market vendor spots and booking a selling space on a selected date. It supports user authentication, role-based access control, vendor spot administration, and date-specific booking rules.

## Features

### Authentication and Users

- Register and log in with email and password
- Password hashing with bcryptjs
- JWT bearer-token authentication through the Authorization header
- Roles: `admin` and `member`
- Protected routes and role-based authorization
- Public registration creates `member` accounts only; `admin` accounts are provisioned separately (for example, through a Back Office)
- Admins sign in through the same login page as members; their `role` controls access to spot management and all bookings
- Registration and login return `data.token` and set an HTTP-only cookie; authentication middleware reads the bearer header only
- Logout clears the cookie; clients must discard their bearer token, which remains valid until expiration

### Vendor Spots

- Public vendor spot listing and detail endpoints
- Admin-only create, update, and delete operations
- Fields: spot number, zone, spot size, location description, and rental fee
- All descriptive fields must be nonempty strings; rental fee must be a nonnegative number
- Spot size is descriptive text, for example `2 x 2 m`; the specification does not define a fixed unit or numeric size format
- New spots receive a MongoDB `_id` for updates, deletion, and booking creation
- Booking identity is the spot's `_id`. Spot numbers are display labels and are not constrained to be globally unique
- Deletion is a soft delete (`isActive=false`); existing bookings remain available
- Spot updates change catalog information without changing existing booking dates or owners

### Bookings

- Members book an active spot by its ID, selecting a booking date, naming the shop, and describing the product type to sell
- `storeName` belongs to each booking, so a member can use different shop names for different spots
- Each booking references one spot and the authenticated member
- Product type is free text, for example `Food and drinks` or `Handmade crafts`
- Members can view, edit, and delete their own bookings
- Admins can view, edit, and delete any member's bookings; creation is member-only
- Ownership comes from authentication and cannot be changed through request bodies
- Updates accept the fields being changed; omitted fields retain their current values
- Responses include populated spot and member details
- Booking deletion permanently removes the record and releases its spot/date and the member's daily slot

### Booking Rules

- Booking dates must be real calendar dates in `YYYY-MM-DD` format, interpreted in **UTC**, and cannot precede today
- A spot can have only one booking per UTC date across all members
- A member can book the same spot only once per date
- A member can book multiple different spots, up to three spots per UTC date
- An already booked spot is unavailable on that date; it can still be booked on another date
- The three-spot limit applies independently to each date, rather than to all future bookings combined
- Create and update enforce the same rules; updates exclude their own record and check the original owner's limit, including admin updates
- A member at the daily limit may move an existing booking to another available spot without increasing their count
- Moving a booking to a different date checks the limit on the target date
- Bookings that reference soft-deleted spots still count toward their owner's daily limit until the booking itself is deleted or moved
- History remains readable and deletable after the date or spot deletion. Editing requires a date today or later and an active target spot
- Spot and booking mutations are serialized within one Node.js process
- A unique database index on `(spot, bookingDate)` also protects spot/date exclusivity; an index on `(user, bookingDate)` supports daily-limit checks

The member's daily-count check assumes one backend process. Multiple processes or server instances require database-level transaction/locking coordination to enforce that count across instances. The unique spot/date index protects exclusivity across instances when the index exists. The specification does not define approval, payment, or product-category restrictions. Rental fee is catalog information; booking responses show the current spot details rather than a saved price.

### Security and Documentation

- Helmet security headers
- CORS support
- Rate limiting: 100 requests per IP per 10 minutes
- HTTP parameter pollution protection
- Swagger/OpenAPI documentation at `/api-docs`
- Health check at `/health` (application status only; does not check database connectivity)

## Technology Stack

- Node.js and Express.js
- MongoDB with Mongoose ODM
- JWT and bcryptjs
- Swagger UI and OpenAPI
- Nodemon for development

Dependency ranges and locked versions match PJ04-CarServiceAppoint, including Express `^5.1.0` (locked `5.2.1`) and Mongoose `^8.24.4` (locked `8.24.4`). The project uses the same CommonJS modules, async controllers, authentication middleware, Mongoose models, mutation serialization, and response conventions as the existing projects.

## Project Structure

```text
config/          Environment and database configuration
controllers/     Request handlers and business rules
middleware/      Authentication, authorization, and mutation serialization
models/          Mongoose schemas and booking indexes
routes/          Express API routes and Swagger documentation
server.js        Application entry point
2026-PJ05.md     Thai (English) project and API documentation
```

## Setup

### Deploy with Vercel Services

The root `vercel.json` deploys two services in one project: `app` (Express at the repository root) and `client` (Vite in `client/`). Set the Vercel project's framework to **Services**, with the project root at the repository root. Add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, and `JWT_COOKIE_EXPIRE` as Vercel environment variables. Do not set `VITE_API_BASE_URL` for this deployment: the browser calls the same-origin `/api/v1/*` routes. `FRONTEND_URL` is only needed if a separate frontend origin must call the API.

Public routes are `/api/*`, `/api-docs*`, and `/health` to `app`; all other paths go to `client`. The client service rewrites deep links such as `/spots/A01` to its SPA entry page. There are no service bindings: browser JavaScript cannot read a runtime binding, and neither service makes server-side calls to the other. For local integration testing, run `vercel dev --local` from the repository root after installing the Vercel CLI. Alternatively, use the separate backend and Vite dev servers described below.

The API's booking-limit serialization is process-local; multiple deployed function instances need database-level coordination to enforce the three-spots-per-member-per-day limit reliably.

1. From `PJ05-MarketVendorBook`, install the locked dependencies:

   ```bash
   npm ci
   ```

2. Copy the example configuration, then set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET`. `config/config.env` is local and ignored by Git.

   ```bash
   cp config/config.example.env config/config.env
   ```

   ```dotenv
   NODE_ENV=development
   PORT=5001
   MONGO_URI=
   JWT_SECRET=<your-secret>
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FRONTEND_URL=http://localhost:3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Use `npm start` to run without Nodemon. If PowerShell blocks `npm.ps1`, use `npm.cmd ci` and `npm.cmd run dev`.

The API runs on `http://localhost:5001` with the example configuration (port 5000 is occupied by macOS Control Center on this machine). Change `PORT` if needed. With `MONGO_URI` blank, welcome, Swagger UI, and health endpoints work; database-backed APIs require a configured connection. Allow Mongoose to create the booking uniqueness index when connecting to a new database. Keep `config/config.env` private; it is not committed.

### Admin account

The currently configured MongoDB Atlas connection has an admin account with email `admin@pj05.local`. The connection URI omits a database name, so MongoDB uses the `test` database. Sign in through the frontend's `/login` page with the password shared separately; the password is not stored in this repository.

This account is database data, not a seed included in the project. A new database or a different `MONGO_URI` will not have it automatically. Provision admins outside public registration through the `User` model (or a Back Office that uses the same password hashing flow). The public `/api/v1/auth/register` endpoint always creates a `member` and rejects attempts to register an `admin`.

## API Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Member or admin |
| GET | `/api/v1/auth/logout` | Member or admin |
| GET | `/api/v1/spots` | Public |
| GET | `/api/v1/spots/:id` | Public |
| POST | `/api/v1/spots` | Admin |
| PUT | `/api/v1/spots/:id` | Admin |
| DELETE | `/api/v1/spots/:id` | Admin |
| GET | `/api/v1/bookings` | Member sees own; admin sees all |
| GET | `/api/v1/bookings/:id` | Owner or admin |
| POST | `/api/v1/bookings` | Member |
| PUT | `/api/v1/bookings/:id` | Owner or admin |
| DELETE | `/api/v1/bookings/:id` | Owner or admin |

The 14 application endpoints are supplemented by `GET /`, `GET /health`, and `GET /api-docs`. Swagger documents all 17 operations. The public spot endpoints return active catalog entries; availability is checked for the requested date when creating or updating a booking.

Successful responses use `{ success: true, data }`, with `count` for lists. Registration and login return the JWT in `data.token`. Creation returns 201; other successful application operations return 200. Errors use `{ success: false, error }`: explicit input validation returns 400, missing/invalid authentication 401, forbidden access 403, missing resources 404, booking conflicts 409, and rate limiting 429. As in the existing projects, other unhandled Mongoose validation/cast errors reach the global error handler and default to 500. Booking duplicate-key errors are handled as 409.

### Vendor Spot Request Example

`POST /api/v1/spots` with an admin token:

```json
{
  "spotNumber": "A01",
  "zone": "Food zone",
  "spotSize": "2 x 2 m",
  "locationDescription": "Near the main entrance",
  "rentalFee": 300
}
```

### Booking Request Example

`POST /api/v1/bookings` with a member token:

```json
{
  "spot": "<spot MongoDB ID>",
  "bookingDate": "2026-12-01",
  "storeName": "Moonlight Snacks",
  "productType": "Food and drinks"
}
```

Replace the spot placeholder with `_id` from the vendor spot response. Use a date that is today or later when trying this example. The date identifies the UTC day, and the response stores it as an ISO timestamp at UTC midnight.

To reschedule, use `PUT /api/v1/bookings/:id`:

```json
{
  "bookingDate": "2026-12-02",
  "productType": "Handmade crafts"
}
```

To move to a different spot, include `spot` with the new active spot ID. The old spot/date is released after a successful move.

Send `Authorization: Bearer <JWT>` with protected requests. In Swagger, click **Authorize** and paste `data.token` without the `Bearer ` prefix. To try the complete workflow, sign in with the provisioned admin account to create spots, register a member, then book and manage spots as that member.

## Checks

```bash
npm test
```

`npm test` performs the same entry-point syntax check as the existing projects. Development verification passed 22 scenarios using real HTTP routes, controllers, middleware, JWT/password methods, and schemas with in-memory persistence, including ownership, independent daily limits, booking moves, soft deletion, slot release, and concurrent requests. It did not connect to MongoDB. Use Swagger UI against a test MongoDB database after configuring `MONGO_URI` to verify database integration.
