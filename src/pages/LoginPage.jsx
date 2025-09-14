import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import UserContext from '../contexts/UserContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useContext(AuthContext);
  const { users } = useContext(UserContext);
  const navigate = useNavigate();

  // Validar formato de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validar contraseña
  const validatePassword = (password) => {
    return password.length >= 4; // Mínimo 4 caracteres
  };

  // Manejar cambios en el email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validar email en tiempo real
    if (value && !validateEmail(value)) {
      setEmailError('Por favor, ingresa un correo electrónico válido.');
    } else {
      setEmailError('');
    }
  };

  // Manejar cambios en la contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Validar contraseña en tiempo real
    if (value && !validatePassword(value)) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Validaciones finales
    let hasError = false;
    
    if (!email) {
      setEmailError('El correo electrónico es obligatorio.');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Por favor, ingresa un correo electrónico válido.');
      hasError = true;
    }
    
    if (!password) {
      setPasswordError('La contraseña es obligatoria.');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres.');
      hasError = true;
    }
    
    if (hasError) return;

    // Simular carga
    setIsLoading(true);
    
    // Simular delay de red
    setTimeout(() => {
      // Buscar usuario por email y contraseña
      const foundUser = users.find(
        (user) => user.email === email && user.password === password && user.isActive
      );

      if (foundUser) {
        login(foundUser.role, foundUser.fullName);
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        setIsLoading(false);
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      }
    }, 800);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 className="h3 mb-3 font-weight-normal">Sistema de Inventario</h1>
          <p className="text-muted">Inicia sesión para acceder al sistema</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              id="emailInput"
              value={email}
              onChange={handleEmailChange}
              placeholder="nombre@ejemplo.com"
              aria-describedby="emailHelp"
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-control ${passwordError || error ? 'is-invalid' : ''}`}
              id="passwordInput"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>
          
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <small className="text-muted">
            ¿Necesitas ayuda? Contacta al administrador del sistema
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
