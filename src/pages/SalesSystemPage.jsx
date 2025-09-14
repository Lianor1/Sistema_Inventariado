import React, { useContext, useState, useMemo } from 'react';
import ProductContext from '../contexts/ProductContext';
import SaleContext from '../contexts/SaleContext';
import { FaSearch, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { Form, Button, Table, Alert, Offcanvas, Modal } from 'react-bootstrap';

const SalesSystemPage = () => {
  const { products } = useContext(ProductContext);
  const { addSale } = useContext(SaleContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p =>
      p.isActive && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, products]);

  const handleAddToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].quantity < product.stock) {
        updatedCart[existingItemIndex].quantity += 1;
        setCart(updatedCart);
      } else {
        alert('No hay suficiente stock disponible.');
      }
    } else {
      if (product.stock > 0) {
        setCart(prev => [...prev, { ...product, quantity: 1 }]);
      } else {
        alert('Producto sin stock.');
      }
    }
    setSearchTerm('');
    setShowOffcanvas(true); // Open cart when item is added
  };

  const handleQuantityChange = (id, newQuantity) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const productInStock = products.find(p => p.id === id);
        if (newQuantity > productInStock.stock) {
          alert('No hay suficiente stock disponible.');
          return item; // Don't update if quantity exceeds stock
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0)); // Remove if quantity becomes 0
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    const saleProducts = cart.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price, // Precio de venta
    }));

    const newSale = {
      products: saleProducts,
      total: calculateTotal,
      paymentMethod: paymentMethod,
    };

    addSale(newSale);

    // Prepare receipt
    setReceipt({
      id: String(Date.now()), // Mock ID
      date: new Date().toLocaleString(),
      products: saleProducts,
      total: calculateTotal,
      paymentMethod: paymentMethod,
    });
    setShowReceiptModal(true);

    // Clear cart
    setCart([]);
    setSearchTerm('');
    setPaymentMethod('Efectivo');
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setReceipt(null);
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Sistema de Ventas (PDV)</h1>

      <div className="row">
        {/* Product Search and List */}
        <div className="col-md-8">
          <Form.Group className="mb-3">
            <Form.Label>Búsqueda Rápida de Productos</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary"><FaSearch /></Button>
            </div>
          </Form.Group>

          <div className="product-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredProducts.length > 0 ? (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Precio Venta</th>
                    <th>Stock</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.code}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                          <FaPlus /> Añadir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (searchTerm && <Alert variant="info">No se encontraron productos.</Alert>)}
          </div>
        </div>

        {/* Cart Summary (Offcanvas) */}
        <div className="col-md-4">
          <Button variant="primary" className="w-100 mb-3" onClick={() => setShowOffcanvas(true)}>
            <FaShoppingCart className="me-2" /> Ver Carrito ({cart.length})
          </Button>

          <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Carrito de Compras</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {cart.length === 0 ? (
                <Alert variant="info">El carrito está vacío.</Alert>
              ) : (
                <>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              min="1"
                              style={{ width: '70px' }}
                            />
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <Button variant="danger" size="sm" onClick={() => handleRemoveFromCart(item.id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <h4 className="text-end mt-3">Total: ${calculateTotal.toFixed(2)}</h4>

                  <Form.Group className="mb-3">
                    <Form.Label>Método de Pago</Form.Label>
                    <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="success" className="w-100" onClick={handleConfirmSale}>
                    Confirmar Venta
                  </Button>
                </>
              )}
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={handleCloseReceiptModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Comprobante de Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {receipt && (
            <div>
              <p><strong>ID de Venta:</strong> {receipt.id}</p>
              <p><strong>Fecha:</strong> {receipt.date}</p>
              <p><strong>Método de Pago:</strong> {receipt.paymentMethod}</p>
              <hr />
              <h5>Productos:</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <h4 className="text-end">Total Pagado: ${receipt.total.toFixed(2)}</h4>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReceiptModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesSystemPage;
