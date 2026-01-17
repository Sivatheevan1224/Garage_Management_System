import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationModal = ({ 
    isOpen, 
    type = 'info', 
    title, 
    message, 
    onClose, 
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirmation = false
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            titleColor: 'text-green-900',
            buttonColor: 'bg-green-600 hover:bg-green-700'
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            titleColor: 'text-red-900',
            buttonColor: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600',
            titleColor: 'text-amber-900',
            buttonColor: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-900',
            buttonColor: 'bg-blue-600 hover:bg-blue-700'
        },
        confirmation: {
            icon: AlertCircle,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600',
            titleColor: 'text-amber-900',
            buttonColor: 'bg-amber-600 hover:bg-amber-700'
        }
    };

    const config = typeConfig[type] || typeConfig.info;
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${config.bgColor} border ${config.borderColor} rounded-xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200`}>
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                        <IconComponent size={24} className={`${config.iconColor} mt-0.5 flex-shrink-0`} />
                        <h3 className={`text-lg font-bold ${config.titleColor}`}>{title}</h3>
                    </div>
                    {!isConfirmation && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {message}
                    </p>
                )}

                {/* Action Buttons */}
                <div className={`flex gap-3 ${isConfirmation ? 'justify-end' : 'justify-center'}`}>
                    {isConfirmation ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-6 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`px-8 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors`}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
