
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GarageContext = createContext();

export const useGarage = () => useContext(GarageContext);

export const GarageProvider = ({ children }) => {

  // --- Data State ---
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cust-001',
        name: 'John Anderson',
        email: 'john.anderson@email.com',
        phone: '(555) 123-4567',
        address: '123 Main Street, Springfield, IL 62701',
        createdAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 'cust-002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
        address: '456 Oak Avenue, Springfield, IL 62701',
        createdAt: '2025-02-10T14:30:00Z'
      },
      {
        id: 'cust-003',
        name: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '(555) 345-6789',
        address: '789 Pine Road, Springfield, IL 62701',
        createdAt: '2025-02-20T09:15:00Z'
      },
      {
        id: 'cust-004',
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '(555) 456-7890',
        address: '321 Elm Street, Springfield, IL 62701',
        createdAt: '2025-03-05T16:45:00Z'
      },
      {
        id: 'cust-005',
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        phone: '(555) 567-8901',
        address: '654 Maple Drive, Springfield, IL 62701',
        createdAt: '2025-03-12T11:20:00Z'
      }
    ];
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('vehicles');
    return saved ? JSON.parse(saved) : [
      {
        id: 'veh-001',
        customerId: 'cust-001',
        brand: 'Toyota',
        model: 'Camry',
        year: '2020',
        number: 'ABC-1234',
        color: 'Silver',
        mileage: 45000,
        createdAt: '2025-01-15T10:30:00Z'
      },
      {
        id: 'veh-002',
        customerId: 'cust-002',
        brand: 'Honda',
        model: 'Civic',
        year: '2019',
        number: 'DEF-5678',
        color: 'Blue',
        mileage: 52000,
        createdAt: '2025-02-10T15:00:00Z'
      },
      {
        id: 'veh-003',
        customerId: 'cust-003',
        brand: 'Ford',
        model: 'F-150',
        year: '2021',
        number: 'GHI-9012',
        color: 'Black',
        mileage: 38000,
        createdAt: '2025-02-20T09:45:00Z'
      },
      {
        id: 'veh-004',
        customerId: 'cust-004',
        brand: 'BMW',
        model: '328i',
        year: '2018',
        number: 'JKL-3456',
        color: 'White',
        mileage: 67000,
        createdAt: '2025-03-05T17:15:00Z'
      },
      {
        id: 'veh-005',
        customerId: 'cust-005',
        brand: 'Chevrolet',
        model: 'Malibu',
        year: '2020',
        number: 'MNO-7890',
        color: 'Red',
        mileage: 41000,
        createdAt: '2025-03-12T11:50:00Z'
      },
      {
        id: 'veh-006',
        customerId: 'cust-001',
        brand: 'Toyota',
        model: 'RAV4',
        year: '2022',
        number: 'PQR-1357',
        color: 'Gray',
        mileage: 22000,
        createdAt: '2025-04-01T13:30:00Z'
      }
    ];
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('services');
    return saved ? JSON.parse(saved) : [
      {
        id: 'srv-001',
        vehicleId: 'veh-001',
        type: 'Oil Change',
        description: 'Full synthetic oil change with filter replacement',
        cost: 85.00,
        date: '2025-12-15T09:00:00Z',
        status: 'Completed',
        technicianId: 't1',
        estimatedHours: 1
      },
      {
        id: 'srv-002',
        vehicleId: 'veh-002',
        type: 'Brake Service',
        description: 'Front brake pads replacement and rotor resurfacing',
        cost: 320.00,
        date: '2025-12-18T10:30:00Z',
        status: 'Completed',
        technicianId: 't2',
        estimatedHours: 3
      },
      {
        id: 'srv-003',
        vehicleId: 'veh-003',
        type: 'Engine Diagnostic',
        description: 'Computer diagnostic scan for check engine light',
        cost: 125.00,
        date: '2025-12-20T14:00:00Z',
        status: 'Completed',
        technicianId: 't1',
        estimatedHours: 2
      },
      {
        id: 'srv-004',
        vehicleId: 'veh-004',
        type: 'Transmission Service',
        description: 'Automatic transmission fluid change and filter replacement',
        cost: 180.00,
        date: '2025-12-22T11:15:00Z',
        status: 'Completed',
        technicianId: 't3',
        estimatedHours: 2.5
      },
      {
        id: 'srv-005',
        vehicleId: 'veh-005',
        type: 'Tire Rotation',
        description: 'Four-wheel tire rotation and pressure check',
        cost: 45.00,
        date: '2025-12-23T15:30:00Z',
        status: 'Completed',
        technicianId: 't3',
        estimatedHours: 0.5
      },
      {
        id: 'srv-006',
        vehicleId: 'veh-006',
        type: 'A/C Service',
        description: 'Air conditioning system inspection and refrigerant top-off',
        cost: 95.00,
        date: '2025-12-24T08:45:00Z',
        status: 'Completed',
        technicianId: 't2',
        estimatedHours: 1.5
      },
      {
        id: 'srv-007',
        vehicleId: 'veh-001',
        type: 'Battery Replacement',
        description: 'Replace old battery with new heavy-duty battery',
        cost: 145.00,
        date: '2025-12-26T10:00:00Z',
        status: 'Completed',
        technicianId: 't1',
        estimatedHours: 1
      },
      {
        id: 'srv-008',
        vehicleId: 'veh-002',
        type: 'Wheel Alignment',
        description: 'Four-wheel alignment and suspension check',
        cost: 89.99,
        date: '2025-12-27T13:20:00Z',
        status: 'In Progress',
        technicianId: 't2',
        estimatedHours: 2
      }
    ];
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [
      {
        id: 'inv-001',
        invoiceNumber: 'INV-1001',
        serviceId: 'srv-001',
        customerId: 'cust-001',
        vehicleId: 'veh-001',
        status: 'paid',
        dateCreated: '2025-12-15T09:30:00Z',
        dueDate: '2026-01-14T09:30:00Z',
        lineItems: [
          {
            id: 'li-001',
            description: 'Oil Change Service',
            detail: 'Full synthetic oil change with premium filter',
            quantity: 1,
            unitPrice: 75.00,
            total: 75.00,
            type: 'service'
          },
          {
            id: 'li-002',
            description: 'Shop Supplies',
            detail: 'Disposal fees and miscellaneous supplies',
            quantity: 1,
            unitPrice: 10.00,
            total: 10.00,
            type: 'parts'
          }
        ],
        subtotal: 85.00,
        taxRate: 0.10,
        taxAmount: 8.50,
        discount: 0,
        total: 93.50,
        paidAmount: 93.50,
        balancedue: 0,
        paymentTerms: 'Net 30',
        notes: 'Thank you for choosing ProGarage for your vehicle maintenance needs.'
      },
      {
        id: 'inv-002',
        invoiceNumber: 'INV-1002',
        serviceId: 'srv-002',
        customerId: 'cust-002',
        vehicleId: 'veh-002',
        status: 'sent',
        dateCreated: '2025-12-18T11:00:00Z',
        dueDate: '2026-01-17T11:00:00Z',
        lineItems: [
          {
            id: 'li-003',
            description: 'Brake Pad Replacement',
            detail: 'Premium ceramic brake pads - front axle',
            quantity: 1,
            unitPrice: 180.00,
            total: 180.00,
            type: 'parts'
          },
          {
            id: 'li-004',
            description: 'Labor - Brake Service',
            detail: 'Front brake service including rotor resurfacing',
            quantity: 2.5,
            unitPrice: 95.00,
            total: 237.50,
            type: 'labor'
          },
          {
            id: 'li-005',
            description: 'Brake Fluid Top-off',
            detail: 'DOT 3 brake fluid replacement',
            quantity: 1,
            unitPrice: 15.00,
            total: 15.00,
            type: 'parts'
          }
        ],
        subtotal: 432.50,
        taxRate: 0.10,
        taxAmount: 43.25,
        discount: 20.00,
        total: 455.75,
        paidAmount: 0,
        balancedue: 455.75,
        paymentTerms: 'Net 30',
        notes: 'Brake system inspection shows rotors in good condition after resurfacing.'
      },
      {
        id: 'inv-003',
        invoiceNumber: 'INV-1003',
        serviceId: 'srv-003',
        customerId: 'cust-003',
        vehicleId: 'veh-003',
        status: 'paid',
        dateCreated: '2025-12-20T14:30:00Z',
        dueDate: '2026-01-19T14:30:00Z',
        lineItems: [
          {
            id: 'li-006',
            description: 'Engine Diagnostic Scan',
            detail: 'Comprehensive computer diagnostic with report',
            quantity: 1,
            unitPrice: 125.00,
            total: 125.00,
            type: 'service'
          }
        ],
        subtotal: 125.00,
        taxRate: 0.10,
        taxAmount: 12.50,
        discount: 0,
        total: 137.50,
        paidAmount: 137.50,
        balancedue: 0,
        paymentTerms: 'Net 30',
        notes: 'Diagnostic revealed minor oxygen sensor issue. Recommend replacement in next service.'
      },
      {
        id: 'inv-004',
        invoiceNumber: 'INV-1004',
        serviceId: 'srv-004',
        customerId: 'cust-004',
        vehicleId: 'veh-004',
        status: 'overdue',
        dateCreated: '2025-12-22T11:45:00Z',
        dueDate: '2025-12-29T11:45:00Z',
        lineItems: [
          {
            id: 'li-007',
            description: 'Transmission Service',
            detail: 'Automatic transmission fluid and filter replacement',
            quantity: 1,
            unitPrice: 180.00,
            total: 180.00,
            type: 'service'
          }
        ],
        subtotal: 180.00,
        taxRate: 0.10,
        taxAmount: 18.00,
        discount: 0,
        total: 198.00,
        paidAmount: 0,
        balancedue: 198.00,
        paymentTerms: 'Net 7',
        notes: 'Service includes 12-month/12,000-mile warranty on transmission work.'
      },
      {
        id: 'inv-005',
        invoiceNumber: 'INV-1005',
        serviceId: 'srv-005',
        customerId: 'cust-005',
        vehicleId: 'veh-005',
        status: 'paid',
        dateCreated: '2025-12-23T16:00:00Z',
        dueDate: '2026-01-22T16:00:00Z',
        lineItems: [
          {
            id: 'li-008',
            description: 'Tire Rotation Service',
            detail: 'Four-wheel tire rotation and pressure adjustment',
            quantity: 1,
            unitPrice: 45.00,
            total: 45.00,
            type: 'service'
          }
        ],
        subtotal: 45.00,
        taxRate: 0.10,
        taxAmount: 4.50,
        discount: 5.00,
        total: 44.50,
        paidAmount: 22.25,
        balancedue: 22.25,
        paymentTerms: 'Net 30',
        notes: 'Customer paid 50% upfront. Balance due on completion.'
      },
      {
        id: 'inv-006',
        invoiceNumber: 'INV-1006',
        serviceId: 'srv-006',
        customerId: 'cust-001',
        vehicleId: 'veh-006',
        status: 'draft',
        dateCreated: '2025-12-24T09:15:00Z',
        dueDate: '2026-01-23T09:15:00Z',
        lineItems: [
          {
            id: 'li-009',
            description: 'A/C System Service',
            detail: 'Air conditioning inspection and refrigerant service',
            quantity: 1,
            unitPrice: 95.00,
            total: 95.00,
            type: 'service'
          }
        ],
        subtotal: 95.00,
        taxRate: 0.10,
        taxAmount: 9.50,
        discount: 0,
        total: 104.50,
        paidAmount: 0,
        balancedue: 104.50,
        paymentTerms: 'Net 30',
        notes: 'A/C system operating within normal parameters. No refrigerant leak detected.'
      },
      {
        id: 'inv-007',
        invoiceNumber: 'INV-1007',
        serviceId: 'srv-007',
        customerId: 'cust-001',
        vehicleId: 'veh-001',
        status: 'sent',
        dateCreated: '2025-12-26T10:30:00Z',
        dueDate: '2026-01-25T10:30:00Z',
        lineItems: [
          {
            id: 'li-010',
            description: 'Battery Replacement',
            detail: 'Heavy-duty 24F battery with 3-year warranty',
            quantity: 1,
            unitPrice: 120.00,
            total: 120.00,
            type: 'parts'
          },
          {
            id: 'li-011',
            description: 'Installation Labor',
            detail: 'Battery installation and terminal cleaning',
            quantity: 0.5,
            unitPrice: 95.00,
            total: 47.50,
            type: 'labor'
          },
          {
            id: 'li-012',
            description: 'Battery Disposal Fee',
            detail: 'Environmental disposal fee for old battery',
            quantity: 1,
            unitPrice: 5.00,
            total: 5.00,
            type: 'parts'
          }
        ],
        subtotal: 172.50,
        taxRate: 0.10,
        taxAmount: 17.25,
        discount: 0,
        total: 189.75,
        paidAmount: 0,
        balancedue: 189.75,
        paymentTerms: 'Net 30',
        notes: 'Old battery tested at 8.2V under load. Replacement recommended for reliability.'
      }
    ];
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pay-001',
        invoiceId: 'inv-001',
        amount: 93.50,
        method: 'card',
        date: '2025-12-15T10:15:00Z',
        reference: 'TXN-789123456',
        notes: 'Visa ending in 4567 - Approved'
      },
      {
        id: 'pay-002',
        invoiceId: 'inv-003',
        amount: 137.50,
        method: 'cash',
        date: '2025-12-20T15:00:00Z',
        reference: 'CASH-001',
        notes: 'Paid in full at service completion'
      },
      {
        id: 'pay-003',
        invoiceId: 'inv-005',
        amount: 22.25,
        method: 'check',
        date: '2025-12-23T16:30:00Z',
        reference: 'CHK-2045',
        notes: 'Check #2045 from First National Bank'
      },
      {
        id: 'pay-004',
        invoiceId: 'inv-001',
        amount: 50.00,
        method: 'cash',
        date: '2025-12-10T09:00:00Z',
        reference: 'CASH-002',
        notes: 'Partial payment - deposit for service'
      },
      {
        id: 'pay-005',
        invoiceId: 'inv-003',
        amount: 75.00,
        method: 'bank_transfer',
        date: '2025-12-18T11:30:00Z',
        reference: 'ACH-112233',
        notes: 'Wire transfer from Business Account'
      },
      {
        id: 'pay-006',
        invoiceId: 'inv-008',
        amount: 98.99,
        method: 'card',
        date: '2025-12-27T14:15:00Z',
        reference: 'TXN-998877',
        notes: 'MasterCard ending in 9876 - Full payment'
      },
      {
        id: 'pay-007',
        invoiceId: 'inv-005',
        amount: 22.25,
        method: 'cash',
        date: '2025-12-28T09:30:00Z',
        reference: 'CASH-003',
        notes: 'Final balance payment - cash'
      }
    ];
  });

  const [billingSettings, setBillingSettings] = useState(() => {
    const saved = localStorage.getItem('billingSettings');
    return saved ? JSON.parse(saved) : {
      taxRate: 0.10, // 10% default tax
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1009,
      paymentTerms: 'Net 30',
      companyInfo: {
        name: 'ProGarage',
        address: '123 Auto Lane',
        city: 'Mechanic City, MC 90210',
        phone: '(555) 123-4567',
        email: 'billing@progarage.com'
      }
    };
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
  useEffect(() => { localStorage.setItem('payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('billingSettings', JSON.stringify(billingSettings)); }, [billingSettings]);
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

  // Invoice Management
  const generateInvoiceNumber = () => {
    const newNumber = billingSettings.nextInvoiceNumber;
    setBillingSettings(prev => ({
      ...prev,
      nextInvoiceNumber: prev.nextInvoiceNumber + 1
    }));
    return `${billingSettings.invoicePrefix}-${newNumber.toString().padStart(4, '0')}`;
  };

  const createInvoice = (serviceId, invoiceData = {}) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return null;

    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    const customer = customers.find(c => c.id === vehicle?.customerId);
    
    const subtotal = invoiceData.subtotal || service.cost || 0;
    const taxAmount = subtotal * billingSettings.taxRate;
    const total = subtotal + taxAmount - (invoiceData.discount || 0);

    const invoice = {
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      serviceId,
      customerId: customer?.id,
      vehicleId: vehicle?.id,
      status: 'draft', // draft, sent, paid, overdue, canceled
      dateCreated: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      lineItems: invoiceData.lineItems || [
        {
          id: uuidv4(),
          description: service.type,
          detail: service.description,
          quantity: 1,
          unitPrice: service.cost || 0,
          total: service.cost || 0,
          type: 'service' // service, parts, labor
        }
      ],
      subtotal,
      taxRate: billingSettings.taxRate,
      taxAmount,
      discount: invoiceData.discount || 0,
      total,
      paidAmount: 0,
      balancedue: total,
      paymentTerms: billingSettings.paymentTerms,
      notes: invoiceData.notes || ''
    };

    setInvoices(prev => [...prev, invoice]);
    return invoice;
  };

  const updateInvoice = (invoiceId, updates) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const updatedInvoice = { ...invoice, ...updates };
        // Recalculate totals if line items changed
        if (updates.lineItems) {
          const subtotal = updates.lineItems.reduce((sum, item) => sum + item.total, 0);
          const taxAmount = subtotal * updatedInvoice.taxRate;
          const total = subtotal + taxAmount - (updatedInvoice.discount || 0);
          const balancedue = total - updatedInvoice.paidAmount;
          return { ...updatedInvoice, subtotal, taxAmount, total, balancedue };
        }
        return updatedInvoice;
      }
      return invoice;
    }));
  };

  const deleteInvoice = (invoiceId) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
    setPayments(prev => prev.filter(payment => payment.invoiceId !== invoiceId));
  };

  // Payment Management
  const recordPayment = (invoiceId, paymentData) => {
    const payment = {
      id: uuidv4(),
      invoiceId,
      amount: paymentData.amount,
      method: paymentData.method, // cash, card, check, bank_transfer
      date: paymentData.date || new Date().toISOString(),
      reference: paymentData.reference || '',
      notes: paymentData.notes || ''
    };

    setPayments(prev => [...prev, payment]);

    // Update invoice paid amount and status
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const newPaidAmount = invoice.paidAmount + payment.amount;
        const balancedue = invoice.total - newPaidAmount;
        const status = balancedue <= 0 ? 'paid' : invoice.status;
        return { ...invoice, paidAmount: newPaidAmount, balancedue, status };
      }
      return invoice;
    }));

    return payment;
  };

  const getInvoicePayments = (invoiceId) => {
    return payments.filter(payment => payment.invoiceId === invoiceId);
  };

  // Financial Reporting
  const getRevenueReport = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= start && paymentDate <= end;
    });

    const totalRevenue = relevantPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const paymentMethods = relevantPayments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      return acc;
    }, {});

    const serviceRevenue = relevantPayments.reduce((acc, payment) => {
      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
      if (invoice) {
        const service = services.find(s => s.id === invoice.serviceId);
        if (service) {
          acc[service.type] = (acc[service.type] || 0) + payment.amount;
        }
      }
      return acc;
    }, {});

    return {
      totalRevenue,
      paymentCount: relevantPayments.length,
      averagePayment: relevantPayments.length > 0 ? totalRevenue / relevantPayments.length : 0,
      paymentMethods,
      serviceRevenue
    };
  };

  const getOutstandingInvoices = () => {
    return invoices.filter(invoice => invoice.balancedue > 0 && invoice.status !== 'canceled');
  };

  const getOverdueInvoices = () => {
    const now = new Date();
    return invoices.filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      return invoice.balancedue > 0 && dueDate < now && invoice.status !== 'canceled';
    });
  };

  // Customer Account Management
  const getCustomerBalance = (customerId) => {
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);
    return customerInvoices.reduce((sum, invoice) => sum + invoice.balancedue, 0);
  };

  const getCustomerPaymentHistory = (customerId) => {
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);
    const customerPayments = [];
    
    customerInvoices.forEach(invoice => {
      const invoicePayments = payments.filter(payment => payment.invoiceId === invoice.id);
      invoicePayments.forEach(payment => {
        customerPayments.push({ ...payment, invoiceNumber: invoice.invoiceNumber });
      });
    });
    
    return customerPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const generateCustomerStatement = (customerId, startDate, endDate) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const customerInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateCreated);
      return invoice.customerId === customerId && invoiceDate >= start && invoiceDate <= end;
    });

    const customerPayments = getCustomerPaymentHistory(customerId).filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= start && paymentDate <= end;
    });

    const totalInvoiced = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = getCustomerBalance(customerId);

    return {
      customer,
      period: { startDate, endDate },
      invoices: customerInvoices,
      payments: customerPayments,
      totals: { totalInvoiced, totalPaid, balance }
    };
  };

  // Billing Settings
  const updateBillingSettings = (settings) => {
    setBillingSettings(prev => ({ ...prev, ...settings }));
  };

  // Billing
  const value = {
    customers, addCustomer, updateCustomer, deleteCustomer,
    vehicles, addVehicle, updateVehicle, getCustomerVehicles,
    services, addService, updateServiceStatus,
    invoices, createInvoice, updateInvoice, deleteInvoice,
    payments, recordPayment, getInvoicePayments,
    billingSettings, updateBillingSettings,
    getRevenueReport, getOutstandingInvoices, getOverdueInvoices,
    getCustomerBalance, getCustomerPaymentHistory, generateCustomerStatement,
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
