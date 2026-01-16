import { useState, useEffect } from 'react';
import { transactionAPI, recurringAPI, debtAPI } from '../services/api';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';

// Helper function to format date as YYYY-MM-DD in local timezone (without timezone conversion)
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to extract date string from ISO date string (handles timezone)
const extractDateString = (dateString) => {
  if (!dateString) return null;
  // If it's already in YYYY-MM-DD format
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  // If it's in ISO format with time, extract date part
  return dateString.split('T')[0];
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [debts, setDebts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      loadDateEvents(selectedDate);
    }
  }, [selectedDate, transactions, recurring, debts]);

  const fetchData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const [transRes, recurringRes, debtsRes] = await Promise.all([
        transactionAPI.getAll({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
        recurringAPI.getAll(),
        debtAPI.getUpcoming(60)
      ]);

      setTransactions(transRes.data.transactions || []);
      setRecurring(recurringRes.data.recurring || []);
      setDebts(debtsRes.data.debts || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    }
  };

  const loadDateEvents = (date) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/54fdc3b2-b1ee-420e-bd1f-907321fb2705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Calendar.jsx:66',message:'loadDateEvents called',data:{selectedDateISO:date.toISOString(),selectedDateLocal:formatDateLocal(date),selectedDateLocalParts:{year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate()}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const dateStr = formatDateLocal(date);
    const events = [];

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/54fdc3b2-b1ee-420e-bd1f-907321fb2705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Calendar.jsx:72',message:'Filtering transactions',data:{dateStr,transactionsCount:transactions.length,transactionDates:transactions.slice(0,5).map(t=>({id:t.id,date:t.date,dateExtracted:extractDateString(t.date)}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Transactions
    transactions
      .filter(t => {
        const transactionDate = extractDateString(t.date);
        const matches = transactionDate === dateStr;
        // #region agent log
        if (transactions.indexOf(t) < 3) {
          fetch('http://127.0.0.1:7243/ingest/54fdc3b2-b1ee-420e-bd1f-907321fb2705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Calendar.jsx:80',message:'Comparing transaction date',data:{dateStr,transactionDate,transactionRaw:t.date,matches},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        return matches;
      })
      .forEach(t => {
        events.push({
          type: 'transaction',
          title: t.category,
          amount: t.amount,
          transactionType: t.type,
          description: t.description
        });
      });

    // Recurring transactions
    recurring
      .filter(r => {
        const dueDate = extractDateString(r.nextDueDate);
        return dueDate === dateStr;
      })
      .forEach(r => {
        events.push({
          type: 'recurring',
          title: r.category,
          amount: r.amount,
          transactionType: r.type,
          description: r.description
        });
      });

    // Debts
    debts
      .filter(d => {
        if (!d.dueDate) return false;
        const dueDate = extractDateString(d.dueDate);
        return dueDate === dateStr;
      })
      .forEach(d => {
        events.push({
          type: 'debt',
          title: `${d.type === 'owed' ? 'Piutang' : 'Utang'} - ${d.personName}`,
          amount: d.amount,
          description: d.description
        });
      });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/54fdc3b2-b1ee-420e-bd1f-907321fb2705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Calendar.jsx:120',message:'Events loaded',data:{dateStr,eventsCount:events.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    setSelectedDateEvents(events);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const hasEvent = (date) => {
    if (!date) return false;
    const dateStr = formatDateLocal(date);
    
    // #region agent log
    if (Math.random() < 0.1) { // Log 10% of checks to avoid spam
      fetch('http://127.0.0.1:7243/ingest/54fdc3b2-b1ee-420e-bd1f-907321fb2705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Calendar.jsx:145',message:'hasEvent check',data:{dateISO:date.toISOString(),dateLocal:dateStr,dateParts:{year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate()}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    
    const hasTransaction = transactions.some(t => {
      const transactionDate = extractDateString(t.date);
      return transactionDate === dateStr;
    });
    
    return (
      hasTransaction ||
      recurring.some(r => extractDateString(r.nextDueDate) === dateStr) ||
      debts.some(d => d.dueDate && extractDateString(d.dueDate) === dateStr)
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const days = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FaCalendarAlt /> Kalender Keuangan
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <FaArrowRight className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2 text-sm"
                >
                  {day.substring(0, 3)}
                </div>
              ))}
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>;
                }
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const hasEventOnDay = hasEvent(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-md border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : isToday
                        ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    } ${hasEventOnDay ? 'font-bold' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-sm ${
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400'
                            : isToday
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {hasEventOnDay && (
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {selectedDate
                ? `Event pada ${selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`
                : 'Pilih tanggal untuk melihat event'}
            </h3>
            {selectedDate && (
              <div className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada event pada tanggal ini</p>
                ) : (
                  selectedDateEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {event.description}
                            </p>
                          )}
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                              event.type === 'transaction'
                                ? event.transactionType === 'income'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : event.type === 'recurring'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}
                          >
                            {event.type === 'transaction' && 'Transaksi'}
                            {event.type === 'recurring' && 'Tagihan Berulang'}
                            {event.type === 'debt' && 'Utang/Piutang'}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 ml-4">
                          {formatCurrency(event.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
