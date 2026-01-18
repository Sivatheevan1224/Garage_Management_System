import axios from 'axios';

// API Base URL - using environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});


// Response interceptor to unwrap the standardized response
api.interceptors.response.use(
    (response) => {
        // If the response follows the { status, message, data } format, return the data
        if (response.data && response.data.status) {
            return {
                ...response,
                data: response.data.data,
                message: response.data.message, // Preserve message for feedback
                status_overall: response.data.status
            };
        }
        return response;
    },
    (error) => {
        // Extract more detailed error information
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            // If backend returns standardized error format
            if (errorData.error) {
                error.message = errorData.error;
            } else if (errorData.message) {
                error.message = errorData.message;
            }
            // Preserve validation errors
            if (errorData.errors) {
                error.validationErrors = errorData.errors;
            }
        }
        return Promise.reject(error);
    }
);


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
        getByCustomer: (customerId) => api.get(`/vehicles/?customer_id=${customerId}`),
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
        updateStatus: (id, status) => api.patch(`/services/${id}/status/`, { status }),
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
        getByInvoice: (invoiceId) => api.get(`/payments/?invoice_id=${invoiceId}`),
        create: (data) => api.post('/payments/', data),
        delete: (id) => api.delete(`/payments/${id}/`),
    },


    // User/Auth endpoints
    auth: {
        register: (data) => api.post('/accounts/register/', data),
        login: (email, password) => api.post('/accounts/login/', { email, password }),
        getCsrfToken: () => api.get('/accounts/get-csrf/'),
        getPendingApprovals: () => api.get('/accounts/pending-approvals/'),

        approveUser: (userId) => api.post(`/accounts/approve/${userId}/`),
        deactivateUser: (userId) => api.post(`/accounts/deactivate/${userId}/`),
        activateUser: (userId) => api.post(`/accounts/activate/${userId}/`),
    },


    // User management endpoints
    users: {
        getAll: () => api.get('/accounts/users/'),
        getById: (id) => api.get(`/accounts/users/${id}/`),
        update: (id, data) => api.patch(`/accounts/users/${id}/`, data),
        delete: (id) => api.delete(`/accounts/users/${id}/`),
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
        
        const errorData = error.response.data;
        let message = 'An error occurred';
        let errors = null;
        
        // Extract error message (try different formats)
        // Django error format: { status: 'error', message: 'Error', errors: '...' }
        if (typeof errorData.errors === 'string') {
            message = errorData.errors;  // This is where the actual message is
        } else if (errorData.error) {
            message = errorData.error;
        } else if (errorData.message && errorData.message !== 'Error') {
            message = errorData.message;
        } else if (typeof errorData === 'string') {
            message = errorData;
        }
        
        // Extract validation errors (when errors is an object)
        if (typeof errorData.errors === 'object' && errorData.errors !== null) {
            errors = errorData.errors;
        } else if (error.validationErrors) {
            errors = error.validationErrors;
        }
        
        return {
            success: false,
            message: message,
            errors: errors,
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
            message: error.message || 'An unexpected error occurred',
        };
    }
};

export default apiService;
