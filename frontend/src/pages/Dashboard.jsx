import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FaWallet, 
  FaArrowUp, 
  FaArrowDown, 
  FaChartLine,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, togglePrivacyMode } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (user?.privacyMode || amount === '***') return '***';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="p-6">Failed to load dashboard data</div>;
  }

  const pieData = dashboardData.expensesByCategory?.map(item => ({
    name: item.category,
    value: parseFloat(item.total)
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    // PERBAIKAN 1: Menambahkan class background dan min-height agar sama persis dengan Wallets.jsx
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      
      {/* PERBAIKAN 2: Membungkus Header & Konten dalam satu container max-w-7xl agar sejajar */}
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6 flex justify-between items-center">
          {/* PERBAIKAN 3: Mengubah ukuran font menjadi text-3xl agar sama besarnya dengan tulisan "Dompet" */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <button
            onClick={togglePrivacyMode}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title={user?.privacyMode ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
          >
            {user?.privacyMode ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Saldo</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {formatCurrency(dashboardData.totalBalance)}
                </p>
              </div>
              <FaWallet className="text-blue-500 dark:text-blue-400 text-3xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {formatCurrency(dashboardData.monthlyIncome)}
                </p>
              </div>
              <FaArrowUp className="text-green-500 dark:text-green-400 text-3xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pengeluaran Bulan Ini</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {formatCurrency(dashboardData.monthlyExpense)}
                </p>
              </div>
              <FaArrowDown className="text-red-500 dark:text-red-400 text-3xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Net Worth</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {formatCurrency(dashboardData.netWorth)}
                </p>
              </div>
              <FaChartLine className="text-purple-500 dark:text-purple-400 text-3xl" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Pengeluaran per Kategori</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada data pengeluaran</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Perbandingan Bulan</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bulan Ini</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700 dark:text-gray-300">Pendapatan</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(dashboardData.monthlyIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700 dark:text-gray-300">Pengeluaran</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(dashboardData.monthlyExpense)}
                  </span>
                </div>
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Bulan Lalu</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700 dark:text-gray-300">Pendapatan</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(dashboardData.lastMonthIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700 dark:text-gray-300">Pengeluaran</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(dashboardData.lastMonthExpense)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transaksi Terakhir</h2>
            <Link
              to="/transactions"
              className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">Tanggal</th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">Kategori</th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">Deskripsi</th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions?.map((transaction) => (
                  <tr key={transaction.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{transaction.category}</td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{transaction.description || '-'}</td>
                    <td className={`py-2 px-4 text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default Dashboard;