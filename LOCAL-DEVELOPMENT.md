# Local development without breaking production

This project can use the deployed Render backend in production and a local Flask backend during development.

## Frontend environment files

Do not hardcode localhost in React source code.

For local testing:

```bash
cd front-end
cp .env.local.example .env.local
npm install
npm run dev
```

`.env.local` should contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:5001
VITE_USE_MOCK_BOOK_CLUB=false
```

Vite reads `.env.local` during local development. The repository `.gitignore` already ignores `*.local`, so this file should not be committed.

For production deployment, set this environment variable in the deployed frontend service:

```env
VITE_API_BASE_URL=https://group1project1-1.onrender.com
```

Use your actual Render backend URL if it differs.

## Backend local start

```bash
cd back-end
cp .env.example .env
sudo service postgresql start
createdb library_db
pipenv install
pipenv run python app.py
```

Test:

```bash
curl http://127.0.0.1:5001/
curl http://127.0.0.1:5001/health
```

The frontend should be opened at the Vite URL, usually:

```text
http://127.0.0.1:5173
```

The backend API is on port `5001`; it is not the React app.
