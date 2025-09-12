import React, { createContext, useState, useEffect, useContext } from 'react';
import ProductContext from './ProductContext';

const OrderContext = createContext();

const initialOrders = [
  {
    id: '1',
    providerId: '1',
    receptionDate: '2023-10-26',
    guideNumber: 'GUIDE001',
    products: [
      { productId: '1', quantity: 10, name: 'Audífonos X200' },
      { productId: '3', quantity: 5, name: 'Teclado Mecánico' },
    ],
    status: 'Recibido',
  },
];

export const OrderProvider = ({ children }) => {
  const { updateStock } = useContext(ProductContext);
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    const newOrder = { ...order, id: String(orders.length + 1), status: 'Recibido' };
    setOrders((prevOrders) => [...prevOrders, newOrder]);

    // Update product stock
    newOrder.products.forEach((item) => {
      updateStock(item.productId, item.quantity);
    });
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
