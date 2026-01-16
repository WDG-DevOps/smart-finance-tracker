#!/bin/sh

# 1. Tunggu sampai Database (service 'db') siap di port 3306
echo "Menunggu koneksi database..."
# Loop terus sampai 'nc' (netcat) berhasil connect ke host 'db' port 3306
while ! nc -z db 3306; do
  sleep 1
done
echo "Database terhubung!"

# 2. Jalankan script create-db (Opsional: tambahkan logika agar tidak error jika DB sudah ada)
echo "Menjalankan inisialisasi database..."
npm run create-db

# 3. Jalankan aplikasi utama (sesuai script 'dev' di package.json)
echo "Memulai server..."
exec npm run dev