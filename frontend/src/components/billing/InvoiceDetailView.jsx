
import React, { useState } from 'react';
import { CreditCard, Printer, Download, Trash2, Mail, CheckCircle, AlertCircle, XCircle, Edit2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDetailView = ({ invoice, vehicles, customers, payments, setShowPaymentModal, updateInvoice, deleteInvoice, showNotification, showConfirmation, closeNotification, formatCurrency, currency }) => {
    const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
    const customer = customers.find(c => c.id === invoice.customerId);
    
    const handleStatusUpdate = async (newStatus) => {
        if (!invoice?.id) {
            showNotification('error', 'Error', 'Cannot update invoice: missing ID');
            return;
        }
        try {
            await updateInvoice(invoice.id, { status: newStatus });
            showNotification('success', 'Success', 'Invoice status updated successfully!');
        } catch (err) {
            showNotification('error', 'Error', 'Failed to update invoice status.');
        }
    };

    const handleDelete = () => {
        showConfirmation('Delete Invoice', 'Are you sure you want to delete this invoice? This action cannot be undone.', async () => {
            try {
                await deleteInvoice(invoice.id);
                closeNotification();
                showNotification('success', 'Deleted', 'Invoice deleted successfully!');
            } catch (err) {
                closeNotification();
                showNotification('error', 'Error', 'Failed to delete invoice.');
            }
        }, 'Delete', 'Cancel');
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 0; margin: 0; line-height: 1.4; }
                    .invoice-container { max-width: 800px; margin: auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 3px solid #2563eb; padding-bottom: 15px; }
                    .header h1 { font-size: 32px; font-weight: 900; color: #2563eb; margin: 0; letter-spacing: -0.5px; }
                    .company-info { text-align: right; }
                    .company-info h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
                    .company-info p { color: #64748b; margin: 1px 0; font-size: 12px; }
                    
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
                    .details-section h3 { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
                    .details-box { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
                    .details-box p { margin: 3px 0; font-size: 13px; }
                    .details-box .name { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 4px; }

                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    thead th { background: #f8fafc; color: #475569; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
                    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    
                    .totals-container { display: flex; justify-content: flex-end; margin-top: 15px; }
                    .totals-table { width: 260px; }
                    .totals-table tr td { padding: 6px 12px; font-size: 13px; }
                    .totals-table .grand-total { background: #2563eb; color: white; font-weight: 800; font-size: 16px; }
                    .totals-table .balance { font-weight: 800; color: ${invoice.balanceDue > 0 ? '#ef4444' : '#10b981'}; border-top: 1px solid #e2e8f0; margin-top: 5px; }

                    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div>
                            <h1>INVOICE</h1>
                            <p style="font-weight: 700; font-size: 15px; color: #64748b; margin-top: 4px;">#${invoice.invoiceNumber}</p>
                            <p style="font-size: 12px; color: #94a3b8;">Date: ${new Date(invoice.dateCreated).toLocaleDateString()}</p>
                        </div>
                        <div class="company-info">
                            <h2>ProGarage</h2>
                            <p>123 Auto Lane, Mechanic City</p>
                            <p>Phone: (555) 123-4567 | Email: billing@progarage.com</p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="details-section">
                            <h3>Bill To</h3>
                            <div class="details-box">
                                <p class="name">${customer?.name || 'N/A'}</p>
                                <p>${customer?.email || ''}</p>
                                <p>${customer?.address || ''}</p>
                            </div>
                        </div>
                        <div class="details-section">
                            <h3>Vehicle</h3>
                            <div class="details-box">
                                <p class="name">${vehicle?.brand || ''} ${vehicle?.model || ''}</p>
                                <p>Reg No: <span style="font-family: monospace; font-weight: 700;">${vehicle?.number || ''}</span></p>
                                <p>Year: ${vehicle?.year || ''}</p>
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 55%;">Description</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">Rate</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.lineItems?.map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700; color: #1e293b;">${item.description}</div>
                                        ${item.detail ? `<div style="font-size: 11px; color: #64748b;">${item.detail}</div>` : ''}
                                    </td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                                    <td class="text-right" style="font-weight: 700;">${formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals-container">
                        <table class="totals-table">
                            <tr>
                                <td style="color: #64748b;">Subtotal</td>
                                <td class="text-right">${formatCurrency(invoice.subtotal)}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b;">Tax (${(invoice.taxRate * 100).toFixed(1)}%)</td>
                                <td class="text-right">${formatCurrency(invoice.taxAmount)}</td>
                            </tr>
                            <tr class="grand-total">
                                <td>Total Amount</td>
                                <td class="text-right">${formatCurrency(invoice.total)}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b;">Paid to Date</td>
                                <td class="text-right" style="color: #10b981;">${formatCurrency(invoice.paidAmount)}</td>
                            </tr>
                            <tr class="balance">
                                <td>Balance Due</td>
                                <td class="text-right">${formatCurrency(invoice.balanceDue)}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="footer">
                        <p style="font-weight: 700; color: #475569; margin-bottom: 2px;">Thank you for your business!</p>
                        <p>© ${new Date().getFullYear()} ProGarage - Automotive Management Excellence</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadPDF = async () => {
        const invoiceElement = document.querySelector('.invoice-content');
        if (!invoiceElement) return;

        try {
            showNotification('info', 'Generating PDF', 'Generating PDF...');
            const canvas = await html2canvas(invoiceElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
            closeNotification();
            showNotification('success', 'Success', 'PDF Downloaded');
        } catch (error) {
            showNotification('error', 'Error', 'Failed to generate PDF');
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                    <select value={invoice.status} onChange={(e) => handleStatusUpdate(e.target.value)} className="border rounded text-sm p-1">
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    {invoice.balanceDue > 0 && (
                        <button onClick={() => setShowPaymentModal(true)} className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm"><CreditCard size={16}/>Pay</button>
                    )}
                    <button onClick={handlePrint} className="bg-gray-100 px-3 py-1.5 rounded text-sm"><Printer size={16}/></button>
                    <button onClick={handleDownloadPDF} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"><Download size={16}/></button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm"><Trash2 size={16}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="invoice-content max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                    <div className="flex justify-between border-b-2 pb-6 mb-8">
                        <div><h1 className="text-3xl font-bold">INVOICE</h1><p className="text-gray-600">#{invoice.invoiceNumber}</p></div>
                        <div className="text-right"><h2 className="text-2xl font-bold text-blue-600">ProGarage</h2><p>123 Auto Lane, Mechanic City</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-bold mb-2">Bill To</p>
                            <p>{customer?.name}</p><p>{customer?.email}</p><p>{customer?.address}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-bold mb-2">Vehicle</p>
                            <p>{vehicle?.brand} {vehicle?.model}</p><p>{vehicle?.number}</p>
                        </div>
                    </div>
                    <table className="w-full mb-8">
                        <thead className="bg-blue-50">
                            <tr><th className="p-3 text-left">Description</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Rate</th><th className="p-3 text-right">Total</th></tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems?.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-3">{item.description}</td><td className="p-3 text-center">{item.quantity}</td><td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-3 text-right font-bold">{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
                            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
                            <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span className="text-blue-600">{formatCurrency(invoice.total)}</span></div>
                            <div className="flex justify-between text-green-700"><span>Paid</span><span>{formatCurrency(invoice.paidAmount)}</span></div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Balance Due</span><span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(invoice.balanceDue)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailView;
