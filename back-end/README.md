# Library App

This project now has a React frontend and a Flask backend that work together for authentication and saving books.

## What you need

- Python 3.12+
- Node.js 20.19+ or 22.12+
- npm
- pipenv

## Backend setup

1. Go to the backend folder:
   ```bash
   cd back-end
   ```
2. Install pipenv if needed:
   ```bash
   pip install pipenv
   ```
3. Install Python dependencies:
   ```bash
   pipenv install
   ```
4. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```
5. Start the Flask server:
   ```bash
   pipenv run python app.py
   ```

The backend runs at:
```bash
http://127.0.0.1:5001
```

## Frontend setup

1. Go to the frontend folder:
   ```bash
   cd ../front-end
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend runs at:
```bash
http://127.0.0.1:5173
```

## API overview

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Shelves
- `GET /shelves`
- `POST /shelves`
- `GET /shelves/<id>`
- `PUT /shelves/<id>`
- `DELETE /shelves/<id>`

### Books
- `GET /books`
- `POST /books`
- `GET /books/<id>`
- `PUT /books/<id>`
- `DELETE /books/<id>`

## Notes

- The frontend expects the backend to be running on port 5001.
- If you want to use a different API URL, set the Vite environment variable:
  ```bash
  VITE_API_BASE_URL=http://127.0.0.1:5001
  ```
