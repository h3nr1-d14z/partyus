# App Ads & Policies Template

A Next.js application that serves app-ads.txt and privacy policies content from external URLs with optional caching.

## Features

- **/app-ads.txt** - Serves app-ads.txt content from a configured URL
- **/policies** - Serves privacy policy content from a configured URL
- **Automatic caching** - Content is cached (in-memory) to reduce load on source URLs
- **Normalization** - Normalizes CSV-style app-ads rows (strips surrounding quotes, trims fields, and validates relation column)
- **Error handling** - Gracefully handles fetch errors and serves cached content when available

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your URLs and organization name:
   ```
   APP_ADS_URL=https://your-app-ads-url.com
   POLICIES_URL=https://sites.google.com/view/your-privacy-policy/home
   NEXT_PUBLIC_ORG_NAME=Your Organization Name
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to see the app

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure environment variables in Vercel:
   - `APP_ADS_URL` - URL for app-ads.txt content
   - `POLICIES_URL` - URL for privacy policy content
   - `NEXT_PUBLIC_ORG_NAME` - Name of your organization (displayed in the site footer)

4. Deploy!

## How it Works

The application fetches content from the configured URLs and caches it in memory. When a request comes in:

1. Check if cached data exists and is less than 1 hour old
2. If cache is valid, return cached data
3. If cache is expired or doesn't exist, fetch fresh data from the URL
4. Cache the new data and return it
5. If fetch fails but cached data exists, return the stale cache

Note: the cache is in-memory and will be lost on process restart; in serverless or multi-instance deployments you may want a shared cache (Redis, etc.).

## App-ads normalization & common sources

- The app normalizes CSV rows for app-ads entries: it respects quoted CSV fields, strips surrounding quotes, removes stray quotes, trims whitespace, and formats rows as `domain, publisher-id, DIRECT|RESELLER`.
- If the configured APP_ADS_URL points to a Google Sheets "publish to web" CSV link, some endpoints return a small HTML "Temporary Redirect" page that contains a real CSV URL. The server attempts to detect and follow that redirect to fetch the actual CSV before normalizing.

## Troubleshooting

- If you see garbage or HTML instead of CSV at `/app-ads.txt`, confirm `APP_ADS_URL` is a direct CSV or public publish URL and not blocked. The server will try to follow a redirect link if an HTML redirect page is detected.
- If you want stricter caching or to change cache duration, update `src/lib/cache.ts` or remove the `skipCache` option in the route handlers to enable the in-memory cache.

## API Routes

- `GET /app-ads.txt` - Returns plain text app-ads content
- `GET /policies` - Returns HTML privacy policy content

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ADS_URL` | URL to fetch app-ads.txt content from | `https://example.com/app-ads.txt` |
| `POLICIES_URL` | URL to fetch privacy policy content from | `https://example.com/privacy` |
| `NEXT_PUBLIC_ORG_NAME` | Organization name displayed in the site footer | `My Company` |

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run linter
```
