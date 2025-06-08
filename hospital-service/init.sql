-- Tabel Pasien (Tidak ada perubahan)
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT,
  address VARCHAR(255),
  phone VARCHAR(20)
);

-- Tabel Dokter (Tidak ada perubahan)
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  specialization VARCHAR(100)
);

-- Tabel Konsultasi (Tidak ada perubahan struktur, tapi alur akan disesuaikan)
-- Diagnosis awalnya akan NULL dan diisi oleh diagnosaService.
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  symptoms TEXT,
  diagnosis TEXT, -- Awalnya bisa NULL
  date DATE,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Tabel Resep Obat (Tidak ada perubahan)
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT,
  medicine_name VARCHAR(100),
  dosage VARCHAR(50),
  FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);

-- !! TABEL BARU untuk Health Monitoring !!
CREATE TABLE IF NOT EXISTS health_monitoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT UNIQUE, -- Satu konsultasi hanya punya satu laporan lokasi kejadian
  city_of_incident VARCHAR(100), -- Kolom untuk 'kotaKejadian'
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);
CREATE TABLE IF NOT EXISTS health_monitoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT UNIQUE NOT NULL,
  city_of_incident VARCHAR(100) NOT NULL,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);