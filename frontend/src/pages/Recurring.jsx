import { useState, useEffect } from 'react';
import { recurringAPI, walletAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const Recurring = () => {
  const [recurring, setRecurring] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [formData, setFormData] = useState({
    walletId: '',
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    frequency: 'monthly',
    dayOfMonth: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recurringRes, walletsRes] = await Promise.all([
        recurringAPI.getAll(),
        walletAPI.getAll()
      ]);
      setRecurring(recurringRes.data.recurring);
      setWallets(walletsRes.data.wallets);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        nextDueDate: calculateNextDueDate(formData.frequency, formData.dayOfMonth)
      };
      if (editingRecurring) {
        await recurringAPI.update(editingRecurring.id, submitData);
      } else {
        await recurringAPI.create(submitData);
      }
      setShowModal(false);
      setEditingRecurring(null);
      setFormData({
        walletId: '',
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        frequency: 'monthly',
        dayOfMonth: ''
      });
      fetchData();
    } catch (error) {
      console.error('Failed to save recurring transaction:', error);
    }
  };

  const calculateNextDueDate = (frequency, dayOfMonth) => {
    const now = new Date();
    let nextDate = new Date();

    if (frequency === 'daily') {
      nextDate.setDate(now.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextDate.setDate(now.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextDate.setMonth(now.getMonth() + 1);
      if (dayOfMonth) {
        nextDate.setDate(parseInt(dayOfMonth));
      }
    } else if (frequency === 'yearly') {
      nextDate.setFullYear(now.getFullYear() + 1);
    }

    return nextDate.toISOString().split('T')[0];
  };

  const handleEdit = (item) => {
    setEditingRecurring(item);
    setFormData({
      walletId: item.walletId,
      type: item.type,
      category: item.category,
      amount: item.amount,
      description: item.description || '',
      frequency: item.frequency,
      dayOfMonth: item.dayOfMonth?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi berulang ini?')) {
      try {
        await recurringAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete recurring transaction:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      yearly: 'Tahunan'
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Transaksi Berulang</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingRecurring(null);
              setFormData({
                walletId: '',
                type: 'expense',
                category: '',
                amount: '',
                description: '',
                frequency: 'monthly',
                dayOfMonth: ''
              });
            }}
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Tambah Transaksi Berulang
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurring.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {item.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                    </span>
                    {item.isActive ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        <FaCheckCircle className="inline mr-1" /> Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.category}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Dompet: {item.wallet?.name || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatCurrency(item.amount)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaCalendarAlt />
                  <span>{getFrequencyLabel(item.frequency)}</span>
                  {item.frequency === 'monthly' && item.dayOfMonth && (
                    <span> - Tanggal {item.dayOfMonth}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Jatuh Tempo: {new Date(item.nextDueDate).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {editingRecurring ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dompet</label>
                  <select
                    value={formData.walletId}
                    onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="">Pilih Dompet</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pendapatan</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Contoh: Netflix, Listrik"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frekuensi</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
                {formData.frequency === 'monthly' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      placeholder="1"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    rows="3"
                    placeholder="Keterangan (opsional)"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingRecurring(null);
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recurring;
