import React, { useContext, useState, useEffect, useMemo } from 'react';
import ProviderContext from '../contexts/ProviderContext';
import OrderContext from '../contexts/OrderContext';
import ProductContext from '../contexts/ProductContext';
import { AuthContext } from '../App';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaCheck,
  FaTimes,
  FaRedo,
  FaSort,
  FaSortUp, 
  FaSortDown,
  FaHistory,
  FaBox,
  FaDollarSign,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { Modal, Button, Form, Table, Alert, Badge, Dropdown, Card, ListGroup } from 'react-bootstrap';

const ProviderManagementPage = () => {
  const { providers, addProvider, updateProvider, deleteProvider } = useContext(ProviderContext);
  const { orders } = useContext(OrderContext);
  const { products } = useContext(ProductContext);
  const { userRole } = useContext(AuthContext);
  const isAdministrator = userRole === 'Administrador';
  
  // Estados para la UI
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterBrand, setFilterBrand] = useState('Todos');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    brand: '',
  });
  
  // Estados para validaciones
  const [errors, setErrors] = useState({});

  // Obtener marcas únicas para el filtro
  const uniqueBrands = [...new Set(providers.map(p => p.brand))].filter(Boolean);

  // Filtrar proveedores según búsqueda y filtros
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          provider.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Activo' && provider.isActive) || 
                         (filterStatus === 'Inactivo' && !provider.isActive);
    
    const matchesBrand = filterBrand === 'Todos' || provider.brand === filterBrand;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Ordenar proveedores
  const sortedProviders = React.useMemo(() => {
    if (!sortConfig.key) return filteredProviders;
    
    return [...filteredProviders].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProviders, sortConfig]);

  // Calcular métricas para un proveedor específico
  const getProviderMetrics = (providerId) => {
    const providerOrders = orders.filter(order => order.providerId === providerId);
    
    // Total de pedidos
    const totalOrders = providerOrders.length;
    
    // Total gastado
    let totalSpent = 0;
    providerOrders.forEach(order => {
      order.products.forEach(item => {
        totalSpent += item.quantity * item.price; // Asumimos que se agrega precio al item
      });
    });
    
    // Último pedido
    const lastOrder = providerOrders.length > 0 ? 
      providerOrders.reduce((latest, order) => 
        new Date(order.receptionDate) > new Date(latest.receptionDate) ? order : latest
      ) : null;
    
    // Producto más comprado
    const productQuantities = {};
    providerOrders.forEach(order => {
      order.products.forEach(item => {
        productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
      });
    });
    
    let mostBoughtProduct = null;
    let maxQuantity = 0;
    for (const [productId, quantity] of Object.entries(productQuantities)) {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        mostBoughtProduct = products.find(p => p.id === productId) || null;
      }
    }
    
    return {
      totalOrders,
      totalSpent,
      lastOrder,
      mostBoughtProduct,
      lastOrderDate: lastOrder ? lastOrder.receptionDate : null
    };
  };

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
    setErrors({});
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedProvider(null);
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
      setFormData({
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
        brand: '',
      });
    }
    setShowModal(true);
  };

  const handleShowHistory = (provider) => {
    setSelectedProvider(provider);
    setShowHistoryModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'El nombre de la empresa es obligatorio';
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nombre del contacto es obligatorio';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingrese un teléfono válido (solo números, 7-15 dígitos)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'La marca es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingProvider) {
        updateProvider(editingProvider.id, formData);
        showAlertMessage('Proveedor actualizado correctamente', 'success');
      } else {
        addProvider(formData);
        showAlertMessage('Proveedor registrado correctamente', 'success');
      }
      handleClose();
    } catch (error) {
      showAlertMessage('Error al guardar el proveedor', 'danger');
    }
  };

  const handleDeleteProvider = (providerId, providerName) => {
    if (window.confirm(`¿Está seguro que desea desactivar al proveedor "${providerName}"?`)) {
      try {
        deleteProvider(providerId);
        showAlertMessage('Proveedor desactivado correctamente', 'success');
      } catch (error) {
        showAlertMessage('Error al desactivar el proveedor', 'danger');
      }
    }
  };

  const handleReactivateProvider = (providerId, providerName) => {
    if (window.confirm(`¿Está seguro que desea reactivar al proveedor "${providerName}"?`)) {
      try {
        updateProvider(providerId, { isActive: true });
        showAlertMessage('Proveedor reactivado correctamente', 'success');
      } catch (error) {
        showAlertMessage('Error al reactivar el proveedor', 'danger');
      }
    }
  };

  const showAlertMessage = (message, type) => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => {
      setShowAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
    }
    return <FaSort className="ms-1" />;
  };

  // Obtener pedidos del proveedor seleccionado
  const providerOrders = useMemo(() => {
    if (!selectedProvider) return [];
    return orders.filter(order => order.providerId === selectedProvider.id);
  }, [selectedProvider, orders]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Proveedores</h1>
      
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
                placeholder="Buscar por empresa, contacto o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-brand">
                <FaFilter className="me-1" /> Marca: {filterBrand}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterBrand('Todos')}>Todas</Dropdown.Item>
                {uniqueBrands.map(brand => (
                  <Dropdown.Item key={brand} onClick={() => setFilterBrand(brand)}>
                    {brand}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          <Button variant="primary" onClick={() => handleShow()}>
            <FaPlus className="me-2" /> Registrar Nuevo Proveedor
          </Button>
        </div>
      )}

      <div className="table-responsive">
        <Table striped bordered hover className="align-middle">
          <thead>
            <tr>
              <th onClick={() => requestSort('companyName')} style={{ cursor: 'pointer' }}>
                Empresa {getSortIcon('companyName')}
              </th>
              <th onClick={() => requestSort('contactName')} style={{ cursor: 'pointer' }}>
                Contacto {getSortIcon('contactName')}
              </th>
              <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer' }}>
                Teléfono {getSortIcon('phone')}
              </th>
              <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => requestSort('brand')} style={{ cursor: 'pointer' }}>
                Marca {getSortIcon('brand')}
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProviders.length > 0 ? (
              sortedProviders.map((provider) => {
                const metrics = getProviderMetrics(provider.id);
                return (
                  <tr key={provider.id}>
                    <td>
                      <div>{provider.companyName}</div>
                      <small className="text-muted">
                        {metrics.totalOrders} pedidos | ${metrics.totalSpent.toFixed(2)}
                      </small>
                    </td>
                    <td>{provider.contactName}</td>
                    <td>{provider.phone}</td>
                    <td>{provider.email}</td>
                    <td>{provider.brand}</td>
                    <td>
                      {provider.isActive ? (
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
                            variant="info" 
                            size="sm" 
                            onClick={() => handleShowHistory(provider)}
                            title="Ver historial de pedidos"
                            className="me-1"
                          >
                            <FaHistory />
                          </Button>
                          
                          <Button 
                            variant="warning" 
                            size="sm" 
                            onClick={() => handleShow(provider)}
                            title="Editar proveedor"
                            className="me-1"
                          >
                            <FaEdit />
                          </Button>
                          
                          {provider.isActive ? (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteProvider(provider.id, provider.companyName)}
                              title="Desactivar proveedor"
                            >
                              <FaTrash />
                            </Button>
                          ) : (
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleReactivateProvider(provider.id, provider.companyName)}
                              title="Reactivar proveedor"
                            >
                              <FaRedo />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No se encontraron proveedores que coincidan con los criterios de búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal para crear/editar proveedor */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProvider ? 'Editar Proveedor' : 'Registrar Proveedor'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Empresa *</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                isInvalid={!!errors.companyName}
                placeholder="Ingrese el nombre de la empresa"
              />
              <Form.Control.Feedback type="invalid">
                {errors.companyName}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Contacto *</Form.Label>
              <Form.Control
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                isInvalid={!!errors.contactName}
                placeholder="Ingrese el nombre del contacto principal"
              />
              <Form.Control.Feedback type="invalid">
                {errors.contactName}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
                placeholder="Ingrese el número de teléfono"
              />
              <Form.Text className="text-muted">
                Solo números, entre 7 y 15 dígitos
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
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
              <Form.Label>Marca Asociada *</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                isInvalid={!!errors.brand}
                placeholder="Ingrese la marca asociada"
              />
              <Form.Control.Feedback type="invalid">
                {errors.brand}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingProvider ? 'Guardar Cambios' : 'Registrar Proveedor'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para historial de pedidos */}
      <Modal show={showHistoryModal} onHide={handleCloseHistoryModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaHistory className="me-2" />
            Historial de Pedidos - {selectedProvider?.companyName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProvider && (
            <div>
              {/* Métricas del proveedor */}
              <Card className="mb-4">
                <Card.Header>
                  <FaDollarSign className="me-2" />Resumen de Compras
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-around">
                    <div className="text-center">
                      <h4>{getProviderMetrics(selectedProvider.id).totalOrders}</h4>
                      <small className="text-muted">Total Pedidos</small>
                    </div>
                    <div className="text-center">
                      <h4>${getProviderMetrics(selectedProvider.id).totalSpent.toFixed(2)}</h4>
                      <small className="text-muted">Total Gastado</small>
                    </div>
                    <div className="text-center">
                      <h4>{getProviderMetrics(selectedProvider.id).lastOrderDate || 'N/A'}</h4>
                      <small className="text-muted">Último Pedido</small>
                    </div>
                    <div className="text-center">
                      <h4>{getProviderMetrics(selectedProvider.id).mostBoughtProduct?.name || 'N/A'}</h4>
                      <small className="text-muted">Producto Más Comprado</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Lista de pedidos */}
              <h5>
                <FaBox className="me-2" />Pedidos Realizados ({providerOrders.length})
              </h5>
              {providerOrders.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Número de Guía</th>
                      <th>Productos</th>
                      <th>Cantidad Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerOrders.map(order => {
                      // Calcular cantidad total de productos en el pedido
                      const totalQuantity = order.products.reduce((sum, item) => sum + item.quantity, 0);
                      
                      return (
                        <tr key={order.id}>
                          <td>{order.receptionDate}</td>
                          <td>{order.guideNumber || 'N/A'}</td>
                          <td>
                            <ul className="mb-0">
                              {order.products.map((item, index) => (
                                <li key={index} className="small">
                                  {item.name} (x{item.quantity})
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>{totalQuantity}</td>
                          <td>
                            <Badge bg="success">{order.status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  <FaInfoCircle className="me-2" />
                  No se han realizado pedidos a este proveedor.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHistoryModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProviderManagementPage;
