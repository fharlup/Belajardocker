const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'a',
    database: process.env.DB_NAME || 'hospital_db'
};
let pool;
async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.query('SELECT 1');
        console.log('Koneksi ke database hospital berhasil.');
    } catch (error) {
        console.error('Gagal koneksi ke database:', error.message);
        process.exit(1);
    }
}

// BAGIAN MODEL
async function fetchAllFromTable(tableName) { }
async function getPatientById(id) { }
async function createPatient(data) { }
async function createConsultation(data) { }
async function createDoctor(data) { }
async function createPrescription(data) { }

// --- FUNGSI BARU UNTUK INTEGRASI ---
// Model untuk mengambil detail pasien lengkap dengan riwayatnya
async function getPatientDetailsById(id) {
    const query = `
        SELECT 
            p.id as patient_id, p.name as patient_name, p.age, p.address,
            c.id as consultation_id, c.symptoms, c.diagnosis, c.date as consultation_date,
            d.name as doctor_name,
            pr.medicine_name, pr.dosage
        FROM patients p
        LEFT JOIN consultations c ON p.id = c.patient_id
        LEFT JOIN doctors d ON c.doctor_id = d.id
        LEFT JOIN prescriptions pr ON c.id = pr.consultation_id
        WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows;
}


// BAGIAN CONTROLLER
function createGetAllController(tableName) { }
async function handleGetPatientById(req, res) { }
function createPostController(modelFunction, requiredFields = []) { }
async function getObatFromApotek(req, res) { }


// Controller untuk MENYEDIAKAN data detail pasien
async function handleGetPatientDetailsById(req, res) {
    try {
        const { id } = req.params;
        const details = await getPatientDetailsById(id);
        if (details.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Patient not found or no history' });
        }
        res.status(200).json({ status: 'success', data: details });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// Controller untuk MEMANGGIL Apotek service dan mengecek stok
async function handleCheckApotekStock(req, res) {
    try {
        const { id } = req.params; // ID obat yang mau dicek
        const apotekServiceUrl = `http://apotek-service:3002/obat/${id}/stock`;
        const response = await axios.get(apotekServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to check stock from apotek service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}

// BAGIAN ROUTES
app.get('/patients', createGetAllController('patients'));
app.get('/patients/:id', handleGetPatientById);
app.get('/consultations', createGetAllController('consultations'));
app.get('/doctors', createGetAllController('doctors'));
app.get('/prescriptions', createGetAllController('prescriptions'));
app.get('/obat-from-apotek', getObatFromApotek); // Integrasi #1

// --- RUTE BARU UNTUK INTEGRASI ---
app.get('/patients/:id/details', handleGetPatientDetailsById); // Menyediakan data untuk Apotek (Integrasi #2)
app.get('/check-stock/:id', handleCheckApotekStock); // Memanggil Apotek (Integrasi #2)

// --- POST Endpoints  ---
app.post('/patients', createPostController(createPatient, ['name', 'age', 'address', 'phone']));
app.post('/consultations', createPostController(createConsultation, ['patient_id', 'doctor_id', 'symptoms', 'diagnosis', 'date']));
app.post('/doctors', createPostController(createDoctor, ['name', 'specialization']));
app.post('/prescriptions', createPostController(createPrescription, ['consultation_id', 'medicine_name', 'dosage']));

// Health check dan 404 handler 
app.get('/health', (req, res) => { res.status(200).json({ status: 'UP', service: 'Hospital Service' }); });
app.use((req, res) => { res.status(404).json({ status: 'error', message: 'Endpoint not found' }); });

// MENJALANKAN SERVER 
async function startServer() { await initDb(); app.listen(PORT, () => console.log(`Hospital service berjalan di http://localhost:${PORT}`)); }
startServer();

async function fetchAllFromTable(tableName) { const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]); return rows; }
async function getPatientById(id) { const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]); return rows[0]; }
async function createPatient(data) { const { name, age, address, phone } = data; const [result] = await pool.query('INSERT INTO patients (name, age, address, phone) VALUES (?, ?, ?, ?)', [name, age, address, phone]); return { id: result.insertId, ...data }; }
async function createConsultation(data) { const { patient_id, doctor_id, symptoms, diagnosis, date } = data; const [result] = await pool.query('INSERT INTO consultations (patient_id, doctor_id, symptoms, diagnosis, date) VALUES (?, ?, ?, ?, ?)', [patient_id, doctor_id, symptoms, diagnosis, date]); return { id: result.insertId, ...data }; }
async function createDoctor(data) { const { name, specialization } = data; const [result] = await pool.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)', [name, specialization]); return { id: result.insertId, ...data }; }
async function createPrescription(data) { const { consultation_id, medicine_name, dosage } = data; const [result] = await pool.query('INSERT INTO prescriptions (consultation_id, medicine_name, dosage) VALUES (?, ?, ?)', [consultation_id, medicine_name, dosage]); return { id: result.insertId, ...data }; }
function createGetAllController(tableName) { return async (req, res) => { try { const data = await fetchAllFromTable(tableName); res.status(200).json({ status: 'success', data: data }); } catch (error) { res.status(500).json({ status: 'error', message: error.message }); } }; }
async function handleGetPatientById(req, res) { try { const { id } = req.params; const patient = await getPatientById(id); if (patient) { res.status(200).json({ status: 'success', data: patient }); } else { res.status(404).json({ status: 'error', message: 'Patient not found' }); } } catch (error) { res.status(500).json({ status: 'error', message: error.message }); } }
function createPostController(modelFunction, requiredFields = []) { return async (req, res) => { if (!req.body) { return res.status(400).json({ status: 'error', message: 'Invalid JSON' }); } for (const field of requiredFields) { if (req.body[field] === undefined || req.body[field] === '') { return res.status(400).json({ status: 'error', message: `Field ${field} is required` }); } } try { const newData = await modelFunction(req.body); res.status(201).json({ status: 'success', data: newData }); } catch (error) { res.status(500).json({ status: 'error', message: error.message }); } }; }
async function getObatFromApotek(req, res) { try { const apotekServiceUrl = 'http://apotek-service:3002/obat'; const response = await axios.get(apotekServiceUrl); res.status(200).json(response.data); } catch (error) { const message = error.response ? error.response.data.message : 'Failed to fetch obat data from apotek service'; const statusCode = error.response ? error.response.status : 500; res.status(statusCode).json({ status: 'error', message }); } }