
import React, { useState } from 'react';
import { Search, CreditCard } from 'lucide-react';

const formatInvoiceNumber = (num) => {
    if (!num) return 'N/A';
    if (num.length > 8) return num.substring(0, 8).toUpperCase();
    return num.toUpperCase();
};

const PaymentsTab = ({ payments, invoices, customers, formatCurrency }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    
    const filteredPayments = payments
        .filter(payment => {
            const invoice = invoices.find(inv => inv.id === payment.invoiceId);
            const customer = customers.find(c => c.id === invoice?.customerId);
            
            const matchesSearch = !searchTerm || 
                payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <p className="text-xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
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
                        className="px-4 py-2 border border-border rounded-lg"
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
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Invoice</th>
                            <th className="text-left p-4">Customer</th>
                            <th className="text-left p-4">Method</th>
                            <th className="text-right p-4">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => {
                            const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                            const customer = customers.find(c => c.id === invoice?.customerId);
                            return (
                                <tr key={payment.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="p-4"><span className="font-mono text-blue-600">{formatInvoiceNumber(invoice?.invoiceNumber)}</span></td>
                                    <td className="p-4">{customer?.name}</td>
                                    <td className="p-4 capitalize">{payment.method}</td>
                                    <td className="p-4 text-right font-bold text-green-600">{formatCurrency(payment.amount)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredPayments.length === 0 && (
                    <div className="text-center p-12 text-gray-400">
                        <CreditCard size={48} className="mx-auto mb-2 opacity-50"/>
                        <p>No payments found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsTab;
