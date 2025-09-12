import React, { useContext, useState } from 'react';
import ProviderContext from '../contexts/ProviderContext';
import { AuthContext } from '../App'; // New import
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const ProviderManagementPage = () => {
  const { providers, addProvider, updateProvider, deleteProvider } = useContext(ProviderContext);
  const { userRole } = useContext(AuthContext); // Get userRole
  const isAdministrator = userRole === 'Administrador';
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    brand: '',
  });

  const handleClose = () => {
    setShowModal(false);
    setEditingProvider(null);
    setFormData({
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      brand: '',
    });
  };

  const handleShow = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        companyName: provider.companyName,
        contactName: provider.contactName,
        phone: provider.phone,
        email: provider.email,
        brand: provider.brand,
      });
    } else {
      setEditingProvider(null);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProvider) {
      updateProvider(editingProvider.id, formData);
    } else {
      addProvider(formData);
    }
    handleClose();
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Proveedores</h1>
      {isAdministrator && ( // Conditionally render add button
        <Button variant="primary" onClick={() => handleShow()} className="mb-3">
          <FaPlus className="me-2" /> Registrar Nuevo Proveedor
        </Button>
      )}

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Marca</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id}>
              <td>{provider.companyName}</td>
              <td>{provider.contactName}</td>
              <td>{provider.phone}</td>
              <td>{provider.email}</td>
              <td>{provider.brand}</td>
              <td>
                {provider.isActive ? (
                  <span className="badge bg-success">Activo</span>
                ) : (
                  <span className="badge bg-danger">Inactivo</span>
                )}
              </td>
              <td>
                {isAdministrator && ( // Conditionally render edit/delete buttons
                  <>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(provider)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteProvider(provider.id)}>
                      <FaTrash /> Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProvider ? 'Editar Proveedor' : 'Registrar Proveedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Contacto</Form.Label>
              <Form.Control
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
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
              <Form.Label>Marca Asociada</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!isAdministrator}>
              {editingProvider ? 'Guardar Cambios' : 'Registrar Proveedor'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProviderManagementPage;
