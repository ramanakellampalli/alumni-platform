export default function StatsOverview({
  donations = [],
  expenses = [],
  users = []
}) {
  const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Available Balance Card */}
      <div className="card">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Available Balance</p>
        <p className={`text-xl mb-4 ${totalDonations - totalExpenses >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
          ₹{(totalDonations - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Funds Used</span>
            <span className="font-semibold text-gray-900">
              {totalDonations > 0 ? Math.round((totalExpenses / totalDonations) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalDonations > 0 ? Math.min((totalExpenses / totalDonations) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* List Group Card */}
      <div className="card p-0 overflow-hidden">
        {/* Donations */}
        <div className="p-2 border-b border-gray-200">
          <div className="p-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Total Donations</p>
              <p className="text-xs text-gray-600 mt-0.5">{donations.length} entries</p>
            </div>
            <p>
              ₹{totalDonations.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div className="p-2 border-b border-gray-200">
          <div className="p-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Total Expenses</p>
              <p className="text-xs text-gray-600 mt-0.5">{expenses.length} entries</p>
            </div>
            <p>
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Registered Alumni */}
        <div className="p-2">
          <div className="p-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Registered Alumni</p>
              <p className="text-xs text-gray-600 mt-0.5">Total users</p>
            </div>
            <p>{users.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
