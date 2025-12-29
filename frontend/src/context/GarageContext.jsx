
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GarageContext = createContext();

export const useGarage = () => useContext(GarageContext);

export const GarageProvider = ({ children }) => {

  // --- Data State ---
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('vehicles');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('services');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [technicians, setTechnicians] = useState(() => {
    const saved = localStorage.getItem('technicians');
    return saved ? JSON.parse(saved) : [
      { id: 't1', name: 'John Doe', specialization: 'Engine Specialist', workload: 0 },
      { id: 't2', name: 'Jane Smith', specialization: 'Brake & Suspension', workload: 0 },
      { id: 't3', name: 'Mike Johnson', specialization: 'General Service', workload: 0 },
    ];
  });

  const [staffMembers, setStaffMembers] = useState(() => {
    const saved = localStorage.getItem('staffMembers');
    return saved ? JSON.parse(saved) : [
       { id: 'staff-default', name: 'Default Staff', email: 'staff@progarage.com', password: 'staffpassword123', role: 'staff' }
    ];
  });

   const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('technicians', JSON.stringify(technicians)); }, [technicians]);
  useEffect(() => { localStorage.setItem('staffMembers', JSON.stringify(staffMembers)); }, [staffMembers]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  // --- Actions ---

  // Auth
  const login = (email, password) => {
    // Admin Master Login
    if (email === 'admin@progarage.com' && password === 'adminpassword123') {
      const user = { id: 'admin', name: 'Admin User', role: 'admin', email };
      setCurrentUser(user);
      return { success: true, user };
    }

    // Dynamic Staff Login
    const staff = staffMembers.find(s => s.email === email && s.password === password);
    if (staff) {
       const user = { id: staff.id, name: staff.name, role: staff.role, email: staff.email };
       setCurrentUser(user);
       return { success: true, user };
    }

    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Staff Management (Admin)
  const addStaffMember = (staff) => {
    setStaffMembers(prev => [...prev, { ...staff, id: uuidv4() }]);
  };

  const removeStaffMember = (id) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
  };


  // Customers
  const addCustomer = (customer) => {
    setCustomers(prev => [...prev, { ...customer, id: uuidv4(), createdAt: new Date().toISOString() }]);
  };
  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Vehicles
  const addVehicle = (vehicle) => {
    setVehicles(prev => [...prev, { ...vehicle, id: uuidv4(), createdAt: new Date().toISOString() }]);
  };
  const updateVehicle = (id, updates) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };
  const getCustomerVehicles = (customerId) => {
    return vehicles.filter(v => v.customerId === customerId);
  };

  // Services
  const addService = (service) => {
    const newService = { 
        ...service, 
        id: uuidv4(), 
        status: 'Pending', 
        createdAt: new Date().toISOString() 
    };
    setServices(prev => [...prev, newService]);
    
    // Update tech workload
    if (service.technicianId) {
        setTechnicians(prev => prev.map(t => t.id === service.technicianId ? { ...t, workload: t.workload + 1 } : t));
    }
  };

  const updateServiceStatus = (id, status) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // Billing
  const value = {
    customers, addCustomer, updateCustomer, deleteCustomer,
    vehicles, addVehicle, updateVehicle, getCustomerVehicles,
    services, addService, updateServiceStatus,
    invoices,
    technicians,
    staffMembers, addStaffMember, removeStaffMember,
    currentUser, login, logout
  };

  return (
    <GarageContext.Provider value={value}>
      {children}
    </GarageContext.Provider>
  );
};
