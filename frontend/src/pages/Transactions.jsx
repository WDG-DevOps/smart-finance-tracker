import { useState, useEffect } from 'react';
import { transactionAPI, walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    walletId: '',
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, walletsRes] = await Promise.all([
        transactionAPI.getAll(),
        walletAPI.getAll()
      ]);
      setTransactions(transRes.data.transactions);
      setWallets(walletsRes.data.wallets);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown Wallet';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, formData, receiptFile);
      } else {
        await transactionAPI.create(formData, receiptFile);
      }
      setShowModal(false);
      setEditingTransaction(null);
      setReceiptFile(null);
      setReceiptPreview(null);
      setFormData({
        walletId: '',
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setReceiptFile(null);
    setReceiptPreview(null);
    setFormData({
      walletId: transaction.walletId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleViewDetail = (transaction) => {
    setViewingTransaction(transaction);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await transactionAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Transaksi</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingTransaction(null);
              setReceiptFile(null);
              setReceiptPreview(null);
              setFormData({
                walletId: wallets[0]?.id || '',
                type: 'expense',
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
              });
            }}
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Tambah Transaksi
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {new Date(transaction.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                      'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {transaction.type === 'income' ? 'Pendapatan' :
                       transaction.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{transaction.category}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{transaction.description || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(transaction)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        title="Lihat Detail"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* PERBAIKAN DI SINI: */}
            {/* 1. Menambahkan 'max-h-[90vh]' agar tinggi modal tidak melebihi 90% layar */}
            {/* 2. Menambahkan 'overflow-y-auto' agar konten di dalam modal bisa discroll */}
            {/* 3. Menambahkan 'flex flex-col' agar struktur rapi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-xl">
              
              {/* Header Modal - dibuat sticky agar tetap terlihat saat scroll (opsional, tapi bagus untuk UX) */}
              <div className="p-6 pb-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h2>
              </div>

              {/* Body Modal */}
              <div className="p-6 pt-2">
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
                  
                  {/* ... Input lainnya (Tipe, Kategori, Jumlah, Deskripsi, Tanggal) tetap sama ... */}
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
                      placeholder="Contoh: Makanan, Transportasi"
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Bukti (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    />
                    {receiptPreview && (
                      <div className="mt-3">
                        <img
                          src={receiptPreview}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                    )}
                    {editingTransaction?.receiptImage && !receiptPreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Foto saat ini:</p>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${editingTransaction.receiptImage}`}
                          alt="Current receipt"
                          className="w-full h-48 object-contain rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tombol Action */}
                  <div className="flex gap-3 pt-2 border-t dark:border-gray-700 mt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 font-medium transition-colors shadow-sm"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTransaction(null);
                        setReceiptFile(null);
                        setReceiptPreview(null);
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal View Detail */} 
        {viewingTransaction && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            {/* PERBAIKAN: Gunakan flex-col dan max-h-[90vh] pada container utama */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
              
              {/* 1. HEADER (Sticky Top) - Agar tombol close selalu terlihat & mudah dijangkau */}
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Detail Transaksi
                </h2>
                <button 
                  onClick={() => setViewingTransaction(null)}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 rounded-full p-2 transition-colors"
                  title="Tutup"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* 2. KONTEN (Scrollable) - Gunakan overflow-y-auto disini */}
              <div className="overflow-y-auto flex-1">
                <div className="flex flex-col md:flex-row min-h-full">
                  
                  {/* Bagian Kiri: Informasi Teks */}
                  <div className="w-full md:w-5/12 p-6 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
                    
                    {/* Hero Section: Jumlah Uang */}
                    <div className={`p-6 rounded-2xl text-center border ${
                      viewingTransaction.type === 'income' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                    }`}>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {viewingTransaction.type === 'income' ? 'Total Pendapatan' : 'Total Pengeluaran'}
                      </p>
                      <span className={`text-2xl md:text-4xl font-extrabold ${
                        viewingTransaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                          {viewingTransaction.type === 'income' ? '+' : '-'} {formatCurrency(viewingTransaction.amount)}
                      </span>
                    </div>

                    {/* Grid Informasi */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tanggal</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {new Date(viewingTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Kategori</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {viewingTransaction.category}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Deskripsi</p>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {viewingTransaction.description || 'Tidak ada catatan tambahan.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian Kanan: Gambar Bukti */}
                  <div className="w-full md:w-7/12 bg-gray-50 dark:bg-black/20 p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {viewingTransaction.receiptImage ? (
                      <div className="w-full flex flex-col items-center">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3 md:hidden">Bukti Transaksi</p>
                          <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full max-w-sm md:max-w-full">
                            {/* Menggunakan URL dari ENV */}
                            <img 
                              src={`${import.meta.env.VITE_API_URL}/uploads/${viewingTransaction.receiptImage}`} 
                              alt="Bukti Transaksi" 
                              className="w-full h-auto max-h-[50vh] object-contain bg-gray-100 dark:bg-gray-900"
                            />
                          </div>
                          <a 
                            href={`${import.meta.env.VITE_API_URL}/uploads/${viewingTransaction.receiptImage}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 text-sm text-blue-600 dark:text-blue-400 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                          >
                            <FaEye /> Buka Gambar Asli
                          </a>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 flex flex-col items-center opacity-50">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <FaEye size={32} />
                        </div>
                        <p className="text-sm">Tidak ada bukti foto</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
