import React from 'react';
import { X, FileText, Download, TrendingDown, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useGarage } from '../../context/GarageContext';

const CustomerStatementModal = ({ isOpen, onClose, customer, formatCurrency }) => {
    const { services, vehicles, invoices, payments } = useGarage();

    if (!isOpen || !customer) return null;

    // Get all vehicles for this customer
    const customerVehicles = vehicles.filter(v => v.customerId === customer.id || v.customer === customer.id);
    const vehicleIds = customerVehicles.map(v => v.id);

    // Get all services for these vehicles
    const customerServices = services.filter(s => vehicleIds.includes(s.vehicleId));

    // Get all invoices for this customer
    const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
    const invoiceIds = customerInvoices.map(inv => inv.id);

    // Get all payments for these invoices
    const customerPayments = payments.filter(p => invoiceIds.includes(p.invoiceId || p.invoice_id)).sort((a,b) => new Date(b.date) - new Date(a.date));

    // Create a unified history (Invoices + Payments)
    const history = [
        ...customerInvoices.map(inv => ({
            type: 'invoice',
            date: inv.dateCreated,
            amount: inv.total,
            description: `Invoice Generated: ${inv.invoiceNumber}`,
            id: inv.id,
            status: inv.status
        })),
        ...customerPayments.map(p => ({
            type: 'payment',
            date: p.date,
            amount: p.amount,
            description: `Payment Received: ${p.method} ${p.reference ? '(' + p.reference + ')' : ''}`,
            id: p.id,
            status: 'paid'
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalBilled = customerInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalPaid = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const balance = totalBilled - totalPaid;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-lg">
                                    <FileText size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-50">Account Summary</span>
                            </div>
                            <h2 className="text-3xl font-black">{customer.name}</h2>
                            <p className="text-slate-400 font-medium">{customer.email}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[140px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding Balance</p>
                                <p className={`text-xl font-black ${balance > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                    {formatCurrency(balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-header Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 bg-slate-50/30">
                    <div className="p-6 text-center border-r border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Billing</p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(totalBilled)}</p>
                    </div>
                    <div className="p-6 text-center border-r border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Settlements</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Services</p>
                        <p className="text-xl font-bold text-slate-900">{customerServices.length} Records</p>
                    </div>
                </div>

                {/* Content - History List */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                            <p className="text-sm text-slate-500">Comprehensive log of all invoices and receipts</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
                            <Download size={14} />
                            Print Statement
                        </button>
                    </div>

                    <div className="space-y-4">
                        {history.length > 0 ? (
                            history.map((item, idx) => (
                                <div key={idx} className="flex items-center bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-md transition-all group">
                                    <div className={`p-4 rounded-xl mr-5 flex flex-col items-center justify-center ${item.type === 'invoice' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {item.type === 'invoice' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase text-sm tracking-tight">{item.description}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Calendar size={13} strokeWidth={2.5} />
                                                {new Date(item.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Clock size={13} strokeWidth={2.5} />
                                                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${item.type === 'invoice' ? 'text-slate-900' : 'text-emerald-700'}`}>
                                            {item.type === 'invoice' ? '-' : '+'}{formatCurrency(item.amount)}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                                            {item.type === 'invoice' ? 'Debit' : 'Credit'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                                <FileText className="h-16 w-16 text-slate-200 mx-auto mb-5" strokeWidth={1.5} />
                                <p className="text-slate-500 font-bold text-lg">Clean Account</p>
                                <p className="text-slate-400 text-sm mt-1">No transaction records found in the system yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        System Identity: {customer.id}
                    </p>
                    <button 
                        onClick={onClose} 
                        className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest"
                    >
                        Dismiss Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerStatementModal;
