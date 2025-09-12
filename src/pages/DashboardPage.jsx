import React, { useContext, useMemo } from 'react';
import ProductContext from '../contexts/ProductContext';
import OrderContext from '../contexts/OrderContext';
import SaleContext from '../contexts/SaleContext';
import ProviderContext from '../contexts/ProviderContext';
import { Card, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { FaBoxOpen, FaDollarSign, FaShoppingCart, FaExclamationTriangle, FaTruck, FaStar } from 'react-icons/fa';

const DashboardPage = () => {
  const { products } = useContext(ProductContext);
  const { orders } = useContext(OrderContext);
  const { sales } = useContext(SaleContext);
  const { providers } = useContext(ProviderContext);

  // RF6: Total de productos en inventario
  const totalProducts = useMemo(() => products.filter(p => p.isActive).length, [products]);

  // RF6: Valor total del inventario = Σ (precioVenta × stock)
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  }, [products]);

  // RF6: Ventas del día
  const salesToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today)
                .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  // RF6: Productos con bajo stock (lista con nombres y cantidades)
  const lowStockProducts = useMemo(() => {
    return products.filter(product => product.isActive && product.stock < product.minStock)
                   .sort((a, b) => a.stock - b.stock);
  }, [products]);

  // RF6: Proveedor más usado (basado en número de pedidos)
  const mostUsedProvider = useMemo(() => {
    const providerOrderCounts = orders.reduce((acc, order) => {
      acc[order.providerId] = (acc[order.providerId] || 0) + 1;
      return acc;
    }, {});

    if (Object.keys(providerOrderCounts).length === 0) return null;

    const maxProviderId = Object.keys(providerOrderCounts).reduce((a, b) =>
      providerOrderCounts[a] > providerOrderCounts[b] ? a : b
    );
    return providers.find(p => p.id === maxProviderId);
  }, [orders, providers]);

  // RF6: Producto más vendido (últimos 7 días)
  const mostSoldProduct = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = sales.filter(sale => new Date(sale.date) >= sevenDaysAgo);

    const productQuantities = recentSales.reduce((acc, sale) => {
      sale.products.forEach(item => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      });
      return acc;
    }, {});

    if (Object.keys(productQuantities).length === 0) return null;

    const maxProductId = Object.keys(productQuantities).reduce((a, b) =>
      productQuantities[a] > productQuantities[b] ? a : b
    );
    return products.find(p => p.id === maxProductId);
  }, [sales, products]);

  // RF6: Gráfico: Barras horizontales o verticales: ventas por día (últimos 7 días).
  // For simplicity, we'll just list daily sales for now. A real chart would use a library like Chart.js
  const dailySales = useMemo(() => {
    const salesByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      salesByDay[dateString] = 0;
    }

    sales.forEach(sale => {
      if (salesByDay.hasOwnProperty(sale.date)) {
        salesByDay[sale.date] += sale.total;
      }
    });

    return Object.keys(salesByDay).sort().map(date => ({
      date,
      total: salesByDay[date],
    }));
  }, [sales]);

  // RF6: Actividad reciente: Últimos 5 movimientos
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent sales
    sales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).forEach(sale => {
      activities.push(`Venta de ${sale.products.length} productos por ${sale.total.toFixed(2)} (${sale.date})`);
    });

    // Add recent orders
    orders.sort((a, b) => new Date(b.receptionDate) - new Date(a.receptionDate)).slice(0, 5).forEach(order => {
      const provider = providers.find(p => p.id === order.providerId);
      activities.push(`Nuevo pedido de ${order.products.length} productos a ${provider ? provider.companyName : 'Proveedor Desconocido'} (${order.receptionDate})`);
    });

    // Sort all activities by date (most recent first) and take top 5
    return activities.sort((a, b) => {
      const dateA = new Date(a.match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1] || '1970-01-01');
      const dateB = new Date(b.match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1] || '1970-01-01');
      return dateB - dateA;
    }).slice(0, 5);
  }, [sales, orders, providers]);


  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <FaBoxOpen size={40} className="text-primary mb-3" />
              <Card.Title>Total Productos</Card.Title>
              <Card.Text className="fs-3">{totalProducts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <FaDollarSign size={40} className="text-success mb-3" />
              <Card.Title>Valor Inventario</Card.Title>
              <Card.Text className="fs-3">${totalInventoryValue.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <FaShoppingCart size={40} className="text-info mb-3" />
              <Card.Title>Ventas del Día</Card.Title>
              <Card.Text className="fs-3">${salesToday.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <FaExclamationTriangle size={40} className="text-warning mb-3" />
              <Card.Title>Productos Bajo Stock</Card.Title>
              <Card.Text className="fs-3">{lowStockProducts.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>Productos con Bajo Stock</Card.Header>
            <ListGroup variant="flush">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                    {product.name}
                    <Badge bg="danger">{product.stock} unidades</Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay productos con bajo stock.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>Estadísticas Clave</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <FaTruck className="me-2" /> Proveedor Más Usado: {mostUsedProvider ? mostUsedProvider.companyName : 'N/A'}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaStar className="me-2" /> Producto Más Vendido (últimos 7 días): {mostSoldProduct ? mostSoldProduct.name : 'N/A'}
              </ListGroup.Item>
            </ListGroup>
          </Card>
          <Card className="shadow-sm mt-3">
            <Card.Header>Ventas por Día (Últimos 7 Días)</Card.Header>
            <ListGroup variant="flush">
              {dailySales.map(day => (
                <ListGroup.Item key={day.date} className="d-flex justify-content-between align-items-center">
                  {day.date}
                  <Badge bg="primary">${day.total.toFixed(2)}</Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>Actividad Reciente</Card.Header>
            <ListGroup variant="flush">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ListGroup.Item key={index}>{activity}</ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay actividad reciente.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
