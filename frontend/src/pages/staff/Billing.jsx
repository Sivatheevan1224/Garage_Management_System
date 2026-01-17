
import React, { useEffect, useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { useLocation } from 'react-router-dom';
import NotificationModal from '../../components/NotificationModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, Printer, FileText, Plus, Edit2, Trash2, Eye, DollarSign,
  Calendar, CreditCard, Receipt, TrendingUp, AlertCircle, Search,
  Filter, RefreshCw, Settings, Users, BarChart3, PieChart, Mail,
  Clock, CheckCircle, XCircle, Archive, Calculator
} from 'lucide-react';

const Billing = () => {
    const { 
      services, vehicles, customers, invoices, payments,
      createInvoice, updateInvoice, deleteInvoice, recordPayment,
      getInvoicePayments, getRevenueReport, getOutstandingInvoices,
      getOverdueInvoices, getCustomerBalance, billingSettings,
      notification, closeNotification, showNotification, showConfirmation
    } = useGarage();
    
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('invoices');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showCreateInvoice, setShowCreateInvoice] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Auto-select if navigated from ServiceManagement
    useEffect(() => {
        const autoCreate = async () => {
            if (location.state?.serviceId) {
                const service = services.find(s => s.id === location.state.serviceId);
                if (service && service.status === 'Completed') {
                    // Check if invoice already exists for this service
                    const existingInvoice = invoices.find(inv => inv.serviceId === service.id);
                    if (existingInvoice) {
                        setSelectedInvoice(existingInvoice);
                    } else {
                        // Create invoice for completed service
                        try {
                            const newInvoice = await createInvoice(service.id);
                            if (newInvoice) {
                                setSelectedInvoice(newInvoice);
                            }
                        } catch (err) {
                            console.error('Auto-create invoice failed:', err);
                        }
                    }
                }
            }
        };
        autoCreate();
    }, [location.state, services, invoices, createInvoice]);

    // Filter invoices based on search and status
    const filteredInvoices = invoices.filter(invoice => {
        const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
        const customer = customers.find(c => c.id === invoice.customerId);
        
        const matchesSearch = !searchTerm || 
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle?.number.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    const completedServices = services.filter(s => 
        s.status === 'Completed' && !invoices.find(inv => inv.serviceId === s.id)
    );

    const outstandingInvoices = getOutstandingInvoices();
    const overdueInvoices = getOverdueInvoices();
    
    // Calculate summary stats
    const totalRevenue = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balancedue) || 0), 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balancedue) || 0), 0);

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit2 },
            sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Mail },
            paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
            canceled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle }
        };
        
        const config = statusConfig[status] || statusConfig.draft;
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <IconComponent size={12} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setShowReportsModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        >
                            <BarChart3 size={16} />
                            <span>Reports</span>
                        </button>
                        <button 
                            onClick={() => setShowCreateInvoice(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                        >
                            <Plus size={16} />
                            <span>New Invoice</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-800">LKR {totalRevenue.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Outstanding</p>
                                <p className="text-2xl font-bold text-blue-800">LKR {totalOutstanding.toFixed(2)}</p>
                            </div>
                            <Clock className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Overdue</p>
                                <p className="text-2xl font-bold text-red-800">LKR {totalOverdue.toFixed(2)}</p>
                            </div>
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Invoices</p>
                                <p className="text-2xl font-bold text-purple-800">{invoices.length}</p>
                            </div>
                            <FileText className="text-purple-500" size={24} />
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-1 mb-6">
                    {[
                        { id: 'invoices', label: 'Invoices', icon: FileText },
                        { id: 'payments', label: 'Payments', icon: CreditCard },
                        { id: 'customers', label: 'Customer Accounts', icon: Users },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                {activeTab === 'invoices' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {activeTab === 'invoices' && (
                    <InvoicesTab 
                        filteredInvoices={filteredInvoices}
                        selectedInvoice={selectedInvoice}
                        setSelectedInvoice={setSelectedInvoice}
                        vehicles={vehicles}
                        customers={customers}
                        payments={payments}
                        getInvoicePayments={getInvoicePayments}
                        setShowPaymentModal={setShowPaymentModal}
                        updateInvoice={updateInvoice}
                        deleteInvoice={deleteInvoice}
                        StatusBadge={StatusBadge}
                        showNotification={showNotification}
                        showConfirmation={showConfirmation}
                        closeNotification={closeNotification}
                    />
                )}

                {activeTab === 'payments' && (
                    <PaymentsTab payments={payments} invoices={invoices} customers={customers} />
                )}

                {activeTab === 'customers' && (
                    <CustomersTab customers={customers} getCustomerBalance={getCustomerBalance} />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab billingSettings={billingSettings} />
                )}
            </div>

            {/* Modals */}
            {showCreateInvoice && (
                <CreateInvoiceModal 
                    isOpen={showCreateInvoice}
                    onClose={() => setShowCreateInvoice(false)}
                    completedServices={completedServices}
                    createInvoice={createInvoice}
                    setSelectedInvoice={setSelectedInvoice}
                    showNotification={showNotification}
                />
            )}

            {showPaymentModal && selectedInvoice && (
                <PaymentModal 
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    invoice={selectedInvoice}
                    recordPayment={recordPayment}
                    showNotification={showNotification}
                />
            )}

            {showReportsModal && (
                <ReportsModal 
                    isOpen={showReportsModal}
                    onClose={() => setShowReportsModal(false)}
                    getRevenueReport={getRevenueReport}
                />
            )}

            {/* Notification Modal */}
            {notification && (
                <NotificationModal
                    isOpen={notification.isOpen}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={closeNotification}
                    onConfirm={notification.onConfirm}
                    confirmText={notification.confirmText}
                    cancelText={notification.cancelText}
                    isConfirmation={notification.type === 'confirmation'}
                />
            )}
        </div>
    );
};

// Invoices Tab Component
const InvoicesTab = ({ 
    filteredInvoices, selectedInvoice, setSelectedInvoice, vehicles, customers, 
    payments, getInvoicePayments, setShowPaymentModal, updateInvoice, deleteInvoice, StatusBadge,
    showNotification, showConfirmation, closeNotification
}) => {
    return (
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Invoice List */}
            <div className="w-full lg:w-1/3 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 flex flex-col max-h-96 lg:max-h-none">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="font-bold text-gray-900">Invoices ({filteredInvoices.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredInvoices.map(invoice => {
                        const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                        const customer = customers.find(c => c.id === invoice.customerId);
                        const isSelected = selectedInvoice?.id === invoice.id;
                        const dueDate = new Date(invoice.dueDate);
                        const isOverdue = invoice.balancedue > 0 && dueDate < new Date();
                        
                        return (
                            <div 
                                key={invoice.id} 
                                onClick={() => setSelectedInvoice(invoice)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                                    isSelected 
                                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-blue-600 font-bold">
                                        {invoice.invoiceNumber}
                                    </span>
                                    <StatusBadge status={isOverdue && invoice.status !== 'paid' ? 'overdue' : invoice.status} />
                                </div>
                                <p className="text-sm font-medium text-foreground">{customer?.name}</p>
                                <p className="text-xs text-muted-foreground">{vehicle?.number}</p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                        Due: {dueDate.toLocaleDateString()}
                                    </span>
                                    <span className="font-mono text-sm font-bold text-gray-900">
                                        LKR {invoice.balancedue.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {filteredInvoices.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No invoices found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Details */}
            <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col min-h-0">
                {selectedInvoice ? (
                    <InvoiceDetailView 
                        invoice={selectedInvoice}
                        vehicles={vehicles}
                        customers={customers}
                        payments={getInvoicePayments(selectedInvoice.id)}
                        setShowPaymentModal={setShowPaymentModal}
                        updateInvoice={updateInvoice}
                        deleteInvoice={deleteInvoice}
                        showNotification={showNotification}
                        showConfirmation={showConfirmation}
                        closeNotification={closeNotification}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>Select an invoice to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Invoice Detail View Component
const InvoiceDetailView = ({ invoice, vehicles, customers, payments, setShowPaymentModal, updateInvoice, deleteInvoice, showNotification, showConfirmation, closeNotification }) => {
    const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
    const customer = customers.find(c => c.id === invoice.customerId);
    const [isEditing, setIsEditing] = useState(false);
    
    const handleStatusUpdate = async (newStatus) => {
        if (!invoice?.id) {
            console.error('Cannot update invoice: missing id', invoice);
            showNotification('error', 'Error', 'Cannot update invoice: missing ID');
            return;
        }
        try {
            await updateInvoice(invoice.id, { status: newStatus });
            showNotification('success', 'Success', 'Invoice status updated successfully!');
        } catch (err) {
            showNotification('error', 'Error', 'Failed to update invoice status.');
        }
    };

    const handleDelete = () => {
        showConfirmation('Delete Invoice', 'Are you sure you want to delete this invoice? This action cannot be undone.', async () => {
            try {
                await deleteInvoice(invoice.id);
                closeNotification();
                showNotification('success', 'Deleted', 'Invoice deleted successfully!');
                // setSelectedInvoice(null); // This is handled by parent usually but good to keep in mind
            } catch (err) {
                closeNotification();
                showNotification('error', 'Error', 'Failed to delete invoice.');
            }
        }, 'Delete', 'Cancel');
    };

    const handlePrint = () => {
        // Get the invoice content
        const printContents = document.querySelector('.invoice-content');
        if (!printContents) {
            showNotification('error', 'Error', 'Invoice content not found');
            return;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    @page { 
                        size: A4; 
                        margin: 15mm;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 11px;
                        line-height: 1.4;
                        color: #333;
                    }
                    .invoice-container { max-width: 100%; }
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 15px; 
                        border-bottom: 2px solid #1e40af; 
                        padding-bottom: 10px; 
                    }
                    .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 3px; }
                    .header .invoice-number { font-size: 12px; color: #666; }
                    .header .company-info { text-align: right; }
                    .header .company-info h2 { color: #1e40af; font-size: 16px; margin-bottom: 3px; }
                    .header .company-info p { font-size: 10px; line-height: 1.3; }
                    .bill-vehicle-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                        margin: 15px 0; 
                    }
                    .section-title { 
                        font-size: 9px; 
                        font-weight: bold; 
                        color: #666; 
                        text-transform: uppercase; 
                        letter-spacing: 0.5px; 
                        margin-bottom: 5px; 
                    }
                    .section-content p { font-size: 11px; line-height: 1.4; margin: 2px 0; }
                    .section-content .name { font-weight: bold; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { 
                        background: #1e40af; 
                        color: white; 
                        padding: 6px 8px; 
                        text-align: left; 
                        font-size: 10px; 
                        font-weight: bold;
                    }
                    td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
                    .item-description { font-weight: 600; margin-bottom: 2px; }
                    .item-detail { color: #666; font-size: 9px; }
                    .totals-section { 
                        display: flex; 
                        justify-content: flex-end; 
                        margin-top: 15px; 
                    }
                    .totals-table { width: 250px; }
                    .totals-table td { 
                        padding: 4px 8px; 
                        font-size: 10px;
                        border-bottom: 1px solid #e5e7eb; 
                    }
                    .totals-table .total-row td { 
                        font-size: 13px; 
                        font-weight: bold; 
                        background: #f3f4f6; 
                        padding: 6px 8px;
                        border-top: 2px solid #1e40af;
                    }
                    .totals-table .balance-row td { 
                        font-size: 12px; 
                        font-weight: bold; 
                        padding: 5px 8px;
                    }
                    .payment-history { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                    }
                    .payment-history h3 { font-size: 11px; margin-bottom: 8px; }
                    .payment-item { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 4px 8px; 
                        background: #f0fdf4; 
                        margin-bottom: 3px; 
                        border-radius: 3px;
                        font-size: 10px;
                    }
                    .notes-section { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                    }
                    .notes-section h3 { font-size: 11px; margin-bottom: 5px; }
                    .notes-section p { font-size: 10px; color: #666; }
                    .footer { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                        text-align: center; 
                    }
                    .footer p { font-size: 9px; color: #666; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div>
                            <h1>INVOICE</h1>
                            <p class="invoice-number">#${invoice.invoiceNumber}</p>
                            <p style="font-size: 9px; color: #999; margin-top: 2px;">Created: ${new Date(invoice.dateCreated).toLocaleDateString()}</p>
                        </div>
                        <div class="company-info">
                            <h2>ProGarage</h2>
                            <p>123 Auto Lane</p>
                            <p>Mechanic City, MC 90210</p>
                            <p>(555) 123-4567</p>
                        </div>
                    </div>
                    
                    <div class="bill-vehicle-grid">
                        <div>
                            <div class="section-title">Bill To</div>
                            <div class="section-content">
                                <p class="name">${customer?.name || 'N/A'}</p>
                                <p>${customer?.email || ''}</p>
                                <p>${customer?.phone || ''}</p>
                                <p>${customer?.address || ''}</p>
                            </div>
                        </div>
                        <div>
                            <div class="section-title">Vehicle Information</div>
                            <div class="section-content">
                                <p class="name">${vehicle?.brand || ''} ${vehicle?.model || ''}</p>
                                <p style="font-family: monospace;">${vehicle?.number || ''}</p>
                                <p>${vehicle?.year || ''}</p>
                            </div>
                            <div style="margin-top: 10px;">
                                <div class="section-title">Payment Terms</div>
                                <div class="section-content">
                                    <p>${invoice.paymentTerms || 'Net 30'}</p>
                                    <p style="color: #666;">Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">Description</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 20%; text-align: right;">Rate</th>
                                <th style="width: 20%; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.lineItems?.map(item => `
                                <tr>
                                    <td>
                                        <div class="item-description">${item.description}</div>
                                        ${item.detail ? `<div class="item-detail">${item.detail}</div>` : ''}
                                    </td>
                                    <td style="text-align: center; font-family: monospace;">${item.quantity}</td>
                                    <td style="text-align: right; font-family: monospace;">LKR ${item.unitPrice.toFixed(2)}</td>
                                    <td style="text-align: right; font-family: monospace; font-weight: bold;">LKR ${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No items</td></tr>'}
                        </tbody>
                    </table>
                    
                    <div class="totals-section">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax (${(invoice.taxRate * 100).toFixed(1)}%):</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.taxAmount.toFixed(2)}</td>
                            </tr>
                            ${invoice.discount > 0 ? `
                            <tr>
                                <td>Discount:</td>
                                <td style="text-align: right; font-family: monospace; color: #dc2626;">-LKR ${invoice.discount.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr class="total-row">
                                <td>Total:</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Paid:</td>
                                <td style="text-align: right; font-family: monospace; color: #16a34a;">LKR ${invoice.paidAmount.toFixed(2)}</td>
                            </tr>
                            <tr class="balance-row">
                                <td>Balance Due:</td>
                                <td style="text-align: right; font-family: monospace; color: ${invoice.balancedue > 0 ? '#dc2626' : '#16a34a'};">
                                    LKR ${invoice.balancedue.toFixed(2)}
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    ${payments.length > 0 ? `
                    <div class="payment-history">
                        <h3>Payment History</h3>
                        ${payments.map(payment => `
                            <div class="payment-item">
                                <div>
                                    <span style="font-weight: 600; color: #15803d;">
                                        ${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                    </span>
                                    ${payment.reference ? `<span style="color: #16a34a;"> #${payment.reference}</span>` : ''}
                                    <span style="font-size: 9px; color: #666; display: block;">
                                        ${new Date(payment.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <span style="font-family: monospace; font-weight: bold; color: #15803d;">
                                    LKR ${payment.amount.toFixed(2)}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${invoice.notes ? `
                    <div class="notes-section">
                        <h3>Notes</h3>
                        <p>${invoice.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p style="font-weight: 600; margin-bottom: 2px;">Thank you for choosing ProGarage!</p>
                        <p>Questions? Contact us at billing@progarage.com</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadPDF_OLD = () => {
        // Get the invoice content
        const printContents = document.querySelector('.invoice-content');
        if (!printContents) {
            showNotification('error', 'Error', 'Invoice content not found');
            return;
        }

        // Create a new window for PDF generation with the same content as print
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    @page { 
                        size: A4; 
                        margin: 15mm;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 11px;
                        line-height: 1.4;
                        color: #333;
                    }
                    .invoice-container { max-width: 100%; }
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 15px; 
                        border-bottom: 2px solid #1e40af; 
                        padding-bottom: 10px; 
                    }
                    .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 3px; }
                    .header .invoice-number { font-size: 12px; color: #666; }
                    .header .company-info { text-align: right; }
                    .header .company-info h2 { color: #1e40af; font-size: 16px; margin-bottom: 3px; }
                    .header .company-info p { font-size: 10px; line-height: 1.3; }
                    .bill-vehicle-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                        margin: 15px 0; 
                    }
                    .section-title { 
                        font-size: 9px; 
                        font-weight: bold; 
                        color: #666; 
                        text-transform: uppercase; 
                        letter-spacing: 0.5px; 
                        margin-bottom: 5px; 
                    }
                    .section-content p { font-size: 11px; line-height: 1.4; margin: 2px 0; }
                    .section-content .name { font-weight: bold; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { 
                        background: #1e40af; 
                        color: white; 
                        padding: 6px 8px; 
                        text-align: left; 
                        font-size: 10px; 
                        font-weight: bold;
                    }
                    td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
                    .item-description { font-weight: 600; margin-bottom: 2px; }
                    .item-detail { color: #666; font-size: 9px; }
                    .totals-section { 
                        display: flex; 
                        justify-content: flex-end; 
                        margin-top: 15px; 
                    }
                    .totals-table { width: 250px; }
                    .totals-table td { 
                        padding: 4px 8px; 
                        font-size: 10px;
                        border-bottom: 1px solid #e5e7eb; 
                    }
                    .totals-table .total-row td { 
                        font-size: 13px; 
                        font-weight: bold; 
                        background: #f3f4f6; 
                        padding: 6px 8px;
                        border-top: 2px solid #1e40af;
                    }
                    .totals-table .balance-row td { 
                        font-size: 12px; 
                        font-weight: bold; 
                        padding: 5px 8px;
                    }
                    .payment-history { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                    }
                    .payment-history h3 { font-size: 11px; margin-bottom: 8px; }
                    .payment-item { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 4px 8px; 
                        background: #f0fdf4; 
                        margin-bottom: 3px; 
                        border-radius: 3px;
                        font-size: 10px;
                    }
                    .notes-section { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                    }
                    .notes-section h3 { font-size: 11px; margin-bottom: 5px; }
                    .notes-section p { font-size: 10px; color: #666; }
                    .footer { 
                        margin-top: 15px; 
                        padding-top: 10px; 
                        border-top: 1px solid #e5e7eb; 
                        text-align: center; 
                    }
                    .footer p { font-size: 9px; color: #666; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div>
                            <h1>INVOICE</h1>
                            <p class="invoice-number">#${invoice.invoiceNumber}</p>
                            <p style="font-size: 9px; color: #999; margin-top: 2px;">Created: ${new Date(invoice.dateCreated).toLocaleDateString()}</p>
                        </div>
                        <div class="company-info">
                            <h2>ProGarage</h2>
                            <p>123 Auto Lane</p>
                            <p>Mechanic City, MC 90210</p>
                            <p>(555) 123-4567</p>
                        </div>
                    </div>
                    
                    <div class="bill-vehicle-grid">
                        <div>
                            <div class="section-title">Bill To</div>
                            <div class="section-content">
                                <p class="name">${customer?.name || 'N/A'}</p>
                                <p>${customer?.email || ''}</p>
                                <p>${customer?.phone || ''}</p>
                                <p>${customer?.address || ''}</p>
                            </div>
                        </div>
                        <div>
                            <div class="section-title">Vehicle Information</div>
                            <div class="section-content">
                                <p class="name">${vehicle?.brand || ''} ${vehicle?.model || ''}</p>
                                <p style="font-family: monospace;">${vehicle?.number || ''}</p>
                                <p>${vehicle?.year || ''}</p>
                            </div>
                            <div style="margin-top: 10px;">
                                <div class="section-title">Payment Terms</div>
                                <div class="section-content">
                                    <p>${invoice.paymentTerms || 'Net 30'}</p>
                                    <p style="color: #666;">Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">Description</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 20%; text-align: right;">Rate</th>
                                <th style="width: 20%; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.lineItems?.map(item => `
                                <tr>
                                    <td>
                                        <div class="item-description">${item.description}</div>
                                        ${item.detail ? `<div class="item-detail">${item.detail}</div>` : ''}
                                    </td>
                                    <td style="text-align: center; font-family: monospace;">${item.quantity}</td>
                                    <td style="text-align: right; font-family: monospace;">LKR ${item.unitPrice.toFixed(2)}</td>
                                    <td style="text-align: right; font-family: monospace; font-weight: bold;">LKR ${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No items</td></tr>'}
                        </tbody>
                    </table>
                    
                    <div class="totals-section">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax (${(invoice.taxRate * 100).toFixed(1)}%):</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.taxAmount.toFixed(2)}</td>
                            </tr>
                            ${invoice.discount > 0 ? `
                            <tr>
                                <td>Discount:</td>
                                <td style="text-align: right; font-family: monospace; color: #dc2626;">-LKR ${invoice.discount.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr class="total-row">
                                <td>Total:</td>
                                <td style="text-align: right; font-family: monospace;">LKR ${invoice.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Paid:</td>
                                <td style="text-align: right; font-family: monospace; color: #16a34a;">LKR ${invoice.paidAmount.toFixed(2)}</td>
                            </tr>
                            <tr class="balance-row">
                                <td>Balance Due:</td>
                                <td style="text-align: right; font-family: monospace; color: ${invoice.balancedue > 0 ? '#dc2626' : '#16a34a'};">
                                    LKR ${invoice.balancedue.toFixed(2)}
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    ${payments.length > 0 ? `
                    <div class="payment-history">
                        <h3>Payment History</h3>
                        ${payments.map(payment => `
                            <div class="payment-item">
                                <div>
                                    <span style="font-weight: 600; color: #15803d;">
                                        ${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                    </span>
                                    ${payment.reference ? `<span style="color: #16a34a;"> #${payment.reference}</span>` : ''}
                                    <span style="font-size: 9px; color: #666; display: block;">
                                        ${new Date(payment.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <span style="font-family: monospace; font-weight: bold; color: #15803d;">
                                    LKR ${payment.amount.toFixed(2)}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${invoice.notes ? `
                    <div class="notes-section">
                        <h3>Notes</h3>
                        <p>${invoice.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p style="font-weight: 600; margin-bottom: 2px;">Thank you for choosing ProGarage!</p>
                        <p>Questions? Contact us at billing@progarage.com</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        showNotification('info', 'Save as PDF', 'Select "Save as PDF" as the printer destination in the print dialog');
    };

    const handleDownloadPDF = async () => {
        // Get the invoice content
        const invoiceElement = document.querySelector('.invoice-content');
        if (!invoiceElement) {
            showNotification('error', 'Error', 'Invoice content not found');
            return;
        }

        try {
            showNotification('info', 'Generating PDF', 'Please wait while we generate your PDF...');
            
            // Create a clone of the invoice for PDF generation
            const clonedInvoice = invoiceElement.cloneNode(true);
            clonedInvoice.style.width = '210mm'; // A4 width
            clonedInvoice.style.padding = '10mm';
            clonedInvoice.style.backgroundColor = 'white';
            clonedInvoice.style.position = 'absolute';
            clonedInvoice.style.left = '-9999px';
            clonedInvoice.style.top = '0';
            document.body.appendChild(clonedInvoice);

            // Convert HTML to canvas
            const canvas = await html2canvas(clonedInvoice, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794, // A4 width in pixels at 96 DPI
                windowHeight: 1123 // A4 height in pixels at 96 DPI
            });

            // Remove the cloned element
            document.body.removeChild(clonedInvoice);

            // Get canvas dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Save PDF
            pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
            
            closeNotification();
            showNotification('success', 'PDF Downloaded', `Invoice ${invoice.invoiceNumber}.pdf has been downloaded successfully!`);
        } catch (error) {
            console.error('PDF generation error:', error);
            closeNotification();
            showNotification('error', 'Error', 'Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <h3 className="font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                    <select 
                        value={invoice.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {invoice.balancedue > 0 && (
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                        >
                            <CreditCard size={16} />
                            <span>Record Payment</span>
                        </button>
                    )}
                    <button 
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm"
                    >
                        <Printer size={16} />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
                <div className="invoice-content max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                            <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(invoice.dateCreated).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-left lg:text-right">
                            <h2 className="text-xl font-bold text-blue-600">ProGarage</h2>
                            <p className="text-sm text-gray-600">123 Auto Lane</p>
                            <p className="text-sm text-gray-600">Mechanic City, MC 90210</p>
                            <p className="text-sm text-gray-600">(555) 123-4567</p>
                        </div>
                    </div>

                    {/* Bill To & Vehicle Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
                            <p className="font-bold text-gray-900">{customer?.name}</p>
                            <p className="text-gray-600">{customer?.email}</p>
                            <p className="text-gray-600">{customer?.phone}</p>
                            <p className="text-gray-600">{customer?.address}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vehicle Information</p>
                            <p className="font-bold text-gray-900">{vehicle?.brand} {vehicle?.model}</p>
                            <p className="text-gray-600 font-mono">{vehicle?.number}</p>
                            <p className="text-gray-600">{vehicle?.year}</p>
                            
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Payment Terms</p>
                                <p className="text-gray-900">{invoice.paymentTerms}</p>
                                <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-8 overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 text-sm font-bold text-gray-700">Description</th>
                                    <th className="text-center py-3 text-sm font-bold text-gray-700 w-16 sm:w-20">Qty</th>
                                    <th className="text-right py-3 text-sm font-bold text-gray-700 w-20 sm:w-24">Rate</th>
                                    <th className="text-right py-3 text-sm font-bold text-gray-700 w-20 sm:w-24">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems?.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100">
                                        <td className="py-4">
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">{item.description}</p>
                                            {item.detail && <p className="text-xs sm:text-sm text-gray-600">{item.detail}</p>}
                                        </td>
                                        <td className="py-4 text-center font-mono text-sm">{item.quantity}</td>
                                        <td className="py-4 text-right font-mono text-sm">LKR {item.unitPrice.toFixed(2)}</td>
                                        <td className="py-4 text-right font-mono font-bold text-sm">LKR {item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full sm:w-80">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-mono">LKR {invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
                                <span className="font-mono">LKR {invoice.taxAmount.toFixed(2)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="font-mono text-red-600">-LKR {invoice.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-b-2 border-gray-300 text-lg font-bold">
                                <span>Total:</span>
                                <span className="font-mono">LKR {invoice.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Paid:</span>
                                <span className="font-mono text-green-600">LKR {invoice.paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-lg font-bold">
                                <span>Balance Due:</span>
                                <span className={`font-mono ${invoice.balancedue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    LKR {invoice.balancedue.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    {payments.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
                            <div className="space-y-2">
                                {payments.map(payment => (
                                    <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                            <span className="font-medium text-green-800">
                                                {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                            </span>
                                            {payment.reference && (
                                                <span className="text-sm text-green-600 ml-2">#{payment.reference}</span>
                                            )}
                                            <p className="text-xs text-green-600">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="font-mono font-bold text-green-800">
                                            LKR {payment.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-600">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-8 mt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Thank you for choosing ProGarage!</p>
                        <p className="text-xs text-gray-400 mt-1">Questions? Contact us at billing@progarage.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Payments Tab Component  
const PaymentsTab = ({ payments, invoices, customers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    
    const filteredPayments = payments
        .filter(payment => {
            const invoice = invoices.find(inv => inv.id === payment.invoiceId);
            const customer = customers.find(c => c.id === invoice?.customerId);
            
            const matchesSearch = !searchTerm || 
                payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
                
            const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
            
            return matchesSearch && matchesMethod;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalPayments = filteredPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

    return (
        <div className="w-full bg-white">
            <div className="p-4 border-b border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-foreground">Payment History</h3>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Collected</p>
                        <p className="text-xl font-bold text-green-600">LKR {totalPayments.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="check">Check</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>

            <div className="overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-700">Date</th>
                            <th className="text-left p-4 font-medium text-gray-700">Invoice</th>
                            <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                            <th className="text-left p-4 font-medium text-gray-700">Method</th>
                            <th className="text-left p-4 font-medium text-gray-700">Reference</th>
                            <th className="text-right p-4 font-medium text-gray-700">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => {
                            const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                            const customer = customers.find(c => c.id === invoice?.customerId);
                            
                            return (
                                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className="font-mono text-blue-600">{invoice?.invoiceNumber}</span>
                                    </td>
                                    <td className="p-4">{customer?.name}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                            {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-sm">{payment.reference}</td>
                                    <td className="p-4 text-right font-mono font-bold text-green-600">
                                        LKR {payment.amount.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {filteredPayments.length === 0 && (
                    <div className="text-center p-12 text-muted-foreground">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No payments found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Customers Tab Component
const CustomersTab = ({ customers, getCustomerBalance }) => {
    return (
        <div className="w-full bg-white">
            <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Customer Account Balances</h3>
            </div>

            <div className="overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                            <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                            <th className="text-right p-4 font-medium text-gray-700">Outstanding Balance</th>
                            <th className="text-center p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => {
                            const balance = getCustomerBalance(customer.id);
                            
                            return (
                                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-sm text-gray-500">{customer.address}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm">{customer.email}</p>
                                            <p className="text-sm text-gray-500">{customer.phone}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-mono font-bold ${
                                            balance > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            LKR {balance.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Statement
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Settings Tab Component
const SettingsTab = ({ billingSettings }) => {
    return (
        <div className="w-full bg-white p-6">
            <h3 className="font-bold text-foreground mb-6">Billing Settings</h3>
            
            <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
                        <input 
                            type="text" 
                            value={billingSettings.invoicePrefix}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Next Invoice Number</label>
                        <input 
                            type="number" 
                            value={billingSettings.nextInvoiceNumber}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                            readOnly
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                        <input 
                            type="number" 
                            value={(billingSettings.taxRate * 100).toFixed(1)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                            step="0.1"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                        <select 
                            value={billingSettings.paymentTerms}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled
                        >
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-gray-900 mb-4">Company Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input 
                                type="text" 
                                value={billingSettings.companyInfo.name}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={billingSettings.companyInfo.email}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input 
                                type="text" 
                                value={billingSettings.companyInfo.address}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input 
                                type="tel" 
                                value={billingSettings.companyInfo.phone}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Create Invoice Modal Component
const CreateInvoiceModal = ({ isOpen, onClose, completedServices, createInvoice, setSelectedInvoice, showNotification }) => {
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [lineItems, setLineItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    const handleServiceSelect = (serviceId) => {
        setSelectedServiceId(serviceId);
        const service = completedServices.find(s => s.id === serviceId);
        if (service) {
            setLineItems([{
                id: Date.now(),
                description: service.type,
                detail: service.description,
                quantity: 1,
                unitPrice: service.cost || 0,
                total: service.cost || 0,
                type: 'service'
            }]);
        }
    };

    const addLineItem = () => {
        setLineItems(prev => [...prev, {
            id: Date.now(),
            description: '',
            detail: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
            type: 'service'
        }]);
    };

    const updateLineItem = (id, field, value) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unitPrice') {
                    updated.total = updated.quantity * updated.unitPrice;
                }
                return updated;
            }
            return item;
        }));
    };

    const removeLineItem = (id) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

    const handleCreateInvoice = async () => {
        if (!selectedServiceId || lineItems.length === 0) return;

        try {
            const invoice = await createInvoice(selectedServiceId, {
                lineItems,
                subtotal,
                discount,
                notes
            });

            if (invoice) {
                setSelectedInvoice(invoice);
                onClose();
                showNotification('success', 'Success', 'Invoice created successfully!');
            }
        } catch (err) {
            showNotification('error', 'Error', 'Failed to create invoice.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Create New Invoice</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Service Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Completed Service
                        </label>
                        <select
                            value={selectedServiceId}
                            onChange={(e) => handleServiceSelect(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a service...</option>
                            {completedServices.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.type} - LKR {service.cost} ({new Date(service.date).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Line Items */}
                    {lineItems.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-gray-900">Line Items</h3>
                                <button
                                    onClick={addLineItem}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                >
                                    <Plus size={16} />
                                    <span>Add Item</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {lineItems.map(item => (
                                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="col-span-4">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Detail"
                                                value={item.detail}
                                                onChange={(e) => updateLineItem(item.id, 'detail', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs mt-1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Rate"
                                                value={item.unitPrice}
                                                onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={`$${item.total.toFixed(2)}`}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 font-mono"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <button
                                                onClick={() => removeLineItem(item.id)}
                                                className="text-red-500 hover:text-red-700 w-full"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal:</span>
                                            <span className="font-mono">LKR {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span>Discount:</span>
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                                            <span>Estimated Total:</span>
                                            <span className="font-mono">LKR {(subtotal - discount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes or terms..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateInvoice}
                        disabled={!selectedServiceId || lineItems.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, invoice, recordPayment, showNotification }) => {
    const [amount, setAmount] = useState(invoice.balancedue);
    const [method, setMethod] = useState('cash');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleRecordPayment = async () => {
        if (amount <= 0 || amount > invoice.balancedue) return;

        try {
            await recordPayment(invoice.id, {
                amount: parseFloat(amount),
                method,
                reference,
                date: new Date(date).toISOString(),
                notes
            });

            onClose();
            showNotification('success', 'Success', 'Payment recorded successfully!');
        } catch (err) {
            showNotification('error', 'Error', 'Failed to record payment.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Record Payment</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Invoice: {invoice.invoiceNumber}</span>
                            <span className="font-bold">LKR {invoice.balancedue.toFixed(2)} due</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Amount
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                max={invoice.balancedue}
                                min="0.01"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="check">Check</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Check #, Transaction ID, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRecordPayment}
                        disabled={amount <= 0 || amount > invoice.balancedue}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Record Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reports Modal Component
const ReportsModal = ({ isOpen, onClose, getRevenueReport }) => {
    const [reportType, setReportType] = useState('revenue');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);

    const generateReport = () => {
        if (reportType === 'revenue') {
            const data = getRevenueReport(startDate, endDate);
            setReportData(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Financial Reports</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="revenue">Revenue Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={generateReport}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {reportData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-medium text-green-800 mb-2">Total Revenue</h3>
                                    <p className="text-2xl font-bold text-green-900">LKR {reportData.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-800 mb-2">Payment Count</h3>
                                    <p className="text-2xl font-bold text-blue-900">{reportData.paymentCount}</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h3 className="font-medium text-purple-800 mb-2">Average Payment</h3>
                                    <p className="text-2xl font-bold text-purple-900">LKR {reportData.averagePayment.toFixed(2)}</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h3 className="font-medium text-orange-800 mb-2">Period</h3>
                                    <p className="text-sm text-orange-900">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Revenue by Payment Method</h3>
                                    <div className="space-y-3">
                                        {Object.entries(reportData.paymentMethods).map(([method, amount]) => (
                                            <div key={method} className="flex justify-between items-center">
                                                <span className="capitalize text-gray-700">{method.replace('_', ' ')}</span>
                                                <span className="font-mono font-bold">LKR {amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Revenue by Service Type</h3>
                                    <div className="space-y-3">
                                        {Object.entries(reportData.serviceRevenue).map(([service, amount]) => (
                                            <div key={service} className="flex justify-between items-center">
                                                <span className="text-gray-700">{service}</span>
                                                <span className="font-mono font-bold">LKR {amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
