import React, { useContext, useState, useMemo } from 'react';
import { Tab, Tabs, Form, Table, Button, Modal } from 'react-bootstrap';
import OrderContext from '../contexts/OrderContext';
import SaleContext from '../contexts/SaleContext';
import ProviderContext from '../contexts/ProviderContext';
import ProductContext from '../contexts/ProductContext';

const HistoryPage = () => {
  const { orders } = useContext(OrderContext);
  const { sales } = useContext(SaleContext);
  const { providers } = useContext(ProviderContext);
  const { products } = useContext(ProductContext);

  const [key, setKey] = useState('orders'); // 'orders' or 'sales'

  // Order History Filters
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderProviderFilter, setOrderProviderFilter] = useState('');
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sale History Filters
  const [saleDateFilter, setSaleDateFilter] = useState('');
  const [saleProductFilter, setSaleProductFilter] = useState('');
  const [salePaymentMethodFilter, setSalePaymentMethodFilter] = useState('');
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.companyName : 'Desconocido';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Desconocido';
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesDate = orderDateFilter === '' || order.receptionDate === orderDateFilter;
      const matchesProvider = orderProviderFilter === '' || order.providerId === orderProviderFilter;
      return matchesDate && matchesProvider;
    });
  }, [orders, orderDateFilter, orderProviderFilter]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesDate = saleDateFilter === '' || sale.date === saleDateFilter;
      const matchesPaymentMethod = salePaymentMethodFilter === '' || sale.paymentMethod === salePaymentMethodFilter;
      const matchesProduct = saleProductFilter === '' || sale.products.some(p => p.productId === saleProductFilter);
      return matchesDate && matchesPaymentMethod && matchesProduct;
    });
  }, [sales, saleDateFilter, salePaymentMethodFilter, saleProductFilter]);

  const handleShowOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
    setShowOrderDetailModal(false);
  };

  const handleShowSaleDetail = (sale) => {
    setSelectedSale(sale);
    setShowSaleDetailModal(true);
  };

  const handleCloseSaleDetail = () => {
    setSelectedSale(null);
    setShowSaleDetailModal(false);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Historial y Consultas</h1>

      <Tabs
        id="history-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="orders" title="Historial de Pedidos">
          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Filtrar por Fecha</Form.Label>
                <Form.Control type="date" value={orderDateFilter} onChange={(e) => setOrderDateFilter(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Filtrar por Proveedor</Form.Label>
                <Form.Select value={orderProviderFilter} onChange={(e) => setOrderProviderFilter(e.target.value)}>
                  <option value="">Todos los Proveedores</option>
                  {providers.map(prov => <option key={prov.id} value={prov.id}>{prov.companyName}</option>)}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Proveedor</th>
                <th>Fecha Recepción</th>
                <th>Número Guía</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{getProviderName(order.providerId)}</td>
                  <td>{order.receptionDate}</td>
                  <td>{order.guideNumber || 'N/A'}</td>
                  <td>{order.status}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => handleShowOrderDetail(order)}>
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="sales" title="Historial de Ventas">
          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Filtrar por Fecha</Form.Label>
                <Form.Control type="date" value={saleDateFilter} onChange={(e) => setSaleDateFilter(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Filtrar por Producto</Form.Label>
                <Form.Select value={saleProductFilter} onChange={(e) => setSaleProductFilter(e.target.value)}>
                  <option value="">Todos los Productos</option>
                  {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Filtrar por Método de Pago</Form.Label>
                <Form.Select value={salePaymentMethodFilter} onChange={(e) => setSalePaymentMethodFilter(e.target.value)}>
                  <option value="">Todos los Métodos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.date}</td>
                  <td>${sale.total.toFixed(2)}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => handleShowSaleDetail(sale)}>
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Order Detail Modal */}
      <Modal show={showOrderDetailModal} onHide={handleCloseOrderDetail} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p><strong>Proveedor:</strong> {getProviderName(selectedOrder.providerId)}</p>
              <p><strong>Fecha de Recepción:</strong> {selectedOrder.receptionDate}</p>
              <p><strong>Número de Guía:</strong> {selectedOrder.guideNumber || 'N/A'}</p>
              <p><strong>Estado:</strong> {selectedOrder.status}</p>
              <hr />
              <h5>Productos Incluidos:</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOrderDetail}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Sale Detail Modal */}
      <Modal show={showSaleDetailModal} onHide={handleCloseSaleDetail} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Venta #{selectedSale?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSale && (
            <div>
              <p><strong>Fecha:</strong> {selectedSale.date}</p>
              <p><strong>Método de Pago:</strong> {selectedSale.paymentMethod}</p>
              <p><strong>Total:</strong> ${selectedSale.total.toFixed(2)}</p>
              <hr />
              <h5>Productos Vendidos:</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSaleDetail}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoryPage;
