# Gunakan image Node.js
FROM node:22-alpine

WORKDIR /app

# Copy package frontend
COPY package*.json ./

RUN npm install

# Copy source code frontend
COPY . .

# Expose port default Vite (biasanya 5173)
EXPOSE 5173

# Jalankan dengan flag host agar bisa diakses dari browser host
CMD ["npm", "run", "dev", "--", "--host"]