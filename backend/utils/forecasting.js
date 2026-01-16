// Simple linear regression for forecasting
// Predicts end-of-month balance based on current spending patterns

export const forecastEndOfMonth = (currentBalance, dailyExpenses, daysRemaining) => {
  if (!dailyExpenses || dailyExpenses.length === 0) {
    return currentBalance;
  }

  // Calculate average daily expense
  const avgDailyExpense = dailyExpenses.reduce((a, b) => a + b, 0) / dailyExpenses.length;
  
  // Forecast: current balance - (avg daily expense * days remaining)
  const forecastedBalance = currentBalance - (avgDailyExpense * daysRemaining);
  
  return Math.max(0, forecastedBalance); // Don't go negative
};

export const calculateGoalProgress = (targetAmount, currentAmount, targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const daysRemaining = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    return {
      progress: 100,
      dailyNeeded: 0,
      monthlyNeeded: 0,
      isOnTrack: currentAmount >= targetAmount
    };
  }
  
  const remaining = targetAmount - currentAmount;
  const dailyNeeded = remaining / daysRemaining;
  const monthlyNeeded = dailyNeeded * 30;
  
  return {
    progress: (currentAmount / targetAmount) * 100,
    dailyNeeded,
    monthlyNeeded,
    daysRemaining,
    isOnTrack: dailyNeeded > 0 && remaining > 0
  };
};
