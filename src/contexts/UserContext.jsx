import React, { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

const initialUsers = [
  {
    id: '1',
    fullName: 'Administrador Principal',
    email: 'admin@example.com',
    role: 'Administrador',
    password: 'password', // In a real app, never store plain passwords
    isActive: true,
  },
  {
    id: '2',
    fullName: 'Empleado de Ventas',
    email: 'empleado@example.com',
    role: 'Empleado',
    password: 'password', // In a real app, never store plain passwords
    isActive: true,
  },
];

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const addUser = (user) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      { ...user, id: String(prevUsers.length + 1), isActive: true },
    ]);
  };

  const updateUser = (id, updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const deactivateUser = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === id ? { ...user, isActive: false } : user))
    );
  };

  const activateUser = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === id ? { ...user, isActive: true } : user))
    );
  };

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deactivateUser, activateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
