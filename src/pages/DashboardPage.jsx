import React, { useContext, useMemo, useState } from 'react';
import ProductContext from '../contexts/ProductContext';
import OrderContext from '../contexts/OrderContext';
import SaleContext from '../contexts/SaleContext';
import ProviderContext from '../contexts/ProviderContext';
import { Card, Row, Col, ListGroup, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FaBoxOpen, 
  FaDollarSign, 
  FaShoppingCart, 
  FaExclamationTriangle, 
  FaTruck, 
  FaStar, 
  FaArrowUp, 
  FaArrowDown,
  FaChartLine,
  FaMoneyBillWave,
  FaPercentage,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

const DashboardPage = () => {
  const { products } = useContext(ProductContext);
  const { orders } = useContext(OrderContext);
  const { sales } = useContext(SaleContext);
  const { providers } = useContext(ProviderContext);
  const [selectedPeriod, setSelectedPeriod] = useState('7d'); // '7d', '30d', '90d'

  // Calcular ventas de períodos anteriores para comparativas
  const calculateSalesForPeriod = (days) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return sales.filter(sale => new Date(sale.date) >= startDate)
                .reduce((sum, sale) => sum + sale.total, 0);
  };

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

  // Ventas de ayer para comparativa
  const salesYesterday = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    return sales.filter(sale => sale.date === yesterdayString)
                .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  // Calcular tendencia de ventas
  const salesTrend = useMemo(() => {
    if (salesYesterday === 0) return 0;
    return ((salesToday - salesYesterday) / salesYesterday) * 100;
  }, [salesToday, salesYesterday]);

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
  const dailySales = useMemo(() => {
    const salesByDay = {};
    const maxSales = { date: '', total: 0 };
    
    // Inicializar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      salesByDay[dateString] = 0;
    }

    // Calcular ventas por día
    sales.forEach(sale => {
      if (salesByDay.hasOwnProperty(sale.date)) {
        salesByDay[sale.date] += sale.total;
        if (salesByDay[sale.date] > maxSales.total) {
          maxSales.total = salesByDay[sale.date];
          maxSales.date = sale.date;
        }
      }
    });

    return Object.keys(salesByDay).map(date => ({
      date,
      total: salesByDay[date],
      percentage: maxSales.total > 0 ? (salesByDay[date] / maxSales.total) * 100 : 0
    }));
  }, [sales]);

  // RF6: Actividad reciente: Últimos 5 movimientos
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent sales
    sales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).forEach(sale => {
      activities.push({
        type: 'sale',
        description: `Venta de ${sale.products.length} productos por ${sale.total.toFixed(2)}`,
        date: sale.date,
        amount: sale.total
      });
    });

    // Add recent orders
    orders.sort((a, b) => new Date(b.receptionDate) - new Date(a.receptionDate)).slice(0, 5).forEach(order => {
      const provider = providers.find(p => p.id === order.providerId);
      activities.push({
        type: 'order',
        description: `Nuevo pedido de ${order.products.length} productos a ${provider ? provider.companyName : 'Proveedor Desconocido'}`,
        date: order.receptionDate
      });
    });

    // Sort all activities by date (most recent first) and take top 5
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [sales, orders, providers]);

  // Calcular métricas financieras avanzadas
  const financialMetrics = useMemo(() => {
    // Calcular costo estimado de productos (usando costPrice si está disponible)
    const totalCost = products.reduce((sum, product) => {
      const costPrice = product.costPrice || product.price;
      return sum + (costPrice * product.stock);
    }, 0);
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const estimatedProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;
    
    return {
      totalCost,
      totalRevenue,
      estimatedProfit,
      profitMargin
    };
  }, [products, sales]);

  // Ventas por período seleccionado
  const periodSales = useMemo(() => {
    switch(selectedPeriod) {
      case '7d': return calculateSalesForPeriod(7);
      case '30d': return calculateSalesForPeriod(30);
      case '90d': return calculateSalesForPeriod(90);
      default: return calculateSalesForPeriod(7);
    }
  }, [selectedPeriod, sales]);

  // Calcular ventas del período anterior para comparativa
  const previousPeriodSales = useMemo(() => {
    switch(selectedPeriod) {
      case '7d': return calculateSalesForPeriod(14) - calculateSalesForPeriod(7);
      case '30d': return calculateSalesForPeriod(60) - calculateSalesForPeriod(30);
      case '90d': return calculateSalesForPeriod(180) - calculateSalesForPeriod(90);
      default: return calculateSalesForPeriod(14) - calculateSalesForPeriod(7);
    }
  }, [selectedPeriod, sales]);

  // Calcular tendencia del período
  const periodTrend = useMemo(() => {
    if (previousPeriodSales === 0) return 0;
    return ((periodSales - previousPeriodSales) / previousPeriodSales) * 100;
  }, [periodSales, previousPeriodSales]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <div className="d-flex align-items-center">
          <span className="me-2">Período:</span>
          <select 
            className="form-select form-select-sm" 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7d">7 días</option>
            <option value="30d">30 días</option>
            <option value="90d">90 días</option>
          </select>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-primary">
            <Card.Body>
              <FaShoppingCart size={30} className="text-primary mb-2" />
              <Card.Title className="fs-6">Ventas {selectedPeriod === '7d' ? '7 días' : selectedPeriod === '30d' ? '30 días' : '90 días'}</Card.Title>
              <Card.Text className="fs-4 fw-bold">${periodSales.toFixed(2)}</Card.Text>
              <div className={`d-flex align-items-center justify-content-center small ${periodTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                {periodTrend >= 0 ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                {Math.abs(periodTrend).toFixed(1)}% vs. período anterior
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <FaMoneyBillWave size={30} className="text-success mb-2" />
              <Card.Title className="fs-6">Ganancia Estimada</Card.Title>
              <Card.Text className="fs-4 fw-bold">${financialMetrics.estimatedProfit.toFixed(2)}</Card.Text>
              <div className="d-flex align-items-center justify-content-center small text-success">
                <FaPercentage className="me-1" />
                {financialMetrics.profitMargin.toFixed(1)}% margen
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <FaBoxOpen size={30} className="text-info mb-2" />
              <Card.Title className="fs-6">Total Productos</Card.Title>
              <Card.Text className="fs-4 fw-bold">{totalProducts}</Card.Text>
              <div className="small text-muted">{lowStockProducts.length} con bajo stock</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <FaDollarSign size={30} className="text-warning mb-2" />
              <Card.Title className="fs-6">Valor Inventario</Card.Title>
              <Card.Text className="fs-4 fw-bold">${totalInventoryValue.toFixed(2)}</Card.Text>
              <div className="small text-muted">Costo estimado: ${(financialMetrics.totalCost).toFixed(2)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de Ventas y Métricas Clave */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span><FaChartLine className="me-2" />Ventas por Día (Últimos 7 Días)</span>
              <small className="text-muted">Hoy: ${salesToday.toFixed(2)}</small>
            </Card.Header>
            <Card.Body>
              {dailySales.map((day, index) => (
                <div key={day.date} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="small">{day.date}</span>
                    <span className="small fw-bold">${day.total.toFixed(2)}</span>
                  </div>
                  <ProgressBar 
                    now={day.percentage} 
                    variant={day.total > 0 ? "primary" : "secondary"} 
                    style={{ height: '10px' }}
                    className="mt-1"
                  />
                </div>
              ))}
              <div className="d-flex justify-content-between small text-muted mt-2">
                <div>
                  Tendencia hoy: 
                  <span className={`ms-1 ${salesTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {salesTrend >= 0 ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                    {Math.abs(salesTrend).toFixed(1)}%
                  </span>
                </div>
                <div>
                  Mejor día: ${Math.max(...dailySales.map(d => d.total)).toFixed(2)}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header>Estadísticas Clave</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaTruck className="me-2 text-primary" /> 
                    <span className="fw-medium">Proveedor Más Usado</span>
                  </div>
                  <Badge bg="primary" className="text-truncate" style={{ maxWidth: '120px' }}>
                    {mostUsedProvider ? mostUsedProvider.companyName : 'N/A'}
                  </Badge>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaStar className="me-2 text-warning" /> 
                    <span className="fw-medium">Producto Más Vendido</span>
                  </div>
                  <Badge bg="warning" className="text-dark text-truncate" style={{ maxWidth: '120px' }}>
                    {mostSoldProduct ? mostSoldProduct.name : 'N/A'}
                  </Badge>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaExclamationTriangle className="me-2 text-danger" /> 
                    <span className="fw-medium">Productos Bajo Stock</span>
                  </div>
                  <Badge bg={lowStockProducts.length > 0 ? "danger" : "success"}>
                    {lowStockProducts.length}
                  </Badge>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaChartLine className="me-2 text-info" /> 
                    <span className="fw-medium">Tendencia Ventas</span>
                  </div>
                  <Badge bg={salesTrend >= 0 ? "success" : "danger"}>
                    {salesTrend >= 0 ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                    {Math.abs(salesTrend).toFixed(1)}%
                  </Badge>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Productos con Bajo Stock y Actividad Reciente */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span><FaExclamationTriangle className="me-2 text-danger" />Productos con Bajo Stock</span>
              <Badge bg={lowStockProducts.length > 0 ? "danger" : "success"}>
                {lowStockProducts.length}
              </Badge>
            </Card.Header>
            <ListGroup variant="flush">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                    <div className="text-truncate" style={{ maxWidth: '70%' }}>
                      {product.name}
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg="danger" className="me-2">{product.stock}</Badge>
                      <span className="small text-muted">mín: {product.minStock}</span>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center text-success">
                  <FaCheckCircle className="me-2" />¡Todos los productos tienen stock suficiente!
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header><FaClock className="me-2" />Actividad Reciente</Card.Header>
            <ListGroup variant="flush">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        {activity.type === 'sale' ? (
                          <FaShoppingCart className="text-success me-2" />
                        ) : (
                          <FaTruck className="text-primary me-2" />
                        )}
                        <span className="small fw-medium">{activity.description}</span>
                      </div>
                      <small className="text-muted">{activity.date}</small>
                    </div>
                    {activity.amount && (
                      <Badge bg={activity.type === 'sale' ? "success" : "primary"}>
                        ${activity.amount.toFixed(2)}
                      </Badge>
                    )}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center text-muted">
                  No hay actividad reciente.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
