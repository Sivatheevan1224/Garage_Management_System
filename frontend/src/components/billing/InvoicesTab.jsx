
import React from 'react';
import { FileText } from 'lucide-react';
import InvoiceDetailView from './InvoiceDetailView';

const formatInvoiceNumber = (num) => {
    if (!num) return 'N/A';
    if (num.length > 8) return num.substring(0, 8).toUpperCase();
    return num.toUpperCase();
};

const InvoicesTab = ({ 
    filteredInvoices, selectedInvoice, setSelectedInvoice, vehicles, customers, payments,
    setShowPaymentModal, updateInvoice, deleteInvoice, showNotification, 
    showConfirmation, closeNotification, StatusBadge, formatCurrency, currency
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
                        const isOverdue = invoice.balanceDue > 0 && dueDate < new Date();
                        
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
                                        {formatInvoiceNumber(invoice.invoiceNumber)}
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
                                        {formatCurrency(invoice.balanceDue)}
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
                        payments={payments.filter(p => p.invoiceId === selectedInvoice.id)}
                        setShowPaymentModal={setShowPaymentModal}
                        updateInvoice={updateInvoice}
                        deleteInvoice={deleteInvoice}
                        showNotification={showNotification}
                        showConfirmation={showConfirmation}
                        closeNotification={closeNotification}
                        formatCurrency={formatCurrency}
                        currency={currency}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={64} className="mb-4 opacity-20" />
                        <p className="font-bold text-xl">Select an invoice</p>
                        <p className="text-sm">Click on any document on the left to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoicesTab;
