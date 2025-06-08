// =================================================================
// BAGIAN 1: SETUP & KONEKSI DATABASE
// =================================================================
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios'); // Penting untuk integrasi

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Konfigurasi Database
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'a', 
    database: process.env.DB_NAME || 'hospital_db',
    connectionLimit: 10
};

let pool;

// Fungsi untuk inisialisasi koneksi database
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

// =================================================================
// BAGIAN 2: MODEL (Logika & Interaksi Database)
// =================================================================

// Helper function untuk mengecek keberadaan ID
async function checkIdExists(tableName, id) {
    const [rows] = await pool.query(`SELECT id FROM ?? WHERE id = ? LIMIT 1`, [tableName, id]);
    return rows.length > 0;
}

// --- CRUD Models: Patients ---
async function createPatient(data) {
    const { name, age, address, phone } = data;
    const [result] = await pool.query('INSERT INTO patients (name, age, address, phone) VALUES (?, ?, ?, ?)', [name, age, address, phone]);
    return { id: result.insertId, ...data };
}
async function updatePatient(id, data) {
    const { name, age, address, phone } = data;
    const [result] = await pool.query('UPDATE patients SET name = ?, age = ?, address = ?, phone = ? WHERE id = ?', [name, age, address, phone, id]);
    return result.affectedRows;
}

// --- CRUD Models: Doctors ---
async function createDoctor(data) {
    const { name, specialization } = data;
    const [result] = await pool.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)', [name, specialization]);
    return { id: result.insertId, ...data };
}
async function updateDoctor(id, data) {
    const { name, specialization } = data;
    const [result] = await pool.query('UPDATE doctors SET name = ?, specialization = ? WHERE id = ?', [name, specialization, id]);
    return result.affectedRows;
}

// --- CRUD Models: Consultations ---
async function createConsultation(data) {
    const { patient_id, doctor_id, symptoms, date } = data;
    if (!await checkIdExists('patients', patient_id)) throw new Error(`Patient with ID ${patient_id} not found.`);
    if (!await checkIdExists('doctors', doctor_id)) throw new Error(`Doctor with ID ${doctor_id} not found.`);
    const [result] = await pool.query('INSERT INTO consultations (patient_id, doctor_id, symptoms, date) VALUES (?, ?, ?, ?)', [patient_id, doctor_id, symptoms, date]);
    return { id: result.insertId, ...data };
}
async function updateConsultation(id, data) {
    const { patient_id, doctor_id, symptoms, diagnosis, date } = data;
    const [result] = await pool.query('UPDATE consultations SET patient_id = ?, doctor_id = ?, symptoms = ?, diagnosis = ?, date = ? WHERE id = ?', [patient_id, doctor_id, symptoms, diagnosis, date, id]);
    return result.affectedRows;
}

// --- CRUD Models: Prescriptions ---
async function createPrescription(data) {
    const { consultation_id, medicine_name, dosage } = data;
    if (!await checkIdExists('consultations', consultation_id)) throw new Error(`Consultation with ID ${consultation_id} not found.`);
    const [result] = await pool.query('INSERT INTO prescriptions (consultation_id, medicine_name, dosage) VALUES (?, ?, ?)', [consultation_id, medicine_name, dosage]);
    return { id: result.insertId, ...data };
}
async function updatePrescription(id, data) {
    const { consultation_id, medicine_name, dosage } = data;
    const [result] = await pool.query('UPDATE prescriptions SET consultation_id = ?, medicine_name = ?, dosage = ? WHERE id = ?', [consultation_id, medicine_name, dosage, id]);
    return result.affectedRows;
}

// --- Model Generik untuk READ & DELETE ---
async function fetchAllFromTable(tableName) { 
    const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]);
    return rows;
}
async function fetchById(tableName, id) {
    const [rows] = await pool.query(`SELECT * FROM ?? WHERE id = ?`, [tableName, id]);
    return rows[0];
}
async function deleteById(tableName, id) {
    const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
    return result.affectedRows;
}

// --- MODEL UNTUK INTEGRASI ---
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
    if (rows.length === 0) return null;

    // Strukturisasi data agar lebih rapi
    const patientData = {
        patient_id: rows[0].patient_id,
        patient_name: rows[0].patient_name,
        age: rows[0].age,
        address: rows[0].address,
        history: []
    };
    
    const consultations = {};
    rows.forEach(row => {
        if (!row.consultation_id) return;
        if (!consultations[row.consultation_id]) {
            consultations[row.consultation_id] = {
                consultation_id: row.consultation_id,
                symptoms: row.symptoms,
                diagnosis: row.diagnosis,
                consultation_date: row.consultation_date,
                doctor_name: row.doctor_name,
                prescriptions: []
            };
        }
        if (row.medicine_name) {
            consultations[row.consultation_id].prescriptions.push({
                medicine_name: row.medicine_name,
                dosage: row.dosage
            });
        }
    });

    patientData.history = Object.values(consultations);
    return patientData;
}

// =================================================================
// BAGIAN 3: CONTROLLER (Penghubung Route dan Model)
// =================================================================

