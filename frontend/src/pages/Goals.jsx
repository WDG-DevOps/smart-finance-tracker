import { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaBullseye } from 'react-icons/fa';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalAPI.update(editingGoal.id, formData);
      } else {
        await goalAPI.create(formData);
      }
      setShowModal(false);
      setEditingGoal(null);
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        description: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleAddAmount = async (goalId) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('Masukkan jumlah yang valid');
      return;
    }
    try {
      await goalAPI.addAmount(goalId, parseFloat(addAmount));
      setShowAddModal(false);
      setAddAmount('');
      fetchGoals();
    } catch (error) {
      console.error('Failed to add amount:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      description: goal.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus goal ini?')) {
      try {
        await goalAPI.delete(id);
        fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Financial Goals</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingGoal(null);
              setFormData({
                name: '',
                targetAmount: '',
                targetDate: '',
                description: ''
              });
            }}
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Tambah Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBullseye className="text-purple-500 dark:text-purple-400 text-2xl" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goal.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                  <span>Terkumpul: {formatCurrency(goal.currentAmount)}</span>
                  <span>Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-purple-500 dark:bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, goal.progress)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {goal.progress.toFixed(1)}% tercapai
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  Sisa: <span className="font-semibold">
                    {formatCurrency(goal.targetAmount - goal.currentAmount)}
                  </span>
                </p>
                {goal.isOnTrack && goal.daysRemaining > 0 && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Perlu tabung: <span className="font-semibold">
                      {formatCurrency(goal.dailyNeeded)}/hari
                    </span>
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-400">
                  Target: {new Date(goal.targetDate).toLocaleDateString('id-ID')}
                </p>
                {goal.isCompleted && (
                  <p className="text-green-600 dark:text-green-400 font-semibold">✓ Goal Tercapai!</p>
                )}
              </div>

              <button
                onClick={() => {
                  setShowAddModal(true);
                  setEditingGoal(goal);
                }}
                className="w-full mt-4 bg-purple-500 dark:bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-600 dark:hover:bg-purple-700"
              >
                Tambah Tabungan
              </button>
            </div>
          ))}
        </div>

        {/* Add/Edit Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {editingGoal ? 'Edit Goal' : 'Tambah Goal'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Goal</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Contoh: Beli Laptop"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Jumlah</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Tanggal</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
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
                    placeholder="Keterangan tambahan (opsional)"
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
                      setEditingGoal(null);
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

        {/* Add Amount Modal */}
        {showAddModal && editingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Tambah Tabungan</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Goal: {editingGoal.name}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  placeholder="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddAmount(editingGoal.id)}
                  className="flex-1 bg-purple-500 dark:bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-600 dark:hover:bg-purple-700"
                >
                  Tambah
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    setAddAmount('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
