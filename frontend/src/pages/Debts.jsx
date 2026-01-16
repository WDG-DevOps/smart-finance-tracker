import { useState, useEffect } from 'react';
import { debtAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [filter, setFilter] = useState('all'); // all, owed, owing, unpaid
  const [formData, setFormData] = useState({
    type: 'owed',
    personName: '',
    amount: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchDebts();
  }, [filter]);

  const fetchDebts = async () => {
    try {
      const params = {};
      if (filter === 'owed' || filter === 'owing') {
        params.type = filter;
      } else if (filter === 'unpaid') {
        params.isPaid = 'false';
      }
      const response = await debtAPI.getAll(params);
      setDebts(response.data.debts);
    } catch (error) {
      console.error('Failed to fetch debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDebt) {
        await debtAPI.update(editingDebt.id, formData);
      } else {
        await debtAPI.create(formData);
      }
      setShowModal(false);
      setEditingDebt(null);
      setFormData({
        type: 'owed',
        personName: '',
        amount: '',
        description: '',
        dueDate: ''
      });
      fetchDebts();
    } catch (error) {
      console.error('Failed to save debt:', error);
    }
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      type: debt.type,
      personName: debt.personName,
      amount: debt.amount,
      description: debt.description || '',
      dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      try {
        await debtAPI.delete(id);
        fetchDebts();
      } catch (error) {
        console.error('Failed to delete debt:', error);
      }
    }
  };

  const handleMarkPaid = async (debt) => {
    try {
      await debtAPI.update(debt.id, { isPaid: true });
      fetchDebts();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const formatCurrency = (amount) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Utang & Piutang</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingDebt(null);
              setFormData({
                type: 'owed',
                personName: '',
                amount: '',
                description: '',
                dueDate: ''
              });
            }}
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Tambah Catatan
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('owed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'owed'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Piutang
          </button>
          <button
            onClick={() => setFilter('owing')}
            className={`px-4 py-2 rounded-md ${
              filter === 'owing'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Utang
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-md ${
              filter === 'unpaid'
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Belum Lunas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                debt.isOverdue ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        debt.type === 'owed'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {debt.type === 'owed' ? 'Piutang' : 'Utang'}
                    </span>
                    {debt.isPaid && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Lunas
                      </span>
                    )}
                    {debt.isOverdue && !debt.isPaid && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center gap-1">
                        <FaExclamationTriangle /> Jatuh Tempo
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {debt.personName}
                  </h3>
                  {debt.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{debt.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(debt)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatCurrency(debt.amount)}
                </p>
                {debt.dueDate && (
                  <p className={`text-sm mt-2 ${
                    debt.isOverdue && !debt.isPaid
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Jatuh Tempo: {new Date(debt.dueDate).toLocaleDateString('id-ID')}
                    {debt.isOverdue && !debt.isPaid && (
                      <span className="ml-2">({debt.daysOverdue} hari terlambat)</span>
                    )}
                  </p>
                )}
                {debt.isPaid && debt.paidDate && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    <FaCheckCircle className="inline mr-1" />
                    Dibayar: {new Date(debt.paidDate).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
              {!debt.isPaid && (
                <button
                  onClick={() => handleMarkPaid(debt)}
                  className="w-full bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-600 dark:hover:bg-green-700"
                >
                  Tandai Lunas
                </button>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {editingDebt ? 'Edit Catatan' : 'Tambah Catatan'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="owed">Piutang (Orang berhutang ke saya)</option>
                    <option value="owing">Utang (Saya berhutang)</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Orang</label>
                  <input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Nama orang yang berhutang/berpiutang"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    rows="3"
                    placeholder="Keterangan (opsional)"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
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
                      setEditingDebt(null);
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

export default Debts;