// --- Controller Generik untuk CRUD ---
const createGetAllController=(t)=>async(q,s)=>{try{const d=await fetchAllFromTable(t);s.status(200).json({status:'success',data:d})}catch(e){s.status(500).json({status:'error',message:e.message})}};const createGetByIdController=(t)=>async(q,s)=>{try{const{id}=q.params;const d=await fetchById(t,id);d?s.status(200).json({status:'success',data:d}):s.status(404).json({status:'error',message:`${t.slice(0,-1)} not found`})}catch(e){s.status(500).json({status:'error',message:e.message})}};const createPostController=(m,f=[])=>async(q,s)=>{if(!q.body)return s.status(400).json({status:'error',message:'Invalid JSON'});for(const e of f)if(q.body[e]===undefined||q.body[e]==='')return s.status(400).json({status:'error',message:`Field '${e}' is required`});try{const d=await m(q.body);s.status(201).json({status:'success',data:d})}catch(e){e.message.includes('not found')?s.status(404).json({status:'error',message:e.message}):s.status(500).json({status:'error',message:e.message})}};const createUpdateController=(m,f=[])=>async(q,s)=>{try{const{id}=q.params;if(!q.body)return s.status(400).json({status:'error',message:'Invalid JSON'});for(const e of f)if(q.body[e]===undefined||q.body[e]==='')return s.status(400).json({status:'error',message:`Field '${e}' is required`});const a=await m(id,q.body);a>0?s.status(200).json({status:'success',data:await fetchById(q.params.tableName,id)}):s.status(404).json({status:'error',message:'Record not found'})}catch(e){s.status(500).json({status:'error',message:e.message})}};const createDeleteController=(t)=>async(q,s)=>{try{const{id}=q.params;const a=await deleteById(t,id);a>0?s.status(200).json({status:'success',message:'Record deleted successfully'}):s.status(404).json({status:'error',message:'Record not found'})}catch(e){s.status(500).json({status:'error',message:e.message})}};

// --- CONTROLLER UNTUK INTEGRASI ---

// Controller untuk MENYEDIAKAN data detail pasien untuk layanan lain
async function handleGetPatientDetailsById(req, res) {
    try {
        const { id } = req.params;
        const details = await getPatientDetailsById(id);
        if (!details) {
            return res.status(404).json({ status: 'error', message: 'Patient not found or has no history' });
        }
        res.status(200).json({ status: 'success', data: details });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// Controller untuk MEMANGGIL Apotek Service (mendapatkan semua obat)
async function getObatFromApotek(req, res) {
    try {
        const apotekServiceUrl = 'http://apotek-service:3002/obat'; 
        const response = await axios.get(apotekServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to fetch data from apotek service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}

// Controller untuk MEMANGGIL Apotek Service (mengecek stok obat)
async function handleCheckApotekStock(req, res) {
    try {
        const { id } = req.params; // ID obat
        const apotekServiceUrl = `http://apotek-service:3002/obat/${id}/stock`; 
        const response = await axios.get(apotekServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to check stock from apotek service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}


// =================================================================
// BAGIAN 4: ROUTES (API Endpoints)
// =================================================================
const addTableName = (tableName) => (req, res, next) => {
    req.params.tableName = tableName;
    next();
};

// --- CRUD Routes untuk Patients ---
app.get('/patients', createGetAllController('patients'));
app.post('/patients', createPostController(createPatient, ['name', 'age', 'address', 'phone']));
app.get('/patients/:id', createGetByIdController('patients'));
app.put('/patients/:id', addTableName('patients'), createUpdateController(updatePatient, ['name', 'age', 'address', 'phone']));
app.delete('/patients/:id', createDeleteController('patients'));

// --- CRUD Routes untuk Doctors ---
app.get('/doctors', createGetAllController('doctors'));
app.post('/doctors', createPostController(createDoctor, ['name', 'specialization']));
app.get('/doctors/:id', createGetByIdController('doctors'));
app.put('/doctors/:id', addTableName('doctors'), createUpdateController(updateDoctor, ['name', 'specialization']));
app.delete('/doctors/:id', createDeleteController('doctors'));

// --- CRUD Routes untuk Consultations ---
app.get('/consultations', createGetAllController('consultations'));
app.post('/consultations', createPostController(createConsultation, ['patient_id', 'doctor_id', 'symptoms', 'date']));
app.get('/consultations/:id', createGetByIdController('consultations'));
app.put('/consultations/:id', addTableName('consultations'), createUpdateController(updateConsultation, ['patient_id', 'doctor_id', 'symptoms', 'date']));
app.delete('/consultations/:id', createDeleteController('consultations'));

// --- CRUD Routes untuk Prescriptions ---
app.get('/prescriptions', createGetAllController('prescriptions'));
app.post('/prescriptions', createPostController(createPrescription, ['consultation_id', 'medicine_name', 'dosage']));
app.get('/prescriptions/:id', createGetByIdController('prescriptions'));
app.put('/prescriptions/:id', addTableName('prescriptions'), createUpdateController(updatePrescription, ['consultation_id', 'medicine_name', 'dosage']));
app.delete('/prescriptions/:id', createDeleteController('prescriptions'));


// --- ROUTES UNTUK INTEGRASI ---
// Route ini MENYEDIAKAN data lengkap pasien untuk layanan lain.
app.get('/patients/:id/details', handleGetPatientDetailsById);

// Route ini MEMANGGIL layanan apotek untuk mendapatkan daftar obat.
app.get('/obat-from-apotek', getObatFromApotek);

// Route ini MEMANGGIL layanan apotek untuk mengecek stok obat tertentu.
app.get('/check-stock/:id', handleCheckApotekStock);


// =================================================================
// BAGIAN 5: PENANGANAN ERROR & SERVER START
// =================================================================
app.get('/health', (req, res) => { res.status(200).json({ status: 'UP', service: 'Hospital Service' }); });
app.use((req, res) => { res.status(404).json({ status: 'error', message: 'Endpoint not found' }); });

// Fungsi untuk menjalankan server setelah koneksi DB siap
async function startServer() {
await initDb();
app.listen(PORT, () => console.log(`Hospital service berjalan di http://localhost:${PORT}`));
}

startServer();