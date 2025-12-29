
import React, { useEffect, useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { useLocation } from 'react-router-dom';
import { Download, Printer, FileText } from 'lucide-react';

const Billing = () => {
    const { services, vehicles, customers } = useGarage();
    const location = useLocation();
    const [selectedService, setSelectedService] = useState(null);

    // Auto-select if navigated from ServiceManagement
    useEffect(() => {
        if (location.state?.serviceId) {
            const service = services.find(s => s.id === location.state.serviceId);
            if (service) setSelectedService(service);
        }
    }, [location.state, services]);

    const completedServices = services.filter(s => s.status === 'Completed').reverse();


    return (
        <div className="flex h-[calc(100vh-8rem)] space-x-6">
            {/* List of Invoices */}
            <div className="w-1/3 bg-white rounded-xl border border-border flex flex-col shadow-sm">
                <div className="p-4 border-b border-border">
                    <h3 className="font-bold text-foreground">Recent Invoices</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {completedServices.map(service => {
                        const vehicle = vehicles.find(v => v.id === service.vehicleId);
                        const isSelected = selectedService?.id === service.id;
                        return (
                            <div 
                                key={service.id} 
                                onClick={() => setSelectedService(service)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-transparent hover:bg-muted/50 hover:border-border'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-emerald-600 font-bold">{vehicle?.number}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(service.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground">{service.type}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total: ${service.cost}</p>
                            </div>
                        );
                    })}
                    {completedServices.length === 0 && <p className="text-muted-foreground text-center p-4">No completed services yet.</p>}
                </div>
            </div>

            {/* Invoice Preview */}
            <div className="flex-1 bg-muted/20 rounded-xl border border-border/50 overflow-hidden flex flex-col items-center justify-center p-6">
                {selectedService ? (
                    <InvoiceView service={selectedService} vehicles={vehicles} customers={customers} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <FileText size={48} className="mb-4 text-muted-foreground/50" />
                        <p>Select a service to view invoice</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InvoiceView = ({ service, vehicles, customers }) => {
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    const customer = customers.find(c => c.id === vehicle?.customerId);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-white p-4 border-b border-border flex justify-end space-x-3 rounded-t-xl">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-border rounded-lg text-foreground hover:bg-muted transition-all font-medium text-sm">
                    <Printer size={16} />
                    <span>Print</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm">
                    <Download size={16} />
                    <span>Download PDF</span>
                </button>
            </div>

            {/* Invoice Content */}
            <div className="flex-1 p-8 overflow-y-auto text-slate-800 font-sans bg-muted/20">
                <div className="border border-border rounded-lg p-8 max-w-2xl mx-auto bg-white shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                            <p className="text-slate-500">#{service.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-blue-600">ProGarage</h2>
                            <p className="text-sm text-slate-500">123 Auto Lane</p>
                            <p className="text-sm text-slate-500">Mechanic City, MC 90210</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex justify-between mb-12">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Billed To</p>
                            <p className="font-bold text-slate-800">{customer?.name}</p>
                            <p className="text-sm text-slate-600">{customer?.address}</p>
                            <p className="text-sm text-slate-600">{customer?.phone}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Vehicle Info</p>
                             <p className="font-bold text-slate-800">{vehicle?.brand} {vehicle?.model}</p>
                             <p className="text-sm text-slate-600 font-mono">{vehicle?.number}</p>
                             <div className="mt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Date</p>
                                <p className="font-bold text-slate-800">{new Date(service.date).toLocaleDateString()}</p>
                             </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="text-left py-3 text-sm font-bold text-slate-500">Description</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50">
                                <td className="py-4 text-slate-800">
                                    <p className="font-bold">{service.type}</p>
                                    <p className="text-sm text-slate-500">{service.description}</p>
                                </td>
                                <td className="py-4 text-right font-mono text-slate-800">${service.cost}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-4 text-right font-bold text-slate-600">Total</td>
                                <td className="pt-4 text-right font-bold text-2xl text-slate-900">${service.cost}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-slate-100 mt-8">
                        <p className="text-sm text-slate-400">Thank you for choosing ProGarage!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
