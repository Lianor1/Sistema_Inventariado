import React, { useContext, useState, useMemo } from 'react';
import OrderContext from '../contexts/OrderContext';
import ProductContext from '../contexts/ProductContext';
import ProviderContext from '../contexts/ProviderContext';
import { FaPlus, FaTrash, FaEdit, FaCalculator, FaDollarSign } from 'react-icons/fa';
import { Form, Button, Table, Alert, Modal } from 'react-bootstrap';

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
  const [tempProductCostPrice, setTempProductCostPrice] = useState(''); // Precio de costo
  const [tempProductPrice, setTempProductPrice] = useState(''); // Precio de venta
  const [tempProductCategory, setTempProductCategory] = useState('');
  const [tempProductMinStock, setTempProductMinStock] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  
  // Estados para edición de cantidades
  const [editingQuantityIndex, setEditingQuantityIndex] = useState(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState('');
  
  // Estados para notas del pedido
  const [orderNotes, setOrderNotes] = useState('');
  
  // Estados para validaciones
  const [fieldErrors, setFieldErrors] = useState({});

  const availableProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  // Calcular costo total del pedido
  const calculateTotalCost = useMemo(() => {
    return orderProducts.reduce((total, item) => {
      // Usar costPrice si está disponible, sino usar price
      const cost = item.costPrice || item.price || 0;
      return total + (cost * item.quantity);
    }, 0);
  }, [orderProducts]);

  const handleAddProductToOrder = (product) => {
    // Validar cantidad
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    
    // Validar que la cantidad sea un número válido
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('La cantidad debe ser un número entero positivo.');
      return;
    }
    
    const existingProductIndex = orderProducts.findIndex(item => item.productId === product.id);
    if (existingProductIndex > -1) {
      // Si el producto ya existe, aumentar la cantidad
      const updatedProducts = [...orderProducts];
      updatedProducts[existingProductIndex].quantity += quantity;
      setOrderProducts(updatedProducts);
    } else {
      // Si es un producto nuevo, agregarlo al pedido
      setOrderProducts(prev => [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity,
        costPrice: product.costPrice || product.price, // Usar costPrice si está disponible
        price: product.price // Precio de venta para referencia
      }]);
    }
    
    setSearchTerm('');
    setQuantity(1);
    setError('');
  };

  const handleCreateAndAddTempProduct = () => {
    // Validar campos requeridos
    const errors = {};
    if (!tempProductName) errors.tempProductName = 'El nombre es obligatorio';
    if (!tempProductCode) errors.tempProductCode = 'El código es obligatorio';
    if (!tempProductCostPrice || isNaN(tempProductCostPrice) || parseFloat(tempProductCostPrice) <= 0) 
      errors.tempProductCostPrice = 'El precio de costo debe ser un número positivo';
    if (!tempProductPrice || isNaN(tempProductPrice) || parseFloat(tempProductPrice) <= 0) 
      errors.tempProductPrice = 'El precio de venta debe ser un número positivo';
    if (!tempProductCategory) errors.tempProductCategory = 'La categoría es obligatoria';
    if (!tempProductMinStock || isNaN(tempProductMinStock) || parseInt(tempProductMinStock) < 0) 
      errors.tempProductMinStock = 'El stock mínimo debe ser un número no negativo';
    if (quantity <= 0) errors.quantity = 'La cantidad debe ser mayor a 0';
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor, corrija los errores en el formulario.');
      return;
    }
    
    setFieldErrors({});

    const newTempProduct = {
      name: tempProductName,
      code: tempProductCode,
      brand: selectedProvider ? providers.find(p => p.id === selectedProvider)?.brand || '' : '',
      category: tempProductCategory,
      costPrice: parseFloat(tempProductCostPrice), // Precio de costo
      price: parseFloat(tempProductPrice), // Precio de venta
      stock: 0,
      providerId: selectedProvider,
      minStock: parseInt(tempProductMinStock),
    };

    addProduct(newTempProduct);

    // Agregar al pedido actual con ambos precios
    setOrderProducts(prev => [...prev, { 
      productId: String(products.length + 1), 
      name: newTempProduct.name, 
      quantity,
      costPrice: newTempProduct.costPrice,
      price: newTempProduct.price
    }]);

    // Limpiar campos
    setTempProductName('');
    setTempProductCode('');
    setTempProductCostPrice('');
    setTempProductPrice('');
    setTempProductCategory('');
    setTempProductMinStock('');
    setQuantity(1);
    setError('');
  };

  const handleRemoveProduct = (index) => {
    setOrderProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Iniciar edición de cantidad
  const startEditingQuantity = (index, currentQuantity) => {
    setEditingQuantityIndex(index);
    setEditingQuantityValue(currentQuantity.toString());
  };

  // Guardar edición de cantidad
  const saveEditingQuantity = (index) => {
    const newQuantity = parseInt(editingQuantityValue);
    
    if (isNaN(newQuantity) || newQuantity <= 0) {
      setError('La cantidad debe ser un número entero positivo.');
      return;
    }
    
    const updatedProducts = [...orderProducts];
    updatedProducts[index].quantity = newQuantity;
    setOrderProducts(updatedProducts);
    
    setEditingQuantityIndex(null);
    setEditingQuantityValue('');
    setError('');
  };

  // Cancelar edición de cantidad
  const cancelEditingQuantity = () => {
    setEditingQuantityIndex(null);
    setEditingQuantityValue('');
  };

  const handleSaveOrder = () => {
    // Validaciones
    if (!selectedProvider) {
      setError('Debe seleccionar un proveedor.');
      return;
    }
    
    if (orderProducts.length === 0) {
      setError('Debe agregar al menos un producto al pedido.');
      return;
    }
    
    // Validar que todas las cantidades sean números válidos
    for (let i = 0; i < orderProducts.length; i++) {
      if (isNaN(orderProducts[i].quantity) || orderProducts[i].quantity <= 0) {
        setError(`La cantidad del producto "${orderProducts[i].name}" debe ser un número entero positivo.`);
        return;
      }
    }

    const newOrder = {
      providerId: selectedProvider,
      receptionDate: new Date().toISOString().split('T')[0],
      guideNumber: guideNumber,
      notes: orderNotes, // Agregar notas al pedido
      products: orderProducts,
      totalCost: calculateTotalCost, // Agregar costo total
    };

    addOrder(newOrder);
    
    // Limpiar formulario
    setSelectedProvider('');
    setGuideNumber('');
    setOrderProducts([]);
    setOrderNotes('');
    setError('');
    alert('Pedido registrado con éxito y stock actualizado!');
  };

  // Validación de campos en tiempo real
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'tempProductName':
        if (!value) errors.tempProductName = 'El nombre es obligatorio';
        else delete errors.tempProductName;
        break;
      case 'tempProductCode':
        if (!value) errors.tempProductCode = 'El código es obligatorio';
        else delete errors.tempProductCode;
        break;
      case 'tempProductCostPrice':
        if (!value || isNaN(value) || parseFloat(value) <= 0) 
          errors.tempProductCostPrice = 'El precio de costo debe ser un número positivo';
        else delete errors.tempProductCostPrice;
        break;
      case 'tempProductPrice':
        if (!value || isNaN(value) || parseFloat(value) <= 0) 
          errors.tempProductPrice = 'El precio de venta debe ser un número positivo';
        else delete errors.tempProductPrice;
        break;
      case 'tempProductCategory':
        if (!value) errors.tempProductCategory = 'La categoría es obligatoria';
        else delete errors.tempProductCategory;
        break;
      case 'tempProductMinStock':
        if (!value || isNaN(value) || parseInt(value) < 0) 
          errors.tempProductMinStock = 'El stock mínimo debe ser un número no negativo';
        else delete errors.tempProductMinStock;
        break;
      case 'quantity':
        if (!value || parseInt(value) <= 0) 
          errors.quantity = 'La cantidad debe ser mayor a 0';
        else delete errors.quantity;
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Registro de Pedidos (Entrada de Cajas)</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Seleccionar Proveedor</Form.Label>
        <Form.Select 
          value={selectedProvider} 
          onChange={(e) => setSelectedProvider(e.target.value)}
          isInvalid={!selectedProvider && error.includes('proveedor')}
        >
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
        <Form.Control 
          type="text" 
          value={guideNumber} 
          onChange={(e) => setGuideNumber(e.target.value)} 
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Notas del Pedido (Opcional)</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3}
          value={orderNotes} 
          onChange={(e) => setOrderNotes(e.target.value)} 
          placeholder="Observaciones, instrucciones especiales, etc."
        />
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
                  <div>
                    <div>{product.name} ({product.code})</div>
                    <small className="text-muted">
                      Costo: ${(product.costPrice || product.price).toFixed(2)} | 
                      Venta: ${product.price.toFixed(2)}
                    </small>
                  </div>
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
            <Form.Control 
              type="number" 
              value={quantity} 
              onChange={(e) => {
                setQuantity(parseInt(e.target.value) || 0);
                validateField('quantity', e.target.value);
              }} 
              min="1"
              isInvalid={!!fieldErrors.quantity}
            />
            {fieldErrors.quantity && <div className="text-danger small">{fieldErrors.quantity}</div>}
          </Form.Group>
        </div>
      </div>

      <hr />
      <h4>Crear Producto Temporalmente (si no existe)</h4>
      <div className="row mb-3">
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control 
              type="text" 
              value={tempProductName} 
              onChange={(e) => {
                setTempProductName(e.target.value);
                validateField('tempProductName', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductName}
              placeholder="Nombre del producto"
            />
            {fieldErrors.tempProductName && <div className="text-danger small">{fieldErrors.tempProductName}</div>}
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Código *</Form.Label>
            <Form.Control 
              type="text" 
              value={tempProductCode} 
              onChange={(e) => {
                setTempProductCode(e.target.value);
                validateField('tempProductCode', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductCode}
              placeholder="Código único"
            />
            {fieldErrors.tempProductCode && <div className="text-danger small">{fieldErrors.tempProductCode}</div>}
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Precio Costo *</Form.Label>
            <Form.Control 
              type="number" 
              step="0.01" 
              value={tempProductCostPrice} 
              onChange={(e) => {
                setTempProductCostPrice(e.target.value);
                validateField('tempProductCostPrice', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductCostPrice}
              placeholder="0.00"
            />
            <Form.Text className="text-muted">Precio al proveedor</Form.Text>
            {fieldErrors.tempProductCostPrice && <div className="text-danger small">{fieldErrors.tempProductCostPrice}</div>}
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Precio Venta *</Form.Label>
            <Form.Control 
              type="number" 
              step="0.01" 
              value={tempProductPrice} 
              onChange={(e) => {
                setTempProductPrice(e.target.value);
                validateField('tempProductPrice', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductPrice}
              placeholder="0.00"
            />
            <Form.Text className="text-muted">Precio al cliente</Form.Text>
            {fieldErrors.tempProductPrice && <div className="text-danger small">{fieldErrors.tempProductPrice}</div>}
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Categoría *</Form.Label>
            <Form.Control 
              type="text" 
              value={tempProductCategory} 
              onChange={(e) => {
                setTempProductCategory(e.target.value);
                validateField('tempProductCategory', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductCategory}
              placeholder="Categoría"
            />
            {fieldErrors.tempProductCategory && <div className="text-danger small">{fieldErrors.tempProductCategory}</div>}
          </Form.Group>
        </div>
        <div className="col-md-2">
          <Form.Group>
            <Form.Label>Stock Mínimo *</Form.Label>
            <Form.Control 
              type="number" 
              value={tempProductMinStock} 
              onChange={(e) => {
                setTempProductMinStock(e.target.value);
                validateField('tempProductMinStock', e.target.value);
              }}
              isInvalid={!!fieldErrors.tempProductMinStock}
              placeholder="Cantidad mínima"
            />
            {fieldErrors.tempProductMinStock && <div className="text-danger small">{fieldErrors.tempProductMinStock}</div>}
          </Form.Group>
        </div>
        <div className="col-md-1 d-flex align-items-end">
          <Button 
            variant="info" 
            onClick={handleCreateAndAddTempProduct} 
            className="w-100"
            disabled={Object.keys(fieldErrors).some(key => key.startsWith('tempProduct') || key === 'quantity')}
          >
            <FaPlus />
          </Button>
        </div>
      </div>

      <hr />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Resumen del Pedido</h4>
        {orderProducts.length > 0 && (
          <div className="d-flex align-items-center">
            <FaCalculator className="me-2 text-primary" />
            <span className="fw-bold">Total Costo: ${calculateTotalCost.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {orderProducts.length === 0 ? (
        <Alert variant="info">No hay productos en el pedido.</Alert>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Costo Unitario</th>
                <th>Venta Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal Costo</th>
                <th>Subtotal Venta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orderProducts.map((item, index) => {
                const costPrice = item.costPrice || item.price || 0;
                const sellingPrice = item.price || 0;
                const subtotalCost = costPrice * item.quantity;
                const subtotalSale = sellingPrice * item.quantity;
                
                return (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>${costPrice.toFixed(2)}</td>
                    <td>${sellingPrice.toFixed(2)}</td>
                    <td>
                      {editingQuantityIndex === index ? (
                        <div className="d-flex">
                          <Form.Control
                            type="number"
                            value={editingQuantityValue}
                            onChange={(e) => setEditingQuantityValue(e.target.value)}
                            min="1"
                            autoFocus
                          />
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="ms-1"
                            onClick={() => saveEditingQuantity(index)}
                          >
                            ✓
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="ms-1"
                            onClick={cancelEditingQuantity}
                          >
                            ✗
                          </Button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <span>{item.quantity}</span>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="ms-2"
                            onClick={() => startEditingQuantity(index, item.quantity)}
                          >
                            <FaEdit />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td>${subtotalCost.toFixed(2)}</td>
                    <td>${subtotalSale.toFixed(2)}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveProduct(index)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          
          <div className="d-flex justify-content-end mt-3">
            <div className="card p-3" style={{ width: '300px' }}>
              <div className="d-flex justify-content-between">
                <strong>Total Costo del Pedido:</strong>
                <strong className="text-success">${calculateTotalCost.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <strong>Valor Venta Potencial:</strong>
                <strong className="text-primary">
                  ${orderProducts.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0).toFixed(2)}
                </strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <strong>Ganancia Potencial:</strong>
                <strong className={calculateTotalCost > 0 ? "text-success" : "text-muted"}>
                  ${(
                    orderProducts.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0) - 
                    calculateTotalCost
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}

      <Button 
        variant="success" 
        onClick={handleSaveOrder} 
        className="mt-3"
        disabled={orderProducts.length === 0}
      >
        <FaDollarSign className="me-2" />
        Guardar Pedido
      </Button>
    </div>
  );
};

export default OrderRegistrationPage;
