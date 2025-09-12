import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { FaHome, FaUsers, FaSignOutAlt, FaBoxOpen, FaTruck, FaShoppingCart, FaChartBar, FaHistory, FaRobot } from 'react-icons/fa';
import AIAssistantButton from '../components/AIAssistantButton'; // New import

const MainLayout = () => {
  const { logout, userRole, userName } = useContext(AuthContext); // Get userRole and userName
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define which links are visible for each role
  const isAdministrator = userRole === 'Administrador';
  const isEmployee = userRole === 'Empleado'; // Or any logged-in user

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3"
        style={{ width: '250px', flexShrink: 0 }}
      >
        <h3 className="text-center mb-4">Sistema de Gestión</h3>
        {userName && ( // Conditionally display welcome message
          <p className="text-center mb-4" style={{ color: '#FFFFFF' }}>
            Bienvenido, {isAdministrator ? `${userName} (${userRole})` : userRole}
          </p>
        )}
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/dashboard" className="nav-link text-white">
              <FaHome className="me-2" /> Dashboard
            </Link>
          </li>
          {isAdministrator && ( // Only for Administrator
            <>
              <li className="nav-item mb-2">
                <Link to="/users" className="nav-link text-white">
                  <FaUsers className="me-2" /> Gestión de Usuarios
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/providers" className="nav-link text-white">
                  <FaTruck className="me-2" /> Gestión de Proveedores
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/orders" className="nav-link text-white">
                  <FaShoppingCart className="me-2" /> Registro de Pedidos
                </Link>
              </li>
            </>
          )}
          {(isAdministrator || isEmployee) && ( // For both Administrator and Employee
            <>
              <li className="nav-item mb-2">
                <Link to="/products" className="nav-link text-white">
                  <FaBoxOpen className="me-2" /> Gestión de Productos
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/sales" className="nav-link text-white">
                  <FaChartBar className="me-2" /> Sistema de Ventas
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/history" className="nav-link text-white">
                  <FaHistory className="me-2" /> Historial y Consultas
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/ai-assistant" className="nav-link text-white">
                  <FaRobot className="me-2" /> Asistente IA
                </Link>
              </li>
            </>
          )}
          <li className="nav-item mt-auto">
            <button onClick={handleLogout} className="btn btn-outline-light w-100">
              <FaSignOutAlt className="me-2" /> Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light">
        <Outlet /> {/* This is where child routes will be rendered */}
        <AIAssistantButton /> {/* New component */}
      </div>
    </div>
  );
};

export default MainLayout;
