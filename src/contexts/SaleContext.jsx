import React, { createContext, useState, useEffect, useContext } from 'react';
import ProductContext from './ProductContext';

const SaleContext = createContext();

const initialSales = [
  {
    id: '1',
    date: '2023-10-26',
    products: [
      { productId: '1', name: 'Audífonos X200', quantity: 1, price: 25.99 },
      { productId: '2', name: 'Funda Resistente', quantity: 2, price: 12.50 },
    ],
    total: 50.99,
    paymentMethod: 'Tarjeta',
  },
];

export const SaleProvider = ({ children }) => {
  const { updateStock } = useContext(ProductContext);
  const [sales, setSales] = useState(() => {
    const savedSales = localStorage.getItem('sales');
    return savedSales ? JSON.parse(savedSales) : initialSales;
  });

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale) => {
    const newSale = { ...sale, id: String(sales.length + 1), date: new Date().toISOString().split('T')[0] };
    setSales((prevSales) => [...prevSales, newSale]);

    // Update product stock
    newSale.products.forEach((item) => {
      updateStock(item.productId, -item.quantity); // Subtract quantity
    });
  };

  return (
    <SaleContext.Provider value={{ sales, addSale }}>
      {children}
    </SaleContext.Provider>
  );
};

export default SaleContext;
