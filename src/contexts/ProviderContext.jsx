import React, { createContext, useState, useEffect } from 'react';

const ProviderContext = createContext();

const initialProviders = [
  {
    id: '1',
    companyName: 'Distribuidora ABC',
    contactName: 'Juan Pérez',
    phone: '1122334455',
    email: 'contacto@abc.com',
    brand: 'ABC Electronics',
    isActive: true,
  },
  {
    id: '2',
    companyName: 'Suministros XYZ',
    contactName: 'María García',
    phone: '9988776655',
    email: 'info@xyz.com',
    brand: 'XYZ Accesorios',
    isActive: true,
  },
];

export const ProviderProvider = ({ children }) => {
  const [providers, setProviders] = useState(() => {
    const savedProviders = localStorage.getItem('providers');
    return savedProviders ? JSON.parse(savedProviders) : initialProviders;
  });

  useEffect(() => {
    localStorage.setItem('providers', JSON.stringify(providers));
  }, [providers]);

  const addProvider = (provider) => {
    setProviders((prevProviders) => [
      ...prevProviders,
      { ...provider, id: String(prevProviders.length + 1), isActive: true },
    ]);
  };

  const updateProvider = (id, updatedProvider) => {
    setProviders((prevProviders) =>
      prevProviders.map((provider) =>
        provider.id === id ? { ...provider, ...updatedProvider } : provider
      )
    );
  };

  const deleteProvider = (id) => {
    // In a real app, check for associated products before deleting
    setProviders((prevProviders) =>
      prevProviders.map((provider) =>
        provider.id === id ? { ...provider, isActive: false } : provider
      )
    );
  };

  return (
    <ProviderContext.Provider
      value={{ providers, addProvider, updateProvider, deleteProvider }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContext;
