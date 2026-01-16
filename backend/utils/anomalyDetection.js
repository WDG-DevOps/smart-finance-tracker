// Simple anomaly detection based on statistical analysis
// Compares current spending against historical average

export const detectAnomaly = (currentAmount, historicalAmounts) => {
  if (!historicalAmounts || historicalAmounts.length === 0) {
    return { isAnomaly: false, reason: null };
  }

  const mean = historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
  const variance = historicalAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalAmounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Anomaly if current amount is more than 2 standard deviations from mean
  const threshold = mean + (2 * stdDev);
  
  if (currentAmount > threshold) {
    return {
      isAnomaly: true,
      reason: `Pengeluaran ini ${((currentAmount / mean - 1) * 100).toFixed(1)}% lebih tinggi dari rata-rata`,
      average: mean,
      current: currentAmount
    };
  }
  
  return { isAnomaly: false, reason: null };
};
