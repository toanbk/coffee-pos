# Coffee POS System

A simple Point of Sale system for coffee shops built with Python FastAPI backend and React TypeScript frontend.

## Tech Stack

### Backend
- Python FastAPI
- SQLAlchemy ORM
- MySQL Database
- JWT Authentication

### Frontend
- React with TypeScript
- Vite
- Material-UI
- React Router
- Axios

## Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL Server
- npm or yarn

## Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd coffee-pos
```

### 2. Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost/coffee_pos
SECRET_KEY=your_secret_key_here
```

4. Create the database:
```sql
CREATE DATABASE coffee_pos;
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Production Setup

### 1. Backend Production

1. Build the backend:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up a production database:
```sql
CREATE DATABASE coffee_pos_prod;
```

3. Update the `.env` file with production settings:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost/coffee_pos_prod
SECRET_KEY=your_production_secret_key_here
```

4. Run with Gunicorn (recommended for production):
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### 2. Frontend Production

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. The built files will be in the `dist` directory. You can serve them using any static file server like Nginx or Apache.

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Features

- User authentication (login/register)
- Category management
- Product management
- Order processing
- Real-time cart updates
- Order history

## Development Workflow

1. Backend development:
   - The backend will automatically reload when you make changes to the code
   - API documentation is automatically generated from your code
   - Use the `/docs` endpoint to test API endpoints

2. Frontend development:
   - Hot module replacement is enabled
   - TypeScript type checking
   - Material-UI components for consistent styling

## Troubleshooting

1. Database connection issues:
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure the database exists

2. Frontend build issues:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run type-check`

3. Backend issues:
   - Check logs for detailed error messages
   - Verify all environment variables are set
   - Ensure all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 