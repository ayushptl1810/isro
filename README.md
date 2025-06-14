# ISRO GUI - Full Stack Application

This is a full-stack application with a Flask backend API and React frontend.

## Project Structure

```
.
├── backend/             # Flask backend
│   ├── app.py          # Main Flask application
│   └── routes/         # API routes
├── frontend/           # React frontend
│   ├── public/         # Static files
│   └── src/           # React source code
└── requirements.txt    # Python dependencies
```

## Backend Setup

1. Create a Python virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend:
   ```bash
   cd backend
   python app.py
   ```

The backend will run on http://localhost:5000

## Frontend Setup

1. Install Node.js dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Run the frontend:
   ```bash
   npm start
   ```

The frontend will run on http://localhost:3000

## Development

- Backend API endpoints are prefixed with `/api`
- Frontend development server has hot-reloading enabled
- CORS is configured to allow frontend-backend communication
- Environment variables are used for configuration

## Available Scripts

### Backend

- `python app.py` - Run the Flask development server

### Frontend

- `npm start` - Run the React development server
