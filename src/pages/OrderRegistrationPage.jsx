import React, { useContext, useState, useMemo } from 'react';
import OrderContext from '../contexts/OrderContext';
import ProductContext from '../contexts/ProductContext';
import ProviderContext from '../contexts/ProviderContext';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Form, Button, Table, Alert } from 'react-bootstrap';

const OrderRegistrationPage = () => {
  const { addOrder } = useContext(OrderContext);
  const { products, addProduct } = useContext(ProductContext);
  const { providers } = useContext(ProviderContext);

  const [selectedProvider, setSelectedProvider] = useState('');
  const [guideNumber, setGuideNumber] = useState('');
  const [orderProducts, setOrderProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempProductName, setTempProductName] = useState('');
  const [tempProductCode, setTempProductCode] = useState('');
  const [tempProductPrice, setTempProductPrice] = useState('');
  const [tempProductCategory, setTempProductCategory] = useState('');
  const [tempProductMinStock, setTempProductMinStock] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const availableProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const handleAddProductToOrder = (product) => {
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    const existingProductIndex = orderProducts.findIndex(item => item.productId === product.id);
    if (existingProductIndex > -1) {
      const updatedProducts = [...orderProducts];
      updatedProducts[existingProductIndex].quantity += quantity;
      setOrderProducts(updatedProducts);
    } else {
      setOrderProducts(prev => [...prev, { productId: product.id, name: product.name, quantity }]);
    }
    setSearchTerm('');
    setQuantity(1);
    setError('');
  };

  const handleCreateAndAddTempProduct = () => {
    if (!tempProductName || !tempProductCode || !tempProductPrice || !tempProductCategory || !tempProductMinStock || quantity <= 0) {
      setError('Por favor, complete todos los campos del producto temporal y la cantidad.');
      return;
    }

    const newTempProduct = {
      name: tempProductName,
      code: tempProductCode,
      brand: selectedProvider ? providers.find(p => p.id === selectedProvider)?.brand || '' : '', // Use provider's brand if selected
      category: tempProductCategory,
      price: parseFloat(tempProductPrice),
      stock: 0, // Initial stock is 0, will be updated by order
      providerId: selectedProvider,
      minStock: parseInt(tempProductMinStock),
    };

    addProduct(newTempProduct); // Add to global product list

    // Add to current order
    setOrderProducts(prev => [...prev, { productId: String(products.length + 1), name: newTempProduct.name, quantity }]);

    // Clear temp product fields
    setTempProductName('');
    setTempProductCode('');
    setTempProductPrice('');
    setTempProductCategory('');
    setTempProductMinStock('');
    setQuantity(1);
    setError('');
  };

  const handleRemoveProduct = (index) => {
    setOrderProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveOrder = () => {
    if (!selectedProvider) {
      setError('Debe seleccionar un proveedor.');
      return;
    }
    if (orderProducts.length === 0) {
      setError('Debe agregar al menos un producto al pedido.');
      return;
    }

    const newOrder = {
      providerId: selectedProvider,
      receptionDate: new Date().toISOString().split('T')[0], // Today's date
      guideNumber: guideNumber,
      products: orderProducts,
    };

    addOrder(newOrder);
    // Clear form
    setSelectedProvider('');
    setGuideNumber('');
    setOrderProducts([]);
    setError('');
    alert('Pedido registrado con éxito y stock actualizado!');
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Registro de Pedidos (Entrada de Cajas)</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Seleccionar Proveedor</Form.Label>
        <Form.Select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} required>
          <option value="">-- Seleccione un proveedor --</option>
          {providers.map(prov => (
            <option key={prov.id} value={prov.id}>
              {prov.companyName} ({prov.brand})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Número de Guía (Opcional)</Form.Label>
        <Form.Control type="text" value={guideNumber} onChange={(e) => setGuideNumber(e.target.value)} />
      </Form.Group>

      <hr />
      <h4>Agregar Productos al Pedido</h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Buscar Producto Existente</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre o Código de Producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          {searchTerm && availableProducts.length > 0 && (
            <ul className="list-group mt-2">
              {availableProducts.map(product => (
                <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {product.name} ({product.code})
                  <Button variant="success" size="sm" onClick={() => handleAddProductToOrder(product)}>
                    <FaPlus />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Cantidad</Form.Label>
            <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1" />
          </Form.Group>
        </div>
      </div>

      <hr />
      <h4>Crear Producto Temporalmente (si no existe)</h4>
      <div className="row mb-3">
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" value={tempProductName} onChange={(e) => setTempProductName(e.target.value)} />
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Código</Form.Label>
            <Form.Control type="text" value={tempProductCode} onChange={(e) => setTempProductCode(e.target.value)} />
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Precio</Form.Label>
            <Form.Control type="number" step="0.01" value={tempProductPrice} onChange={(e) => setTempProductPrice(e.target.value)} />
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Categoría</Form.Label>
            <Form.Control type="text" value={tempProductCategory} onChange={(e) => setTempProductCategory(e.target.value)} />
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Stock Mínimo</Form.Label>
            <Form.Control type="number" value={tempProductMinStock} onChange={(e) => setTempProductMinStock(e.target.value)} />
          </Form.Group>
        </div>
        <div className="col-md-1 d-flex align-items-end">
          <Button variant="info" onClick={handleCreateAndAddTempProduct} className="w-100">
            <FaPlus />
          </Button>
        </div>
      </div>

      <hr />
      <h4>Resumen del Pedido</h4>
      {orderProducts.length === 0 ? (
        <Alert variant="info">No hay productos en el pedido.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orderProducts.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleRemoveProduct(index)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button variant="success" onClick={handleSaveOrder} className="mt-3">
        Guardar Pedido
      </Button>
    </div>
  );
};

export default OrderRegistrationPage;
