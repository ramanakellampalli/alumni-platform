import { Copy, CheckCheck, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import upiQr from '../assets/upi-qr.jpg';
import Toast from './Toast';

const BANK = {
  accountName: 'OLD STUDENTS ASSOCIATION ZPHS VALAPARLA',
  accountNumber: '597510000001038',
  ifsc: 'UBIN0CG7999',
  branch: 'Andhra Pradesh Grameena Bank – Valaparla',
  accountType: 'Savings',
  upiId: '5975097701@myapgb',
};

function CopyField({ label, value, onCopied }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    onCopied(label);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
        title="Copy"
      >
        {copied ? <CheckCheck size={15} className="text-green-600" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

export default function BankingDetails() {
  const [toast, setToast] = useState(null);

  const handleCopied = (label) => {
    setToast({ message: `${label} copied to clipboard!`, type: 'success' });
  };

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">

        {/* QR Code Card */}
        <div className="card flex flex-col h-full">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 text-center">Scan to Pay (UPI)</p>
          <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
            <img src={upiQr} alt="UPI QR Code" className="w-full h-full object-cover object-center" />
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Bank Account Details</p>
          <CopyField label="Account Name" value={BANK.accountName} onCopied={handleCopied} />
          <CopyField label="Account Number" value={BANK.accountNumber} onCopied={handleCopied} />
          <CopyField label="IFSC Code" value={BANK.ifsc} onCopied={handleCopied} />
          <CopyField label="Bank & Branch" value={BANK.branch} onCopied={handleCopied} />
          <CopyField label="Account Type" value={BANK.accountType} onCopied={handleCopied} />
          <CopyField label="UPI ID" value={BANK.upiId} onCopied={handleCopied} />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        After transferring, please share a screenshot of your transaction on WhatsApp to{' '}
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded">
          <MessageCircle size={12} />
          +91 99480 38073
        </span>
      </p>
    </div>
  );
}
