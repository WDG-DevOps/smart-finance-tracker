import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AppLock = ({ onUnlock, user }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if PIN is set in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (!userData.appLockPin) {
          onUnlock();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else if (!user?.appLockPin) {
      onUnlock();
    }
  }, [user, onUnlock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyAppLockPin({ pin });
      if (response.data) {
        onUnlock();
      }
    } catch (error) {
      setError('PIN salah. Silakan coba lagi.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">App Lock</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Masukkan PIN untuk membuka aplikasi
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Masukkan PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              placeholder="••••"
              maxLength="6"
              autoFocus
            />
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memverifikasi...' : 'Buka'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppLock;
