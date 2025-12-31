import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService, { handleApiError } from '../services/api.jsx';

const GarageContext = createContext();

export const useGarage = () => useContext(GarageContext);

export const GarageProvider = ({ children }) => {
  // --- Loading & Error State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data State ---
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [billingSettings, setBillingSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Normalization Helpers ---
  const normalizeService = (s) => ({
    ...s,
    cost: parseFloat(s.cost) || 0
  });

  const normalizeInvoice = (inv) => ({
    ...inv,
    subtotal: parseFloat(inv.subtotal) || 0,
    discount: parseFloat(inv.discount) || 0,
    taxAmount: parseFloat(inv.taxAmount) || 0,
    total: parseFloat(inv.total) || 0,
    paidAmount: parseFloat(inv.paidAmount) || 0,
    balancedue: parseFloat(inv.balancedue) || 0,
    taxRate: parseFloat(inv.taxRate) || 0
  });

  const normalizePayment = (p) => ({
    ...p,
    amount: parseFloat(p.amount) || 0
  });

  const normalizeBillingSettings = (bs) => {
    if (!bs) return null;
    return {
      ...bs,
      taxRate: parseFloat(bs.taxRate) || 0,
      nextInvoiceNumber: parseInt(bs.nextInvoiceNumber) || 1
    };
  };

  // --- Initial Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        custRes, 
        vehRes, 
        servRes, 
        invRes, 
        payRes, 
        techRes, 
        staffRes, 
        billingRes
      ] = await Promise.all([
        apiService.customers.getAll(),
        apiService.vehicles.getAll(),
        apiService.services.getAll(),
        apiService.invoices.getAll(),
        apiService.payments.getAll(),
        apiService.technicians.getAll(),
        apiService.users.getAll(),
        apiService.billingSettings.getCurrent()
      ]);

      // DRF returns data as an array or inside 'results' if paginated
      setCustomers(custRes.data.results || custRes.data);
      setVehicles(vehRes.data.results || vehRes.data);
      setServices((servRes.data.results || servRes.data).map(normalizeService));
      setInvoices((invRes.data.results || invRes.data).map(normalizeInvoice));
      setPayments((payRes.data.results || payRes.data).map(normalizePayment));
      setTechnicians(techRes.data.results || techRes.data);
      setStaffMembers(staffRes.data.results || staffRes.data);
      setBillingSettings(normalizeBillingSettings(billingRes.data));
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Initial fetch error:', err);
      setError('Failed to connect to backend server. Please ensure the server is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save currentUser to localStorage for persistence across reloads
  useEffect(() => { 
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  // --- Actions ---

  // Auth Operations
  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login(email, password);
      if (response.data.success) {
        setCurrentUser(response.data.user);
        // Refresh data after successful login to ensure everything is up to date
        fetchData();
        return { success: true, user: response.data.user };
      }
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerStaff = async (data) => {
    try {
      const response = await apiService.auth.register(data);
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  };

  const removeStaffMember = async (id) => {
    try {
      await apiService.users.delete(id);
      setStaffMembers(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const approveStaffMember = async (id) => {
      try {
          // Pass current user id or a default
          const adminId = currentUser ? currentUser.id : 'admin';
          await apiService.auth.approveUser(id, adminId);
          // Update local state
          setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, is_approved: true } : s));
          return { success: true };
      } catch (err) {
          return handleApiError(err);
      }
  };

  const updateUserRole = async (id, newRole) => {
      try {
          await apiService.users.update(id, { role: newRole });
           // Update local state
           setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, role: newRole } : s));
           return { success: true };
      } catch(err) {
          return handleApiError(err);
      }
  };

  // Customer Operations
  const addCustomer = async (customerData) => {
    try {
      const response = await apiService.customers.create(customerData);
      setCustomers(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      const response = await apiService.customers.update(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? response.data : c));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await apiService.customers.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  };

  // Vehicle Operations
  const addVehicle = async (vehicleData) => {
    try {
      const response = await apiService.vehicles.create(vehicleData);
      setVehicles(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const response = await apiService.vehicles.update(id, updates);
      setVehicles(prev => prev.map(v => v.id === id ? response.data : v));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const getCustomerVehicles = (customerId) => {
    return vehicles.filter(v => (v.customer || v.customer_id) === customerId);
  };

  // Service Operations
  const addService = async (serviceData) => {
    try {
      const response = await apiService.services.create(serviceData);
      const normalized = normalizeService(response.data);
      setServices(prev => [...prev, normalized]);
      // Refetch technicians to update workload counts
      const techRes = await apiService.technicians.getAll();
      setTechnicians(techRes.data.results || techRes.data);
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateServiceStatus = async (id, status) => {
    try {
      await apiService.services.updateStatus(id, status);
      setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  };

  // Invoice Operations
  const createInvoice = async (serviceId, invoiceData = {}) => {
    try {
      const response = await apiService.invoices.create({ service_id: serviceId, ...invoiceData });
      const normalized = normalizeInvoice(response.data);
      setInvoices(prev => [...prev, normalized]);
      return normalized;
    } catch (err) {
      console.error('Invoice creation error:', handleApiError(err));
      return null;
    }
  };

  const updateInvoice = async (invoiceId, updates) => {
    try {
      const response = await apiService.invoices.update(invoiceId, updates);
      const normalized = normalizeInvoice(response.data);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? normalized : inv));
      return { success: true, data: normalized };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await apiService.invoices.delete(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  };

  // Payment Operations
  const recordPayment = async (invoiceId, paymentData) => {
    try {
      const response = await apiService.payments.create({ invoice_id: invoiceId, ...paymentData });
      const normalized = normalizePayment(response.data);
      setPayments(prev => [...prev, normalized]);
      
      // Since payment updates invoice balance/status, refetch all data
      fetchData();
      return normalized;
    } catch (err) {
      console.error('Payment recording error:', handleApiError(err));
      return null;
    }
  };

  const getInvoicePayments = (invoiceId) => {
    return payments.filter(p => (p.invoice || p.invoice_id) === invoiceId);
  };

  // Financial Reporting
  const getRevenueReport = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= start && paymentDate <= end;
    });

    const totalRevenue = relevantPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    const paymentMethods = relevantPayments.reduce((acc, payment) => {
      const method = payment.method;
      acc[method] = (acc[method] || 0) + parseFloat(payment.amount);
      return acc;
    }, {});

    return {
      totalRevenue,
      paymentMethods,
      paymentCount: relevantPayments.length
    };
  };

  const getOutstandingInvoices = () => {
    return invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'canceled');
  };

  const getOverdueInvoices = () => {
    const today = new Date();
    return invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return inv.status !== 'paid' && inv.status !== 'canceled' && dueDate < today;
    });
  };

  const getCustomerBalance = (customerId) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
    return customerInvoices.reduce((sum, inv) => sum + parseFloat(inv.balancedue || 0), 0);
  };

  const value = {
    loading,
    error,
    customers,
    vehicles,
    services,
    invoices,
    payments,
    technicians,
    staffMembers,
    billingSettings,
    currentUser,
    login,
    logout,
    registerStaff,
    removeStaffMember,
    approveStaffMember,
    updateUserRole,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVehicle,
    updateVehicle,
    getCustomerVehicles,
    addService,
    updateServiceStatus,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getInvoicePayments,
    getOutstandingInvoices,
    getOverdueInvoices,
    getCustomerBalance,
    getRevenueReport,
    refreshData: fetchData
  };

  return (
    <GarageContext.Provider value={value}>
      {children}
    </GarageContext.Provider>
  );
};
