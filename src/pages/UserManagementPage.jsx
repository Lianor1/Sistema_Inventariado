import React, { useContext, useState } from 'react';
import UserContext from '../contexts/UserContext';
import { AuthContext } from '../App'; // New import
import { FaEdit, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const UserManagementPage = () => {
  const { users, addUser, updateUser, deactivateUser, activateUser } = useContext(UserContext);
  const { userRole } = useContext(AuthContext); // Get userRole
  const isAdministrator = userRole === 'Administrador';
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Empleado',
    password: '',
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
  };

  const handleShow = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '', // Password is not editable from here for security reasons
      });
    } else {
      setEditingUser(null);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    handleClose();
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Usuarios</h1>
      {isAdministrator && ( // Conditionally render add button
        <Button variant="primary" onClick={() => handleShow()} className="mb-3">
          <FaPlus className="me-2" /> Crear Nuevo Usuario
        </Button>
      )}

      <table className="table table-striped table-hover">
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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.isActive ? (
                  <span className="badge bg-success">Activo</span>
                ) : (
                  <span className="badge bg-danger">Inactivo</span>
                )}
              </td>
              <td>
                {isAdministrator && ( // Conditionally render edit/toggle buttons
                  <>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(user)}>
                      <FaEdit />
                    </Button>
                    {user.isActive ? (
                      <Button variant="danger" size="sm" onClick={() => deactivateUser(user.id)}>
                        <FaToggleOn /> Desactivar
                      </Button>
                    ) : (
                      <Button variant="success" size="sm" onClick={() => activateUser(user.id)}>
                        <FaToggleOff /> Activar
                      </Button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isAdministrator} // Added disabled prop
              >
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </Form.Select>
            </Form.Group>
            {!editingUser && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={!isAdministrator} // Added disabled prop
                />
              </Form.Group>
            )}
            <Button variant="primary" type="submit" disabled={!isAdministrator}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
