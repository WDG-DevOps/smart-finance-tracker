import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaHome, 
  FaWallet, 
  FaExchangeAlt, 
  FaChartPie, 
  FaBullseye,
  FaSignOutAlt,
  FaCog,
  FaMoon,
  FaSun,
  FaCalendarAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/wallets', icon: FaWallet, label: 'Dompet' },
    { path: '/transactions', icon: FaExchangeAlt, label: 'Transaksi' },
    { path: '/recurring', icon: FaCalendarAlt, label: 'Berulang' },
    { path: '/debts', icon: FaExchangeAlt, label: 'Utang & Piutang' },
    { path: '/calendar', icon: FaCalendarAlt, label: 'Kalender' },
    { path: '/budgets', icon: FaChartPie, label: 'Budget' },
    { path: '/goals', icon: FaBullseye, label: 'Goals' },
    { path: '/settings', icon: FaCog, label: 'Pengaturan' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header (Hanya muncul di layar kecil) */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-30 fixed top-0 w-full">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">Smart Finance</span>
        </div>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
           {user?.username}
        </div>
      </div>

      {/* Overlay Backdrop (Untuk Mobile saat sidebar terbuka) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg z-50 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:h-screen md:shrink-0
          ${!isSidebarOpen && 'md:hidden'} 
        `}>
        <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40">
          <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Smart Finance</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tracker</p>
            </div>
            <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="md:hidden text-gray-500 hover:text-red-500"
              >
              <FaTimes />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 w-full p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{user?.fullName || user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md mb-2"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-20 md:pt-0 overflow-x-hidden">
        {/* Tombol Toggle Sidebar untuk Desktop (Opsional, letakkan di pojok kiri atas konten) */}
        <div className="hidden md:block p-4">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="text-gray-500 hover:text-blue-600 transition-colors"
             title="Toggle Sidebar"
           >
             <FaBars size={20}/>
           </button>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
