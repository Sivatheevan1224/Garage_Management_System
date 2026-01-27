
import React from 'react';
const CustomersTab = ({ customers, getCustomerBalance, getCustomerOverdue, formatCurrency, onViewStatement }) => {
    return (
        <div className="w-full h-full bg-white overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Customer Account Balances</h3>
                    <p className="text-xs text-slate-500 font-medium">Tracking outstanding debt and individual customer statements</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                        <tr>
                            <th className="text-left p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Identity</th>
                            <th className="text-right p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</th>
                            <th className="text-right p-5 text-[10px] font-black text-red-400 uppercase tracking-widest">Immediate Overdue</th>
                            <th className="text-center p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customers.length > 0 ? customers.map(customer => {
                            const balance = getCustomerBalance(customer.id);
                            return (
                                <tr key={customer.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{customer.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatCurrency(balance)}</p>
                                    </td>
                                    <td className="p-5 text-right">
                                        <p className={`text-sm font-black whitespace-nowrap ${getCustomerOverdue(customer.id) > 0 ? 'text-red-600 animate-pulse' : 'text-slate-300'}`}>
                                            {formatCurrency(getCustomerOverdue(customer.id))}
                                        </p>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button 
                                            onClick={() => onViewStatement(customer)}
                                            className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all"
                                        >
                                            View Statement
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">
                                    No customer records found in the database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersTab;
