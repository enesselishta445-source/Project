# Rent a Car CIPI SH.P.K.

Website and administrator panel for the Gjilan, Kosovo car rental business. The public site and admin panel share a SQLite database. The interface is in Albanian; vehicle and reservation data is stored on the server.

## Requirements

- Node.js 22.5 or newer (uses the built-in `node:sqlite` module).
- No third-party application dependencies or build step.
- For a public production deployment: a persistent writable disk and HTTPS reverse proxy or hosting platform.

## Run locally

1. Copy `.env.example` to `.env`.
2. In `.env`, set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters for the first start. The first start creates that administrator with a scrypt password hash. Remove the bootstrap password from `.env` after the administrator is created.
3. Start the server: `node server.mjs` (or `npm start` on a machine with npm).
4. Open `http://127.0.0.1:3000` for the public website and `http://127.0.0.1:3000/admin/login` for administrator sign-in.

Alternatively, create an administrator interactively with `node scripts/create-admin.mjs admin@example.com`. The password is entered without echo and only its scrypt hash is saved. To reset that administrator's password, pass `--reset`: `node scripts/create-admin.mjs admin@example.com --reset`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Deployment environment label. |
| `HOST` | `127.0.0.1` | Bind address; use `0.0.0.0` in containers behind a firewall or proxy. |
| `PORT` | `3000` | HTTP listening port. |
| `DATABASE_PATH` | `.data/cipi.sqlite` | SQLite database location. |
| `UPLOAD_DIR` | `uploads` | Directory for validated vehicle images. |
| `SESSION_TTL_HOURS` | `12` | Administrator session lifetime. |
| `COOKIE_SECURE` | `false` | Set to `true` when HTTPS terminates in front of this server. |
| `ADMIN_EMAIL` | unset | Optional first-run admin email. |
| `ADMIN_PASSWORD` | unset | Optional first-run password; never commit it or leave it in the deployment environment after setup. |

The database and uploaded files must be on persistent storage. This workspace includes the four real vehicles and compressed photos supplied by CIPI. New databases can load them once with `SEED_FLEET=true` on first start, or `node scripts/seed-fleet.mjs` after starting the server to create the database tables. Their unknown model years and fuel types stay marked as unspecified; the daily price displays as an enquiry until CIPI sets a price. For deployment, use a single app instance with SQLite on a persistent local volume, or migrate the data layer to a managed PostgreSQL service before scaling to multiple app instances. Terminate TLS at the host/reverse proxy, set `COOKIE_SECURE=true`, set `NODE_ENV=production`, restrict access to the database and uploads volume, and back up both volumes.

### Docker

Build the image with `docker build -t rent-a-car-cipi .`. Run it with a persistent volume and pass the first administrator password through your deployment's secret manager (do not put it in the Docker image):

```sh
docker run -d --name rent-a-car-cipi \
  -p 3000:3000 -v cipi-data:/data \
  -e ADMIN_EMAIL=rentacarcipi@gmail.com \
  -e ADMIN_PASSWORD="$CIPI_ADMIN_PASSWORD" \
  -e SEED_FLEET=true \
  -e COOKIE_SECURE=true \
  rent-a-car-cipi
```

The container exposes a health check at `/api/session`. Keep the Docker volume and create regular database/image backups.

## Included workflows

- Public vehicle inventory, featured cars, category filters, image gallery, company contact details, and reservation request form.
- Administrator authentication, protected API routes, `HttpOnly`/`SameSite=Strict` sessions, CSRF tokens, password hashing with scrypt, and login throttling.
- Vehicle create, edit, availability and featured controls, verified JPEG/PNG/WebP uploads (8 MB per file), and deletion.
- Reservation search/status filters, conflict-checked confirmation, rejection/completion and deletion.
- Customer directory with reservation history, statistics, six-month reservation chart, and editable Albanian website content.
- Phone number and contact details can be edited in the admin dashboard and are displayed on the public contact page.
- SQLite foreign keys and indexes, server-side validation, security headers, and automatic cleanup of unused uploaded images.

## API outline

- Public: `GET /api/public/vehicles`, `GET /api/public/settings`, `GET /api/public/availability`, `POST /api/public/reservations`.
- Session: `GET /api/session`, `POST /api/admin/login`, `POST /api/admin/logout`.
- Protected admin: `/api/admin/overview`, `/vehicles`, `/uploads`, `/reservations`, `/customers`, and `/settings`.

The server uses the standard Node HTTP API. There is no mock inventory; a new installation starts with an empty fleet and the actual business contact details prefilled.

## Vercel deployment

`vercel.json` publishes the static files from `public/` and maps the Albanian clean URLs to their HTML pages. The current vehicle photographs are included in `public/uploads/` so the static deployment can serve them.

The interactive backend in `server.mjs` is not part of a static Vercel deployment: the currently deployed site returns 404 for `/api/*`, and its SQLite database plus administrator-uploaded files live outside `public/`. Therefore the Vercel static deployment alone cannot process reservations, administrator login, or live inventory changes. For those features, deploy the backend with a durable database and image storage, then route `/api/*` and `/uploads/*` to it. Vercel offers Postgres through Marketplace integrations and Blob for public images; see [Postgres on Vercel](https://vercel.com/docs/postgres) and [Vercel Blob](https://vercel.com/docs/vercel-blob).
