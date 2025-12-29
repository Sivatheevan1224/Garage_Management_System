
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Search, Wrench, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ServiceManagement = () => {

    const { services, vehicles, technicians, addService, updateServiceStatus } = useGarage();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize search term from navigation state (e.g. from Vehicle Management)
    const [searchTerm, setSearchTerm] = useState(location.state?.filter || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: '', type: 'General Service', description: '', technicianId: '', cost: '', date: new Date().toISOString().split('T')[0]
    });

    const filteredServices = services.filter(s => {
        const vehicle = vehicles.find(v => v.id === s.vehicleId);
        const searchString = `${vehicle?.number} ${s.type} ${s.status}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const getVehicleNumber = (id) => vehicles.find(v => v.id === id)?.number || 'Unknown';
    const getTechName = (id) => technicians.find(t => t.id === id)?.name || 'Unassigned';

    const handleSubmit = (e) => {
        e.preventDefault();
        addService(formData);
        setIsModalOpen(false);
        setFormData({ vehicleId: '', type: 'General Service', description: '', technicianId: '', cost: '', date: new Date().toISOString().split('T')[0] });
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
                                <td className="p-4 text-sm text-muted-foreground">{getTechName(service.technicianId)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        service.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                    }`}>
                                        {service.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {service.status === 'Pending' ? (
                                        <button onClick={() => updateServiceStatus(service.id, 'Completed')} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm transition-all flex items-center space-x-1 border border-blue-200">
                                            <CheckCircle size={14} />
                                            <span>Mark Done</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => handleGenerateInvoice(service)} className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-md text-sm transition-all border border-border">
                                            View Invoice
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-muted-foreground">No service records found.</td>
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
                            <h3 className="text-xl font-bold text-foreground">New Service Record</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>
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
                                    <label className="block text-sm text-muted-foreground mb-1">Estimated Cost ($)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg">Create Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
