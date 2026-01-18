
import React from 'react';

const CustomersTab = ({ customers, getCustomerBalance, getCustomerOverdue, formatCurrency }) => {
    return (
        <div className="w-full bg-white">
            <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">Customer Account Balances</h3>
            </div>

            <div className="overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4">Customer</th>
                            <th className="text-right p-4">Total Outstanding</th>
                            <th className="text-right p-4 text-red-600">Overdue Balance</th>
                            <th className="text-center p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => {
                            const balance = getCustomerBalance(customer.id);
                            return (
                                <tr key={customer.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <p className="font-medium">{customer.name}</p>
                                        <p className="text-xs text-gray-500">{customer.email}</p>
                                    </td>
                                    <td className="p-4 text-right font-bold">{formatCurrency(balance)}</td>
                                    <td className="p-4 text-right font-bold text-red-600">{formatCurrency(getCustomerOverdue(customer.id))}</td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:underline text-sm font-medium">View Statement</button>
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

export default CustomersTab;
