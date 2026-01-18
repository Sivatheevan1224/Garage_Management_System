
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Search, Wrench, CheckCircle, Clock, X, AlertCircle, Edit2, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ServiceManagement = () => {

    const { services, vehicles, technicians, addService, updateService, updateServiceStatus, notification, closeNotification, showNotification, billingSettings } = useGarage();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize search term from navigation state (e.g. from Vehicle Management)
    const [searchTerm, setSearchTerm] = useState(location.state?.filter || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [formData, setFormData] = useState({
        vehicleId: '', 
        type: 'General Service', 
        description: '', 
        technicianId: '', 
        cost: '', 
        taxIncluded: false,
        advancePayment: '',
        advancePaymentMethod: '',
        date: new Date().toISOString().split('T')[0]
    });

    const filteredServices = services.filter(s => {
        const vehicle = vehicles.find(v => v.id === s.vehicleId);
        const searchString = `${vehicle?.number || ''} ${s.type || ''} ${s.status || ''}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const getVehicleNumber = (id) => vehicles.find(v => v.id === id)?.number || 'Unknown';
    const getTechName = (id) => technicians.find(t => t.id === id)?.name || 'Unassigned';

    const [error, setError] = useState('');

    const handleOpenEdit = (service) => {
        setEditingService(service);
        setFormData({
            vehicleId: service.vehicleId,
            type: service.type,
            description: service.description || '',
            technicianId: service.technicianId || '',
            cost: service.cost || '',
            taxIncluded: service.taxIncluded || false,
            advancePayment: service.advancePayment || '',
            advancePaymentMethod: service.advancePaymentMethod || '',
            date: service.date ? service.date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setFormData({
            vehicleId: '', 
            type: 'General Service', 
            description: '', 
            technicianId: '', 
            cost: '',
            taxIncluded: false,
            advancePayment: '',
            advancePaymentMethod: '',
            date: new Date().toISOString().split('T')[0]
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const serviceData = {
                ...formData,
                technicianId: formData.technicianId || null,
                cost: parseFloat(formData.cost) || 0,
                advancePayment: parseFloat(formData.advancePayment) || 0,
                advancePaymentMethod: formData.advancePaymentMethod || null,
                estimatedHours: 0
            };
            
            if (editingService) {
                // Update existing service
                await updateService(editingService.id, serviceData);
                showNotification('success', 'Success', 'Service updated successfully!');
            } else {
                // Create new service
                await addService(serviceData);
                showNotification('success', 'Success', 'Service created successfully!');
            }
            
            handleCloseModal();
        } catch (err) {
            setError(editingService ? 'Failed to update service. Please try again.' : 'Failed to create service record. Please try again.');
        }
    };

    const handleGenerateInvoice = (service) => {
        // In a real app, this might generate a PDF. For now, we navigate to billing with highlight.
        navigate('/staff/billing', { state: { serviceId: service.id } });
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Service Management</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm">
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Service Record</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Vehicle No, Type, or Status..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Vehicle</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Service Type</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Cost</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Advance Paid</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Balance Due</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Technician</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredServices.length > 0 ? filteredServices.map(service => (
                            <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 text-sm text-foreground">{new Date(service.date).toLocaleDateString()}</td>
                                <td className="p-4 font-mono text-emerald-600 font-medium">{getVehicleNumber(service.vehicleId)}</td>
                                <td className="p-4 text-foreground">{service.type}</td>
                                <td className="p-4 text-sm font-semibold text-gray-700">
                                    LKR {(parseFloat(service.cost) || 0).toFixed(2)}
                                    <span className={`block text-xs font-normal ${service.taxIncluded ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {service.taxIncluded ? 'Inc. Tax' : '+ Tax'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {service.advancePayment > 0 ? (
                                        <div>
                                            <span className="font-semibold text-green-600">LKR {(parseFloat(service.advancePayment) || 0).toFixed(2)}</span>
                                            {service.advancePaymentMethod && (
                                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                    {service.advancePaymentMethod}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">No advance</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm">
                                    <div className="flex flex-col">
                                    <span className={`font-semibold ${(parseFloat(service.remainingBalance) || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        LKR {(service.remainingBalance !== undefined && service.remainingBalance !== null 
                                            ? parseFloat(service.remainingBalance) 
                                            : ((parseFloat(service.cost || 0) * (1 + (parseFloat(billingSettings?.taxRate) || 0.10))) - parseFloat(service.advancePayment || 0))
                                        ).toFixed(2)}
                                    </span>
                                        <span className="text-xs text-gray-500">inc. tax</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">{getTechName(service.technicianId)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        service.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                    }`}>
                                        {service.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleOpenEdit(service)}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm transition-all flex items-center space-x-1 border border-blue-200"
                                            title="Edit Service"
                                        >
                                            <Edit2 size={14} />
                                            <span>Edit</span>
                                        </button>
                                        {service.status === 'Pending' ? (
                                            <button onClick={async () => {
                                                try {
                                                    await updateServiceStatus(service.id, 'Completed');
                                                    showNotification('success', 'Success', 'Service marked as completed!');
                                                } catch (err) {
                                                    showNotification('error', 'Error', 'Failed to update status.');
                                                }
                                            }} className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-md text-sm transition-all flex items-center space-x-1 border border-green-200">
                                                <CheckCircle size={14} />
                                                <span>Complete</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => handleGenerateInvoice(service)} className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-md text-sm transition-all border border-border flex items-center space-x-1">
                                                <FileText size={14} />
                                                <span>Invoice</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-muted-foreground">No service records found.</td>
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
                            <h3 className="text-xl font-bold text-foreground">
                                {editingService ? 'Edit Service Record' : 'New Service Record'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Select Vehicle</label>
                                <select required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                                    <option value="" disabled>Select Vehicle</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.number} - {v.brand} {v.model}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Service Type</label>
                                    <select className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="General Service">General Service</option>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Inspection">Inspection</option>
                                        <option value="Full Service">Full Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Date</label>
                                    <input type="date" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Description</label>
                                <textarea className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" rows="2"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Details about the issue or service..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Tech Assigned</label>
                                    <select required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={formData.technicianId} onChange={e => setFormData({...formData, technicianId: e.target.value})}>
                                        <option value="" disabled>Select Tech</option>
                                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Estimated Cost (LKR)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="0.00" step="0.01" />
                                </div>
                            </div>
                            
                            {/* Advance Payment Section */}
                            <div className="border-t border-border pt-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3">Advance Payment (Optional)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-1">Advance Amount (LKR)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            value={formData.advancePayment} 
                                            onChange={e => setFormData({...formData, advancePayment: e.target.value})} 
                                            placeholder="0.00" 
                                            step="0.01"
                                            max={formData.cost || 0}
                                        />
                                        {formData.cost && formData.advancePayment && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Remaining: LKR {(parseFloat(formData.cost) - parseFloat(formData.advancePayment)).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-1">Payment Method</label>
                                        <select 
                                            className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            value={formData.advancePaymentMethod} 
                                            onChange={e => setFormData({...formData, advancePaymentMethod: e.target.value})}
                                            disabled={!formData.advancePayment}
                                        >
                                            <option value="">Select Method</option>
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="check">Check</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="taxIncluded"
                                        checked={formData.taxIncluded}
                                        onChange={e => setFormData({...formData, taxIncluded: e.target.checked})}
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="taxIncluded" className="text-sm text-gray-700">Tax Included in Cost</label>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg">
                                    {editingService ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ServiceManagement;
