CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS consultations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    symptoms TEXT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS diagnoses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT NOT NULL,
    diagnosis_text VARCHAR(255) NOT NULL,
    diagnosis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);

-- MODIFIKASI TABEL PRESCRIPTIONS UNTUK MERUJUK KE DIAGNOSES
-- Hati-hati jika tabel ini sudah ada dan ada data lama.
-- Jika ini adalah setup awal, Anda bisa langsung pakai ini.
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_id INT NOT NULL, -- Kolom baru
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id)
);

-- Tabel Health Monitorings
CREATE TABLE IF NOT EXISTS health_monitorings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_id INT NOT NULL,
    kota_kejadian VARCHAR(255) NOT NULL,
    monitoring_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id)
);
