import { Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

const BANK = {
  accountName: 'ZPHS Valaparla Alumni Association',
  accountNumber: 'XXXXXXXXXXXX',
  ifsc: 'SBIN0XXXXXX',
  branch: 'SBI – Valaparla Branch',
  accountType: 'Savings',
  upiId: 'alumni@sbi',
};

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
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
  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* QR Code Card */}
        <div className="card flex flex-col items-center text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Scan to Pay (UPI)</p>
          {/* Dummy QR — replace src with real QR image later */}
          <div className="w-44 h-44 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-3">
            <p className="text-xs text-gray-400 px-4">QR Code<br />Coming Soon</p>
          </div>
          <p className="text-sm font-semibold text-gray-800">{BANK.upiId}</p>
          <p className="text-xs text-gray-500 mt-0.5">UPI ID</p>
        </div>

        {/* Bank Details Card */}
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Bank Account Details</p>
          <CopyField label="Account Name" value={BANK.accountName} />
          <CopyField label="Account Number" value={BANK.accountNumber} />
          <CopyField label="IFSC Code" value={BANK.ifsc} />
          <CopyField label="Bank & Branch" value={BANK.branch} />
          <CopyField label="Account Type" value={BANK.accountType} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        After transferring, please share your transaction reference with the treasurer.
      </p>
    </div>
  );
}
