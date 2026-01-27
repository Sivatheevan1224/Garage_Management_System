
import React, { useEffect, useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { useLocation } from 'react-router-dom';
import { 
  FileText, CreditCard, Users, Search, DollarSign, BarChart3, Clock, AlertCircle, Edit2, CheckCircle, XCircle, Mail, TrendingUp
} from 'lucide-react';

// Specialized Billing Components
import InvoicesTab from '../../components/billing/InvoicesTab';
import PaymentsTab from '../../components/billing/PaymentsTab';
import CustomersTab from '../../components/billing/CustomersTab';
import InvoiceDetailView from '../../components/billing/InvoiceDetailView';
import PaymentModal from '../../components/billing/PaymentModal';
import ReportsModal from '../../components/billing/ReportsModal';
import CustomerStatementModal from '../../components/billing/CustomerStatementModal';

const Billing = () => {
    const { 
      services, vehicles, customers, invoices, payments,
      createInvoice, updateInvoice, deleteInvoice, recordPayment,
      getInvoicePayments, getRevenueReport, getOutstandingInvoices,
      getOverdueInvoices, getCustomerBalance, getCustomerOverdue,
      notification, closeNotification, showNotification, showConfirmation
    } = useGarage();
    
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('invoices');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currency, setCurrency] = useState(() => localStorage.getItem('billingCurrency') || 'LKR');

    // Shared Helpers
    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return currency === 'LKR' ? `LKR ${numAmount.toFixed(2)}` : `$${(numAmount / 300).toFixed(2)}`;
    };

    const StatusBadge = ({ status }) => {
        const config = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit2 },
            sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Mail },
            paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
            canceled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle }
        }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit2 };
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                <config.icon size={10} />
                {status}
            </span>
        );
    };

    // Auto-select invoice from navigation state
    useEffect(() => {
        if (location.state?.serviceId) {
            const service = services.find(s => s.id === location.state.serviceId);
            if (service && service.status === 'Completed') {
                const existing = invoices.find(inv => inv.serviceId === service.id);
                if (existing) setSelectedInvoice(existing);
                else createInvoice(service.id).then(setSelectedInvoice).catch(console.error);
            }
        }
    }, [location.state, services, invoices, createInvoice]);

    const filteredInvoices = invoices.filter(inv => {
        const customer = customers.find(c => c.id === inv.customerId);
        const matchesSearch = !searchTerm || inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = getOutstandingInvoices().reduce((sum, inv) => sum + inv.balanceDue, 0);

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-200 p-8 flex flex-col gap-8 shadow-sm relative z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Hub</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage invoices, tracking revenue and customer accounts</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => {const n = currency==='LKR'?'$':'LKR'; setCurrency(n); localStorage.setItem('billingCurrency', n);}} 
                            className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
                        >
                            <span className="text-xs text-slate-400 uppercase tracking-widest">Currency</span>
                            <span className="text-blue-600">{currency}</span>
                        </button>
                        <button 
                            onClick={() => setShowReportsModal(true)} 
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                        >
                            <BarChart3 size={18} />
                            Analytical Reports
                        </button>
                    </div>
                </div>

                {/* Premium Metrics Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center gap-4">
                            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settled Revenue</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-orange-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center gap-4">
                            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collectables</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCurrency(totalOutstanding)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documents</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{invoices.length} <span className="text-sm font-bold text-slate-300 ml-1">Total</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                        {[
                            { id: 'invoices', icon: FileText, label: 'Invoices' },
                            { id: 'payments', icon: CreditCard, label: 'Payments' },
                            { id: 'customers', icon: Users, label: 'Customers' }
                        ].map(t => (
                            <button 
                                key={t.id} 
                                onClick={() => setActiveTab(t.id)} 
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === t.id 
                                        ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 uppercase tracking-wide text-xs'
                                }`}
                            >
                                <t.icon size={16} strokeWidth={activeTab === t.id ? 2.5 : 2} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'invoices' && (
                        <div className="relative w-80 group">
                            <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by number or customer..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium" 
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'invoices' && (
                    <InvoicesTab 
                        filteredInvoices={filteredInvoices} selectedInvoice={selectedInvoice} setSelectedInvoice={setSelectedInvoice}
                        vehicles={vehicles} customers={customers} payments={payments}
                        setShowPaymentModal={setShowPaymentModal} updateInvoice={updateInvoice} deleteInvoice={deleteInvoice}
                        showNotification={showNotification} showConfirmation={showConfirmation} closeNotification={closeNotification}
                        StatusBadge={StatusBadge} formatCurrency={formatCurrency} currency={currency}
                    />
                )}
                {activeTab === 'payments' && <PaymentsTab payments={payments} invoices={invoices} customers={customers} formatCurrency={formatCurrency} />}
                {activeTab === 'customers' && (
                    <CustomersTab 
                        customers={customers} 
                        getCustomerBalance={getCustomerBalance} 
                        getCustomerOverdue={getCustomerOverdue} 
                        formatCurrency={formatCurrency} 
                        onViewStatement={(customer) => {
                            setSelectedCustomer(customer);
                            setShowStatementModal(true);
                        }}
                    />
                )}
            </div>

            {showPaymentModal && selectedInvoice && (
                <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} invoice={selectedInvoice} recordPayment={recordPayment} showNotification={showNotification} />
            )}
            {showReportsModal && <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} getRevenueReport={getRevenueReport} />}
            {showStatementModal && selectedCustomer && (
                <CustomerStatementModal 
                    isOpen={showStatementModal} 
                    onClose={() => setShowStatementModal(false)} 
                    customer={selectedCustomer} 
                    formatCurrency={formatCurrency} 
                />
            )}
        </div>
    );
};

export default Billing;
