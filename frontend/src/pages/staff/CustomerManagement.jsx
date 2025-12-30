
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

const CustomerManagement = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useGarage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', nic: '', phone: '', email: '', address: ''
    });

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm) ||
        c.nic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
            } else {
                await addCustomer(formData);
            }
            closeModal();
        } catch (err) {
            setError('Failed to save customer. Please try again.');
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData(customer);
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', nic: '', phone: '', email: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Customer Management</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Name</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">NIC</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Contact</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-foreground">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-muted-foreground font-mono text-sm">{customer.nic}</td>
                                <td className="p-4">
                                    <div className="text-sm text-foreground">{customer.phone}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(customer)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={async () => {
                                            if(window.confirm('Are you sure you want to delete this customer?')) {
                                                await deleteCustomer(customer.id);
                                            }
                                        }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-muted-foreground">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg border border-border shadow-2xl p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
                            <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>
                        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                                    <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">NIC Number</label>
                                    <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
                                    <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Email</label>
                                    <input required type="email" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Address</label>
                                <textarea required rows="3" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg">
                                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
