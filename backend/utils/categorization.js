// Smart Categorization using keyword matching
// In production, this could be enhanced with NLP/ML models like IndoBERT

const categoryKeywords = {
  'Makanan': ['makan', 'nasi', 'restoran', 'warung', 'kafe', 'bakso', 'sate', 'goreng', 'minum', 'kopi', 'jajan'],
  'Transportasi': ['grab', 'gojek', 'ojek', 'taxi', 'bensin', 'parkir', 'tol', 'kereta', 'bus', 'angkot'],
  'Belanja': ['belanja', 'supermarket', 'mall', 'swalayan', 'minimarket', 'indomaret', 'alfamart'],
  'Hiburan': ['nonton', 'bioskop', 'game', 'netflix', 'spotify', 'youtube', 'tiket'],
  'Tagihan': ['listrik', 'air', 'pdam', 'pln', 'wifi', 'internet', 'telepon', 'pulsa', 'paket data'],
  'Kesehatan': ['obat', 'dokter', 'rumah sakit', 'apotek', 'klinik', 'checkup', 'vitamin'],
  'Pendidikan': ['sekolah', 'kuliah', 'buku', 'kursus', 'les', 'pendidikan'],
  'Fashion': ['baju', 'celana', 'sepatu', 'tas', 'aksesoris', 'fashion'],
  'Gaji': ['gaji', 'salary', 'income', 'pendapatan'],
  'Lainnya': []
};

export const categorizeTransaction = (description) => {
  if (!description) return 'Lainnya';
  
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  
  return 'Lainnya';
};
