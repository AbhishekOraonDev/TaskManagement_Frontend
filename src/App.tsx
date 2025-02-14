// import './App.css';
import NavbarComponent from './component/Navbar';
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from './page/DashboardPage';
import Login from './page/LoginPage';
import Signup from './page/SignupPage';
import ProtectedRoute from './component/ProtectedRoute';
import ProfilePage from './page/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Separate component to handle conditional rendering
function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Ensure Auth Context is used inside Router

  // Hide Navbar on login and signup pages
  const hideNavbarRoutes = ["/Login", "/Signup", "/login", "/signup"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className='min-h-screen'>
      {shouldShowNavbar && <NavbarComponent />} {/* Navbar hidden on login/signup pages */}
      <Routes>
        {/* Redirect logged-in users away from login/signup */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

        {/* Protect Dashboard Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
