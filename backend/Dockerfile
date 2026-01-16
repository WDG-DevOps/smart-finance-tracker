# Gunakan image Node.js versi LTS
FROM node:22-alpine

# Set working directory di dalam container
WORKDIR /app

# Install netcat (nc) untuk pengecekan koneksi database di entrypoint
RUN apk add --no-cache netcat-openbsd

# Copy package.json dan lock file khusus backend
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code backend
COPY . .

# Berikan izin eksekusi pada script entrypoint
RUN chmod +x entrypoint.sh

# Expose port yang digunakan backend (misalnya 5000)
# Pastikan ini sesuai dengan server.js Anda
EXPOSE 5000

# Jalankan server
ENTRYPOINT ["./entrypoint.sh"]