import { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, togglePrivacyMode } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);

  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (pin.length < 4) {
      setError('PIN harus minimal 4 karakter');
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await authAPI.setAppLockPin({ pin });
      setSuccess('PIN berhasil diset!');
      
      // Update user in localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.appLockPin = true; // Mark that PIN is set
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setPin('');
      setConfirmPin('');
      setShowPinForm(false);
      
      // Reload page to trigger AppLock
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal menyetel PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Pengaturan</h1>

        <div className="space-y-6">
          {/* App Lock */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="text-blue-500 dark:text-blue-400 text-2xl" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">App Lock</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Set PIN untuk melindungi aplikasi Anda. PIN akan diminta setiap kali aplikasi dibuka.
            </p>
            {user?.appLockPin ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-md">
                <p className="text-green-700 dark:text-green-400 font-semibold">
                  ✓ PIN sudah diset
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                <p className="text-yellow-700 dark:text-yellow-400">
                  PIN belum diset. Klik tombol di bawah untuk mengatur PIN.
                </p>
              </div>
            )}
            {!showPinForm ? (
              <button
                onClick={() => setShowPinForm(true)}
                className="mt-4 bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700"
              >
                {user?.appLockPin ? 'Ubah PIN' : 'Set PIN'}
              </button>
            ) : (
              <form onSubmit={handleSetPin} className="mt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PIN Baru (minimal 4 karakter)
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="••••"
                    maxLength="6"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi PIN
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="••••"
                    maxLength="6"
                    required
                  />
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 rounded">
                    {success}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinForm(false);
                      setPin('');
                      setConfirmPin('');
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Privacy Mode */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user?.privacyMode ? (
                  <FaEyeSlash className="text-blue-500 dark:text-blue-400 text-2xl" />
                ) : (
                  <FaEye className="text-blue-500 dark:text-blue-400 text-2xl" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Privacy Mode</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.privacyMode
                      ? 'Mode privasi aktif - Nominal uang disembunyikan'
                      : 'Mode privasi tidak aktif - Semua nominal ditampilkan'}
                  </p>
                </div>
              </div>
              <button
                onClick={togglePrivacyMode}
                className={`px-4 py-2 rounded-md font-semibold ${
                  user?.privacyMode
                    ? 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              >
                {user?.privacyMode ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
