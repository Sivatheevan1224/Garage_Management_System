
import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, invoice, recordPayment, showNotification }) => {
    const [amount, setAmount] = useState(invoice.balanceDue);
    const [method, setMethod] = useState('cash');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleRecordPayment = async () => {
        if (amount <= 0 || amount > invoice.balanceDue) return;
        try {
            await recordPayment(invoice.id, {
                amount: parseFloat(amount), method, reference,
                date: new Date(date).toISOString(), notes
            });
            onClose();
            showNotification('success', 'Success', 'Payment recorded successfully!');
        } catch (err) {
            showNotification('error', 'Error', 'Failed to record payment.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Record Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm font-medium">#{invoice.invoiceNumber}</span>
                        <span className="font-bold text-blue-700">LKR {invoice.balanceDue.toFixed(2)} due</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Method</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border rounded-lg">
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="check">Check</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ref #</label>
                        <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Optional" />
                    </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button onClick={handleRecordPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg">Record</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
