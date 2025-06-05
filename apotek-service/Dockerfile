# Gunakan base image Node.js yang ringan
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies aplikasi
RUN npm install --production

# Copy semua file dari direktori lokal ke direktori kerja di container
COPY . .

# Expose port yang digunakan oleh aplikasi
EXPOSE 3002

# Perintah untuk menjalankan aplikasi saat container dijalankan
CMD [ "node", "index.js" ]