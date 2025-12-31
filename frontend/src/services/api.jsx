import axios from 'axios';

// API Base URL - using environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For session authentication
});

// API Service Object
const apiService = {
    // Customer endpoints
    customers: {
        getAll: () => api.get('/customers/'),
        getById: (id) => api.get(`/customers/${id}/`),
        create: (data) => api.post('/customers/', data),
        update: (id, data) => api.put(`/customers/${id}/`, data),
        delete: (id) => api.delete(`/customers/${id}/`),
    },

    // Vehicle endpoints
    vehicles: {
        getAll: () => api.get('/vehicles/'),
        getById: (id) => api.get(`/vehicles/${id}/`),
        getByCustomer: (customerId) => api.get(`/vehicles/by_customer/?customer_id=${customerId}`),
        create: (data) => api.post('/vehicles/', data),
        update: (id, data) => api.put(`/vehicles/${id}/`, data),
        delete: (id) => api.delete(`/vehicles/${id}/`),
    },

    // Technician endpoints
    technicians: {
        getAll: () => api.get('/technicians/'),
        getById: (id) => api.get(`/technicians/${id}/`),
        create: (data) => api.post('/technicians/', data),
        update: (id, data) => api.put(`/technicians/${id}/`, data),
        delete: (id) => api.delete(`/technicians/${id}/`),
    },

    // Service endpoints
    services: {
        getAll: () => api.get('/services/'),
        getById: (id) => api.get(`/services/${id}/`),
        create: (data) => api.post('/services/', data),
        update: (id, data) => api.put(`/services/${id}/`, data),
        updateStatus: (id, status) => api.patch(`/services/${id}/update_status/`, { status }),
        delete: (id) => api.delete(`/services/${id}/`),
    },

    // Invoice endpoints
    invoices: {
        getAll: () => api.get('/invoices/'),
        getById: (id) => api.get(`/invoices/${id}/`),
        create: (data) => api.post('/invoices/', data),
        update: (id, data) => api.put(`/invoices/${id}/`, data),
        delete: (id) => api.delete(`/invoices/${id}/`),
    },

    // Payment endpoints
    payments: {
        getAll: () => api.get('/payments/'),
        getById: (id) => api.get(`/payments/${id}/`),
        getByInvoice: (invoiceId) => api.get(`/payments/by_invoice/?invoice_id=${invoiceId}`),
        create: (data) => api.post('/payments/', data),
        delete: (id) => api.delete(`/payments/${id}/`),
    },

    // User/Auth endpoints
    auth: {
        register: (data) => api.post('/users/register/', data),
        login: (email, password) => api.post('/users/login/', { email, password }),
        getPendingApprovals: () => api.get('/users/pending_approvals/'),
        approveUser: (userId, adminId) => api.post(`/users/${userId}/approve/`, { admin_id: adminId }),
        deactivateUser: (userId) => api.post(`/users/${userId}/deactivate/`),
        activateUser: (userId) => api.post(`/users/${userId}/activate/`),
    },

    // User management endpoints
    users: {
        getAll: () => api.get('/users/'),
        getById: (id) => api.get(`/users/${id}/`),
        update: (id, data) => api.patch(`/users/${id}/`, data),
        delete: (id) => api.delete(`/users/${id}/`),
    },

    // Billing settings endpoints
    billingSettings: {
        getCurrent: () => api.get('/billing-settings/current/'),
        update: (id, data) => api.put(`/billing-settings/${id}/`, data),
    },
};

// Error handler helper
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.data);
        return {
            success: false,
            message: error.response.data.message || 'An error occurred',
            errors: error.response.data,
        };
    } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', error.request);
        return {
            success: false,
            message: 'Network error. Please check your connection and ensure the backend server is running.',
        };
    } else {
        // Something else happened
        console.error('Error:', error.message);
        return {
            success: false,
            message: error.message,
        };
    }
};

export default apiService;
