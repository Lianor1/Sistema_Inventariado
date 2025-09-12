import React, { createContext, useState, useEffect } from 'react';

const ProductContext = createContext();

const initialProducts = [
  {
    id: '1',
    name: 'Audífonos X200',
    code: 'PROD001',
    brand: 'ABC Electronics',
    category: 'Electrónica',
    price: 25.99,
    stock: 15,
    providerId: '1',
    minStock: 5,
    isActive: true,
  },
  {
    id: '2',
    name: 'Funda Resistente',
    code: 'PROD002',
    brand: 'XYZ Accesorios',
    category: 'Accesorios',
    price: 12.50,
    stock: 8,
    providerId: '2',
    minStock: 3,
    isActive: true,
  },
  {
    id: '3',
    name: 'Teclado Mecánico',
    code: 'PROD003',
    brand: 'ABC Electronics',
    category: 'Electrónica',
    price: 75.00,
    stock: 4,
    providerId: '1',
    minStock: 5,
    isActive: true,
  },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product) => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { ...product, id: String(prevProducts.length + 1), isActive: true },
    ]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, ...updatedProduct } : product
      )
    );
  };

  const deleteProduct = (id) => {
    // In a real app, check for sales/order history before deleting
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, isActive: false } : product
      )
    );
  };

  const updateStock = (productId, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, stock: product.stock + quantity } // quantity can be positive (add) or negative (subtract)
          : product
      )
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
