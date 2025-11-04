# Frontend - Student Assignment System

React + Vite + TailwindCSS frontend for the student assignment web application.

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install
```

### 2. Run Development Server

```powershell
# Start the development server
npm run dev
```

The application will be available at http://localhost:3000

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx         # Main layout with navigation
│   ├── pages/
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── LoginPage.jsx      # Login/authentication
│   │   ├── StudentDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── ProjectsPage.jsx   # Browse projects
│   │   ├── PreferencesPage.jsx # Student preferences
│   │   └── AssignmentsPage.jsx # View assignments
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles with Tailwind
├── index.html
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json
```

## 🎨 Features

### For Students:
- View available projects
- Submit ranked preferences for projects
- View assignment status
- Dashboard with personal information

### For Teachers/Admins:
- Create and manage projects
- View all students and their preferences
- Run assignment algorithm
- View assignment results and statistics
- Export results

## 🛠️ Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client (for API calls)

## 📝 Available Scripts

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔌 API Integration

The frontend is configured to proxy API requests to the backend at `http://localhost:8000`.

All API calls should use the `/api` prefix, which will be automatically forwarded to the backend.

Example:
```javascript
import axios from 'axios'

// This will call http://localhost:8000/api/students
const response = await axios.get('/api/students')
```

## 🎨 Styling

The project uses TailwindCSS with custom utility classes defined in `src/index.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container
- `.input-field` - Form input style

Colors are customizable in `tailwind.config.js`.

## 📝 Notes

- The application currently uses simulated data. You'll need to implement actual API calls to the backend.
- Authentication is basic - you'll need to implement JWT token storage and management.
- All TODO comments in the code indicate areas that need backend integration.

## 🚧 Next Steps

1. Implement API service layer (create `src/services/api.js`)
2. Add authentication context for managing user state
3. Connect all pages to real backend endpoints
4. Add loading states and error handling
5. Implement form validation
6. Add more interactive features
