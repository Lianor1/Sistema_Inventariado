import React, { useContext, useState, useMemo } from 'react';
import ProductContext from '../contexts/ProductContext';
import ProviderContext from '../contexts/ProviderContext'; // To get provider names
import { AuthContext } from '../App'; // New import
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductManagementPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
  const { providers } = useContext(ProviderContext);
  const { userRole } = useContext(AuthContext); // Get userRole
  const isAdministrator = userRole === 'Administrador';
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterStock, setFilterStock] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    providerId: '',
    minStock: '',
  });

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      code: '',
      brand: '',
      category: '',
      price: '',
      stock: '',
      providerId: '',
      minStock: '',
    });
  };

  const handleShow = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        brand: product.brand,
        category: product.category,
        price: product.price,
        stock: product.stock,
        providerId: product.providerId,
        minStock: product.minStock,
      });
    } else {
      setEditingProduct(null);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock), minStock: parseInt(formData.minStock) };
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    handleClose();
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.companyName : 'Desconocido';
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || product.category === filterCategory;
      const matchesProvider = filterProvider === '' || product.providerId === filterProvider;
      const matchesStock = filterStock === '' ||
                           (filterStock === 'low' && product.stock < product.minStock) ||
                           (filterStock === 'medium' && product.stock >= product.minStock && product.stock < product.minStock * 2) ||
                           (filterStock === 'high' && product.stock >= product.minStock * 2);

      return product.isActive && matchesSearch && matchesCategory && matchesProvider && matchesStock;
    });
  }, [products, searchTerm, filterCategory, filterProvider, filterStock]);

  const uniqueCategories = useMemo(() => {
    const categories = products.map(p => p.category);
    return [...new Set(categories)];
  }, [products]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Productos e Inventario</h1>
      {isAdministrator && ( // Conditionally render add button
        <Button variant="primary" onClick={() => handleShow()} className="mb-3">
          <FaPlus className="me-2" /> Agregar Producto Manualmente
        </Button>
      )}

      <div className="row mb-3">
        <div className="col-md-4">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Todas las Categorías</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
            <option value="">Todos los Proveedores</option>
            {providers.map(prov => <option key={prov.id} value={prov.id}>{prov.companyName}</option>)}
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
            <option value="">Nivel de Stock</option>
            <option value="low">Bajo Stock (⚠️)</option>
            <option value="medium">Stock Medio</option>
            <option value="high">Stock Alto</option>
          </Form.Select>
        </div>
      </div>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Proveedor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} className={product.stock < product.minStock ? 'table-warning' : ''}>
              <td>{product.name}</td>
              <td>{product.code}</td>
              <td>{product.brand}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                {product.stock}
                {product.stock < product.minStock && (
                  <FaExclamationTriangle className="text-danger ms-2" title="Stock Bajo" />
                )}
              </td>
              <td>{getProviderName(product.providerId)}</td>
              <td>
                {isAdministrator && ( // Conditionally render edit/delete buttons
                  <>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(product)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteProduct(product.id)}>
                      <FaTrash />
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
          <Modal.Title>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Código Único</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Marca</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio de Venta</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock Actual</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Proveedor Asociado</Form.Label>
              <Form.Select
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              >
                <option value="">Seleccione un proveedor</option>
                {providers.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.companyName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock Mínimo (Alerta)</Form.Label>
              <Form.Control
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                required
                disabled={!isAdministrator} // Added disabled prop
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!isAdministrator}> // Disable submit button
              {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;
