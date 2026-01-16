# Smart Finance Tracker

Aplikasi manajemen keuangan pribadi yang komprehensif dengan fitur AI, OCR, dan analitik canggih.

## 🚀 Fitur Utama

### 1. Modul Transaksi & Manajemen Akun
- **Multi-Wallet System**: Kelola banyak dompet (Cash, Bank, E-Wallet, Kartu Kredit)
- **Pencatatan Transaksi**: CRUD lengkap untuk income/expense dengan foto bukti
- **Transfer Antar Akun**: Pindahkan saldo antar dompet tanpa dianggap pengeluaran
- **Recurring Transactions**: Otomatis catat tagihan bulanan
- **Manajemen Utang & Piutang**: Tracking lengkap dengan jatuh tempo

### 2. Modul Smart Budgeting & Planning
- **Budgeting per Kategori**: Set batas maksimal pengeluaran per kategori
- **Visual Progress Bar**: Monitor persentase pemakaian budget
- **Financial Goals**: Target tabungan dengan perhitungan otomatis
- **Kalender Keuangan**: Tampilan kalender untuk tagihan dan gaji

### 3. Modul AI & Otomatisasi
- **Smart Categorization**: AI otomatis mengkategorikan transaksi
- **Receipt Scanning (OCR)**: Ekstrak data dari foto struk
- **Anomaly Detection**: Alert pengeluaran tidak wajar
- **Forecasting**: Prediksi saldo akhir bulan

### 4. Modul Laporan & Analitik
- **Dashboard Interaktif**: Grafik pie chart dan line chart
- **Laporan Net Worth**: Tracking kekayaan bersih
- **Comparison**: Bandingkan pengeluaran bulan ini vs bulan lalu
- **Export Data**: Download laporan PDF/Excel (coming soon)

### 5. Modul Keamanan & Privasi
- **App Lock**: PIN protection
- **Privacy Mode**: Sembunyikan nominal uang di tempat umum
- **End-to-End Encryption**: Enkripsi data sensitif
- **Session Management**: Auto-logout setelah tidak aktif

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL dengan Sequelize ORM
- Socket.io untuk real-time
- JWT + Bcrypt untuk autentikasi
- Tesseract.js untuk OCR

### Frontend
- React.js dengan Vite
- Tailwind CSS untuk styling
- React Context untuk state management
- Axios untuk HTTP client
- Recharts untuk visualisasi data

## 📦 Instalasi

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm atau yarn

### Backend Setup

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```

4. Edit file `.env` dan isi konfigurasi database:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_finance_tracker
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_TIMEOUT=30
```

5. Buat database:
```bash
npm run create-db
```

6. Jalankan server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Frontend Setup

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` (opsional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📁 Struktur Project

```
smart-finance-tracker/
├── backend/
│   ├── config/          # Konfigurasi database
│   ├── controllers/      # Business logic
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth, upload, dll
│   ├── services/         # OCR service
│   ├── utils/            # Helper functions
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context
│   │   ├── services/     # API services
│   │   └── App.jsx       # Main app
│   └── public/           # Static files
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/app-lock/pin` - Set PIN
- `POST /api/auth/app-lock/verify` - Verify PIN
- `POST /api/auth/privacy-mode/toggle` - Toggle privacy mode

### Wallets
- `GET /api/wallets` - Get all wallets
- `POST /api/wallets` - Create wallet
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Goals
- `GET /api/goals` - Get goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `POST /api/goals/:id/add` - Add amount to goal

### Debts
- `GET /api/debts` - Get debts
- `POST /api/debts` - Create debt
- `PUT /api/debts/:id` - Update debt
- `GET /api/debts/upcoming` - Get upcoming debts

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/cash-flow` - Get cash flow data
- `GET /api/analytics/category-report` - Get category report

### OCR
- `POST /api/ocr/scan` - Scan receipt image

## 🎯 Penggunaan

1. **Register/Login**: Buat akun baru atau login
2. **Buat Dompet**: Tambah dompet pertama Anda
3. **Catat Transaksi**: Mulai mencatat income dan expense
4. **Set Budget**: Buat budget untuk kategori tertentu
5. **Buat Goal**: Tentukan target tabungan
6. **Lihat Dashboard**: Monitor keuangan Anda secara real-time

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt
- JWT token untuk autentikasi
- End-to-end encryption untuk data sensitif
- Session timeout otomatis
- App lock dengan PIN

## 🚧 Development

### Menjalankan dalam mode development:
```bash
# Backend
cd backend && npm run dev

# Frontend (terminal baru)
cd frontend && npm run dev
```

### Build untuk production:
```bash
# Frontend
cd frontend && npm run build
```

## 📝 Catatan

- Pastikan MySQL sudah berjalan sebelum menjalankan backend
- Untuk production, ubah `NODE_ENV=production` dan gunakan database yang aman
- Generate `ENCRYPTION_KEY` yang kuat (32 karakter)
- Generate `JWT_SECRET` yang unik dan aman

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk kontribusi.

## 📄 License

MIT License
