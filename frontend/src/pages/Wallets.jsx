import { useState, useEffect } from 'react';
import { walletAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaExchangeAlt } from 'react-icons/fa';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Cash',
    balance: '',
    currency: 'IDR'
  });
  const [transferData, setTransferData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await walletAPI.getAll();
      setWallets(response.data.wallets);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWallet) {
        await walletAPI.update(editingWallet.id, formData);
      } else {
        await walletAPI.create(formData);
      }
      setShowModal(false);
      setEditingWallet(null);
      setFormData({ name: '', type: 'Cash', balance: '', currency: 'IDR' });
      fetchWallets();
    } catch (error) {
      console.error('Failed to save wallet:', error);
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      currency: wallet.currency
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dompet ini?')) {
      try {
        await walletAPI.delete(id);
        fetchWallets();
      } catch (error) {
        console.error('Failed to delete wallet:', error);
      }
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.create({
        walletId: transferData.fromWalletId,
        type: 'transfer',
        amount: transferData.amount,
        description: transferData.description || `Transfer ke ${wallets.find(w => w.id === parseInt(transferData.toWalletId))?.name || ''}`,
        transferToWalletId: transferData.toWalletId,
        date: new Date().toISOString().split('T')[0]
      });
      setShowTransferModal(false);
      setTransferData({
        fromWalletId: '',
        toWalletId: '',
        amount: '',
        description: ''
      });
      fetchWallets();
      alert('Transfer berhasil!');
    } catch (error) {
      console.error('Failed to transfer:', error);
      alert('Transfer gagal: ' + (error.response?.data?.error || 'Terjadi kesalahan'));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dompet</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowTransferModal(true);
                setTransferData({
                  fromWalletId: wallets[0]?.id || '',
                  toWalletId: '',
                  amount: '',
                  description: ''
                });
              }}
              className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 flex items-center gap-2"
            >
              <FaExchangeAlt /> Transfer
            </button>
            <button
              onClick={() => {
                setShowModal(true);
                setEditingWallet(null);
                setFormData({ name: '', type: 'Cash', balance: '', currency: 'IDR' });
              }}
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Tambah Dompet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaWallet className="text-blue-500 dark:text-blue-400 text-2xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Saldo</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {editingWallet ? 'Edit Dompet' : 'Tambah Dompet'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Dompet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Contoh: Dompet Utama"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saldo Awal</label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mata Uang</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
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
                      setEditingWallet(null);
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

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Transfer Antar Dompet</h2>
              <form onSubmit={handleTransfer}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dari Dompet</label>
                  <select
                    value={transferData.fromWalletId}
                    onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="">Pilih Dompet Sumber</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ke Dompet</label>
                  <select
                    value={transferData.toWalletId}
                    onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="">Pilih Dompet Tujuan</option>
                    {wallets
                      .filter(w => w.id !== parseInt(transferData.fromWalletId))
                      .map(wallet => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} - {formatCurrency(wallet.balance)}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah</label>
                  <input
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keterangan (Opsional)</label>
                  <input
                    type="text"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Keterangan transfer"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-600 dark:hover:bg-green-700"
                  >
                    Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferData({
                        fromWalletId: '',
                        toWalletId: '',
                        amount: '',
                        description: ''
                      });
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

export default Wallets;
