
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Search, Edit, Car, X, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VehicleManagement = () => {
    const { vehicles, customers, addVehicle, updateVehicle } = useGarage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    const [formData, setFormData] = useState({
        customerId: '', number: '', brand: '', model: '', year: '', fuelType: 'Petrol'
    });

    const filteredVehicles = vehicles.filter(v => 
        v.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVehicle) {
            updateVehicle(editingVehicle.id, formData);
        } else {
            addVehicle(formData);
        }
        closeModal();
    };

    const openModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData(vehicle);
        } else {
            setEditingVehicle(null);
            setFormData({ customerId: customers[0]?.id || '', number: '', brand: '', model: '', year: '', fuelType: 'Petrol' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    if (customers.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl text-slate-400">No customers found. Please add customers before registering vehicles.</h3>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Vehicle Management</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search vehicles..." 
                            className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Register Vehicle</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-white rounded-xl border border-border p-6 hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Car size={24} />
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => navigate('/staff/services', { state: { filter: vehicle.number } })} className="text-muted-foreground hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded" title="View Service History">
                                    <Clock size={18} />
                                </button>
                                <button onClick={() => openModal(vehicle)} className="text-muted-foreground hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded" title="Edit Vehicle">
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-muted-foreground text-sm mb-4 font-mono bg-muted inline-block px-2 py-1 rounded">{vehicle.number}</p>
                        
                        <div className="space-y-2 text-sm border-t border-border pt-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Owner</span>
                                <span className="text-foreground font-medium flex items-center gap-1"><User size={14}/> {getCustomerName(vehicle.customerId)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Year</span>
                                <span className="text-foreground">{vehicle.year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fuel</span>
                                <span className="text-foreground">{vehicle.fuelType}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-2xl p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">{editingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Customer (Owner)</label>
                                <select required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                    value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.nic}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Brand</label>
                                    <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Toyota" />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Model</label>
                                    <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Corolla" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Year</label>
                                    <input required type="number" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2015" />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">Fuel Type</label>
                                    <select className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                        value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Vehicle Number</label>
                                <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-emerald-500/50" 
                                    value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} placeholder="CAB-1234" />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg">
                                    {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleManagement;
