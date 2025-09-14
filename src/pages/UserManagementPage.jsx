import React, { useContext, useState, useEffect } from 'react';
import UserContext from '../contexts/UserContext';
import { AuthContext } from '../App';
import { 
  FaEdit, 
  FaToggleOn, 
  FaToggleOff, 
  FaPlus, 
  FaSearch, 
  FaKey,
  FaTrash,
  FaFilter,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { Modal, Button, Form, Table, Alert, Badge, Dropdown } from 'react-bootstrap';

const UserManagementPage = () => {
  const { users, addUser, updateUser, deactivateUser, activateUser } = useContext(UserContext);
  const { userRole } = useContext(AuthContext);
  const isAdministrator = userRole === 'Administrador';
  
  // Estados para la UI
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: '' });
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Empleado',
    password: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  // Estados para validaciones
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Filtrar usuarios según búsqueda y filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'Todos' || user.role === filterRole;
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Activo' && user.isActive) || 
                         (filterStatus === 'Inactivo' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleClose = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      role: 'Empleado',
      password: '',
    });
    setErrors({});
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
  };

  const handleShow = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        role: 'Empleado',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleShowPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se empieza a escribir
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario de usuario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    
    if (!editingUser && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!editingUser && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar formulario de contraseña
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingUser) {
        updateUser(editingUser.id, formData);
        showAlertMessage('Usuario actualizado correctamente', 'success');
      } else {
        addUser(formData);
        showAlertMessage('Usuario creado correctamente', 'success');
      }
      handleClose();
    } catch (error) {
      showAlertMessage('Error al guardar el usuario', 'danger');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      // En una implementación real, aquí se llamaría a una API para cambiar la contraseña
      // updateUser(selectedUser.id, { password: passwordData.newPassword });
      showAlertMessage('Contraseña actualizada correctamente', 'success');
      handleClosePasswordModal();
    } catch (error) {
      showAlertMessage('Error al actualizar la contraseña', 'danger');
    }
  };

  const handleToggleUser = (userId, isActive) => {
    if (isActive) {
      if (window.confirm('¿Está seguro que desea desactivar este usuario?')) {
        deactivateUser(userId);
        showAlertMessage('Usuario desactivado correctamente', 'success');
      }
    } else {
      activateUser(userId);
      showAlertMessage('Usuario activado correctamente', 'success');
    }
  };

  const showAlertMessage = (message, type) => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => {
      setShowAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Usuarios</h1>
      
      {showAlert.show && (
        <Alert variant={showAlert.type} onClose={() => setShowAlert({ show: false, message: '', type: '' })} dismissible>
          {showAlert.message}
        </Alert>
      )}
      
      {isAdministrator && (
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex gap-2">
            <div className="input-group" style={{ width: '300px' }}>
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-role">
                <FaFilter className="me-1" /> Rol: {filterRole}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterRole('Todos')}>Todos</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('Administrador')}>Administrador</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('Empleado')}>Empleado</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-status">
                <FaFilter className="me-1" /> Estado: {filterStatus}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterStatus('Todos')}>Todos</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterStatus('Activo')}>Activo</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterStatus('Inactivo')}>Inactivo</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          <Button variant="primary" onClick={() => handleShow()}>
            <FaPlus className="me-2" /> Crear Nuevo Usuario
          </Button>
        </div>
      )}

      <div className="table-responsive">
        <Table striped bordered hover className="align-middle">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'Administrador' ? 'danger' : 'primary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    {user.isActive ? (
                      <Badge bg="success">
                        <FaCheck className="me-1" /> Activo
                      </Badge>
                    ) : (
                      <Badge bg="secondary">
                        <FaTimes className="me-1" /> Inactivo
                      </Badge>
                    )}
                  </td>
                  <td>
                    {isAdministrator && (
                      <div className="d-flex gap-1">
                        <Button 
                          variant="warning" 
                          size="sm" 
                          onClick={() => handleShow(user)}
                          title="Editar usuario"
                        >
                          <FaEdit />
                        </Button>
                        
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleShowPasswordModal(user)}
                          title="Cambiar contraseña"
                        >
                          <FaKey />
                        </Button>
                        
                        <Button 
                          variant={user.isActive ? "danger" : "success"} 
                          size="sm" 
                          onClick={() => handleToggleUser(user.id, user.isActive)}
                          title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No se encontraron usuarios que coincidan con los criterios de búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo *</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                isInvalid={!!errors.fullName}
                placeholder="Ingrese el nombre completo"
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="ejemplo@correo.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </Form.Select>
            </Form.Group>
            
            {!editingUser && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Ingrese una contraseña segura"
                />
                <Form.Text className="text-muted">
                  La contraseña debe tener al menos 6 caracteres
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="mb-3">
              <strong>Usuario:</strong> {selectedUser.fullName}
            </div>
          )}
          
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña *</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                isInvalid={!!passwordErrors.newPassword}
                placeholder="Ingrese la nueva contraseña"
              />
              <Form.Text className="text-muted">
                La contraseña debe tener al menos 6 caracteres
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {passwordErrors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña *</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                isInvalid={!!passwordErrors.confirmPassword}
                placeholder="Confirme la nueva contraseña"
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClosePasswordModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Cambiar Contraseña
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
