import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService, { handleApiError } from '../services/api.jsx';

const GarageContext = createContext();

export const useGarage = () => useContext(GarageContext);

export const GarageProvider = ({ children }) => {
  // --- Loading & Error State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Notification State ---
  const [notification, setNotification] = useState(null);

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
    balanceDue: parseFloat(inv.balanceDue) || 0,
    taxRate: parseFloat(inv.taxRate) || 0
  });

  const normalizePayment = (p) => ({
    ...p,
    amount: parseFloat(p.amount) || 0
  });

  const normalizeBillingSettings = (bs) => {
    if (!bs) return null;
    return {
      taxRate: parseFloat(bs.taxRate) || 0,
      invoicePrefix: bs.invoicePrefix || 'INV',
      nextInvoiceNumber: parseInt(bs.nextInvoiceNumber) || 1,
      paymentTerms: bs.paymentTerms || 'Net 30',
      companyInfo: {
        name: bs.companyName || '',
        email: bs.companyEmail || '',
        address: bs.companyAddress || '',
        city: bs.companyCity || '',
        phone: bs.companyPhone || ''
      }
    };
  };

  // --- Initial Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    setNotification(null); // Clear notifications on data refresh
    try {
      const fetchPromises = [


        apiService.customers.getAll(),
        apiService.vehicles.getAll(),
        apiService.services.getAll(),
        apiService.invoices.getAll(),
        apiService.payments.getAll(),
        apiService.technicians.getAll(),
        currentUser?.role === 'admin' ? apiService.users.getAll() : Promise.resolve({ data: [] }),
        apiService.billingSettings.getCurrent()
      ];

      const [
        custRes,
        vehRes,
        servRes,
        invRes,
        payRes,
        techRes,
        staffRes,
        billingRes
      ] = await Promise.all(fetchPromises);



      // Standardized response returns data inside 'data' field
      setCustomers(custRes.data);
      setVehicles(vehRes.data);
      setServices((servRes.data || []).map(normalizeService));
      setInvoices((invRes.data || []).map(normalizeInvoice));
      setPayments((payRes.data || []).map(normalizePayment));
      setTechnicians(techRes.data);
      setStaffMembers(staffRes.data);
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
      setNotification(null); // Clear any leftover notifications before login
      const response = await apiService.auth.login(email, password);
      // Interceptor has unwrapped the data field
      if (response.status_overall === 'success' || response.data.user) {
        const userData = response.data.user || response.data;
        setCurrentUser(userData);
        fetchData();
        return { success: true, user: userData };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      // Extract error message from backend response
      const errorResult = handleApiError(err);
      console.error('Login error:', errorResult);
      return errorResult;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setNotification(null);
  };

  const registerStaff = async (data) => {
    try {
      const response = await apiService.auth.register(data);
      return { 
        success: response.status_overall === 'success',
        message: response.message 
      };
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

  const deactivateStaffMember = async (id) => {
      try {
          await apiService.auth.deactivateUser(id);
          setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, is_active: false, is_approved: false } : s));
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

  const requestPasswordReset = async (email) => {
    try {
      const response = await apiService.auth.requestPasswordReset(email);
      return { success: true, message: response.message };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await apiService.auth.verifyOtp(email, otp);
      return { success: true, message: response.message };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const confirmPasswordReset = async (email, otp, password) => {
    try {
      const response = await apiService.auth.confirmPasswordReset(email, otp, password);
      return { success: true, message: response.message };
    } catch (err) {
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
      // Refresh all data to catch auto-generated invoices and paymants
      fetchData();
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateServiceStatus = async (id, status) => {
    try {
      await apiService.services.updateStatus(id, status);
      // Refresh all data to catch auto-generated invoice if marked as Completed
      fetchData();
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const response = await apiService.services.update(id, serviceData);
      // Refresh all data to catch synced invoices and payments
      fetchData();
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  // Invoice Operations
  const createInvoice = async (serviceId, invoiceData = {}) => {
    try {
      const response = await apiService.invoices.create({ serviceId, ...invoiceData });
      console.log('Invoice created - raw response:', response.data);
      const normalized = normalizeInvoice(response.data);
      console.log('Invoice created - normalized:', normalized);
      setInvoices(prev => [...prev, normalized]);
      // Refresh all data to ensure we get the auto-generated advance payment record
      fetchData();
      return normalized;
    } catch (err) {
      console.error('Invoice creation error:', handleApiError(err));
      return null;
    }
  };

  const updateInvoice = async (invoiceId, updates) => {
    if (!invoiceId) {
      console.error('Cannot update invoice: missing invoiceId');
      return { success: false, message: 'Invoice ID is required' };
    }
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
      const response = await apiService.payments.create({ invoiceId: invoiceId, ...paymentData });
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

  // Technician Operations
  const addTechnician = async (techData) => {
    try {
      const response = await apiService.technicians.create(techData);
      setTechnicians(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const updateTechnician = async (id, updates) => {
    try {
      const response = await apiService.technicians.update(id, updates);
      setTechnicians(prev => prev.map(t => t.id === id ? response.data : t));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err);
    }
  };

  const deleteTechnician = async (id) => {
    try {
      await apiService.technicians.delete(id);
      setTechnicians(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
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

    // Calculate average payment
    const averagePayment = relevantPayments.length > 0 ? totalRevenue / relevantPayments.length : 0;

    // Calculate revenue by service type
    const serviceRevenue = relevantPayments.reduce((acc, payment) => {
        const invoiceId = payment.invoiceId || payment.invoice_id;
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            const service = services.find(s => s.id === invoice.serviceId);
            const type = service?.type || 'Standard Service';
            acc[type] = (acc[type] || 0) + parseFloat(payment.amount);
        } else {
            acc['General'] = (acc['General'] || 0) + parseFloat(payment.amount);
        }
        return acc;
    }, {});

    return {
      totalRevenue,
      paymentMethods,
      paymentCount: relevantPayments.length,
      averagePayment,
      serviceRevenue
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

  const getCustomerOverdue = (customerId) => {
    const today = new Date();
    const customerInvoices = invoices.filter(inv => 
      inv.customerId === customerId && 
      inv.status !== 'paid' && 
      inv.status !== 'canceled' && 
      new Date(inv.dueDate) < today
    );
    return customerInvoices.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);
  };

  const getCustomerBalance = (customerId) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
    return customerInvoices.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);
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
    requestPasswordReset,
    verifyOtp,
    confirmPasswordReset,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVehicle,
    updateVehicle,
    getCustomerVehicles,
    addService,
    updateService,
    updateServiceStatus,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getInvoicePayments,
    getOutstandingInvoices,
    getOverdueInvoices,
    getCustomerBalance,
    getCustomerOverdue,
    getRevenueReport,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    deactivateStaffMember,
    refreshData: fetchData,
    // Notification functions
    notification,
    showNotification: (type, title, message) => setNotification({ type, title, message, isOpen: true }),
    showConfirmation: (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => 
      setNotification({ type: 'confirmation', title, message, isOpen: true, onConfirm, confirmText, cancelText }),
    closeNotification: () => setNotification(null)
  };

  return (
    <GarageContext.Provider value={value}>
      {children}
    </GarageContext.Provider>
  );
};
