
import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const ReportsModal = ({ isOpen, onClose, getRevenueReport }) => {
    const [reportType, setReportType] = useState('revenue');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);

    const generateReport = () => {
        if (reportType === 'revenue') {
            const data = getRevenueReport(startDate, endDate);
            setReportData(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Financial Reports</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="col-span-2 flex items-end">
                            <button onClick={generateReport} className="w-full bg-blue-600 text-white p-2 rounded-lg">Generate Report</button>
                        </div>
                    </div>

                    {reportData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Total Revenue</p><p className="text-2xl font-bold">LKR {reportData.totalRevenue.toFixed(2)}</p></div>
                                <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-600">Payments</p><p className="text-2xl font-bold">{reportData.paymentCount}</p></div>
                                <div className="p-4 bg-purple-50 rounded-lg"><p className="text-sm text-purple-600">Average</p><p className="text-2xl font-bold">LKR {reportData.averagePayment.toFixed(2)}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-bold mb-4">By Method</h3>
                                    {Object.entries(reportData.paymentMethods).map(([m, a]) => (
                                        <div key={m} className="flex justify-between py-1 border-b text-sm"><span className="capitalize">{m}</span><span className="font-mono">{a.toFixed(2)}</span></div>
                                    ))}
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-bold mb-4">By Service</h3>
                                    {Object.entries(reportData.serviceRevenue).map(([s, a]) => (
                                        <div key={s} className="flex justify-between py-1 border-b text-sm"><span>{s}</span><span className="font-mono">{a.toFixed(2)}</span></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;
