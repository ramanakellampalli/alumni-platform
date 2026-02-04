import { Calendar, FileText, IndianRupee } from 'lucide-react';

export default function Reports({ donations, expenses }) {
  // Calculate monthly data
  const getMonthlyData = () => {
    const monthlyData = {};
    
    donations.forEach(d => {
      const month = d.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { donations: 0, expenses: 0 };
      monthlyData[month].donations += parseFloat(d.amount) || 0;
    });
    
    expenses.forEach(e => {
      const month = e.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { donations: 0, expenses: 0 };
      monthlyData[month].expenses += parseFloat(e.amount) || 0;
    });
    
    return Object.keys(monthlyData)
      .sort()
      .map(month => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-IN', { month: 'short' });
        return {
          month: monthName,
          donations: monthlyData[month].donations,
          expenses: monthlyData[month].expenses,
          net: monthlyData[month].donations - monthlyData[month].expenses
        };
      });
  };

  // Calculate category breakdown
  const getCategoryData = () => {
    const categoryTotals = {};
    
    expenses.forEach(e => {
      const category = e.category || 'Miscellaneous';
      categoryTotals[category] = (categoryTotals[category] || 0) + (parseFloat(e.amount) || 0);
    });
    
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount }));
  };

  // Calculate cash flow
  const getCashFlowData = () => {
    const transactions = [
      ...donations.map(d => ({ date: d.date, amount: parseFloat(d.amount) || 0, isIncome: true })),
      ...expenses.map(e => ({ date: e.date, amount: parseFloat(e.amount) || 0, isIncome: false }))
    ];
    
    transactions.sort((a, b) => a.date.localeCompare(b.date));
    
    let runningBalance = 0;
    const flowData = [];
    
    transactions.forEach(txn => {
      runningBalance += txn.isIncome ? txn.amount : -txn.amount;
      const [year, month] = txn.date.split('-');
      const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      
      const existing = flowData.find(f => f.date === monthName);
      if (existing) {
        existing.balance = runningBalance;
      } else {
        flowData.push({ date: monthName, balance: runningBalance });
      }
    });
    
    return flowData;
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const cashFlowData = getCashFlowData();
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const colors = ['#f97316', '#ef4444', '#eab308', '#a855f7', '#ec4899', '#6366f1', '#3b82f6', '#6b7280'];

  if (monthlyData.length === 0 && categoryData.length === 0 && cashFlowData.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <FileText size={40} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Add some donations and expenses to see reports and analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Monthly Summary Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            Monthly Summary
          </h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.donations, d.expenses)));
              const donationWidth = maxValue > 0 ? (data.donations / maxValue) * 100 : 0;
              const expenseWidth = maxValue > 0 ? (data.expenses / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-gray-700 w-20">{data.month}</span>
                    <div className="flex gap-6 text-xs">
                      <span className="text-green-600">₹{data.donations.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      <span className="text-orange-600">₹{data.expenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${donationWidth}%` }}
                      />
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${expenseWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Donations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText size={24} className="text-orange-600" />
            Expense Breakdown by Category
          </h3>
          
          {/* Donut Chart Visual */}
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="relative w-64 h-64 flex-shrink-0">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  let currentAngle = 0;
                  return categoryData.map((cat, index) => {
                    const percentage = (cat.amount / totalExpenses) * 100;
                    const angle = (percentage / 100) * 360;
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const startX = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                    const startY = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                    const endX = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                    const endY = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                    
                    currentAngle += angle;
                    
                    return (
                      <path
                        key={index}
                        d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArc} 1 ${endX} ${endY} Z`}
                        fill={colors[index % colors.length]}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
                <circle cx="100" cy="100" r="50" fill="white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {categoryData.map((cat, index) => {
                const percentage = totalExpenses > 0 ? ((cat.amount / totalExpenses) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{cat.category}</p>
                      <p className="text-xs text-gray-500">{percentage}% • ₹{cat.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Chart */}
      {cashFlowData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <IndianRupee size={24} className="text-teal-600" />
            Cash Flow Timeline
          </h3>
          <div className="space-y-1">
            {cashFlowData.map((data, index) => {
              const maxBalance = Math.max(...cashFlowData.map(d => Math.abs(d.balance)));
              const barWidth = maxBalance > 0 ? (Math.abs(data.balance) / maxBalance) * 100 : 0;
              const isPositive = data.balance >= 0;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 w-24 flex-shrink-0">{data.date}</span>
                  <div className="flex-1 flex items-center">
                    {isPositive ? (
                      <div className="h-8 bg-teal-500 rounded transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    ) : (
                      <div className="h-8 bg-red-500 rounded transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    )}
                  </div>
                  <span className={`text-sm font-semibold w-32 text-right ${isPositive ? 'text-teal-600' : 'text-red-600'}`}>
                    ₹{data.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-gray-600">Positive Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Negative Balance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}