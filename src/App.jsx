import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UserManagementPage from './pages/UserManagementPage';
import ProviderManagementPage from './pages/ProviderManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import OrderRegistrationPage from './pages/OrderRegistrationPage';
import SalesSystemPage from './pages/SalesSystemPage';
import HistoryPage from './pages/HistoryPage'; // New import
import MainLayout from './layouts/MainLayout'; // New import

// A simple mock authentication context
const AuthContext = React.createContext(null);

const PrivateRoute = ({ children, requiredRole }) => { // Added requiredRole prop
  const { isLoggedIn, userRole } = React.useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If a requiredRole is specified, check if the user's role matches
  if (requiredRole && userRole !== requiredRole) {
    // For simplicity, redirect to dashboard if unauthorized
    // In a real app, you might show an "Access Denied" page
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  // Mock authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null); // New state for user name

  // Mock login function
  const login = (role, name) => { // Accept role and name as arguments
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name); // Set user name
  };
  // Mock logout function
  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null); // Reset user name on logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, login, logout }}> {/* Include userName */} 
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* MainLayout is always protected, but specific child routes have role checks */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Admin-only routes */}
          <Route path="/users" element={<PrivateRoute requiredRole="Administrador"><UserManagementPage /></PrivateRoute>} />
          <Route path="/providers" element={<PrivateRoute requiredRole="Administrador"><ProviderManagementPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute requiredRole="Administrador"><OrderRegistrationPage /></PrivateRoute>} />
          {/* Employee/Admin routes */}
          <Route path="/products" element={<ProductManagementPage />} />
          <Route path="/sales" element={<SalesSystemPage />} />
          <Route path="/history" element={<HistoryPage />} />
          {/* Future protected routes will go here as well */}
        </Route>
        {/* Redirect from root to login or dashboard */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
export { AuthContext };
