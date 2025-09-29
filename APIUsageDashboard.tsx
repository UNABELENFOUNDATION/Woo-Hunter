import React, { useState, useEffect } from 'react';

interface APIUsage {
  calls: number;
  cost: number;
}

interface BudgetStatus {
  limits: {
    daily_limit: number;
    monthly_limit: number;
    daily_cost_limit: number;
    monthly_cost_limit: number;
  };
  today: APIUsage;
  month: APIUsage;
  budget_check: {
    status: 'ok' | 'warning' | 'blocked';
    warnings: string[];
    usage: APIUsage & { monthly_calls: number; monthly_cost: number };
  };
}

interface UsageDashboardProps {
  onClose?: () => void;
}

const APIUsageDashboard: React.FC<UsageDashboardProps> = ({ onClose }) => {
  const [usageData, setUsageData] = useState<Record<string, BudgetStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/usage/status');
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4">
          <div className="text-center">Loading usage data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4">
          <div className="text-center text-red-600">Error: {error}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">API Usage Dashboard</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usageData && Object.entries(usageData).map(([apiName, status]: [string, BudgetStatus]) => (
            <div key={apiName} className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">{apiName.replace('_', ' ')}</h3>

              {/* Status Indicator */}
              <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(status.budget_check.status)}`}>
                {status.budget_check.status.toUpperCase()}
              </div>

              {/* Warnings */}
              {status.budget_check.warnings.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-red-600 mb-1">Warnings:</h4>
                  <ul className="text-xs text-red-600">
                    {status.budget_check.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Today's Usage */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Today's Usage</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calls: <span className="font-medium">{status.today.calls}</span></div>
                  <div>Cost: <span className="font-medium">{formatCurrency(status.today.cost)}</span></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Limits: {status.limits.daily_limit} calls / {formatCurrency(status.limits.daily_cost_limit)}
                </div>
              </div>

              {/* Monthly Usage */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">This Month</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calls: <span className="font-medium">{status.month.calls}</span></div>
                  <div>Cost: <span className="font-medium">{formatCurrency(status.month.cost)}</span></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Limits: {status.limits.monthly_limit} calls / {formatCurrency(status.limits.monthly_cost_limit)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
            >
              Check Gemini Usage
            </a>
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
            >
              Check Maps Usage
            </a>
            <button
              onClick={fetchUsageData}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIUsageDashboard;