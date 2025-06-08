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
    database: process.env.DB_NAME || 'hospital_db',
    connectionLimit: 10
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

// =================================================================
// BAGIAN 2: MODEL (Logika & Interaksi Database)
// =================================================================

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
    const { patient_id, doctor_id, symptoms, date } = data;
    const [result] = await pool.query('UPDATE consultations SET patient_id = ?, doctor_id = ?, symptoms = ?, date = ? WHERE id = ?', [patient_id, doctor_id, symptoms, date, id]);
    return result.affectedRows;
}

// --- CRUD Models: Diagnoses ---
async function createDiagnosis(data) {
    const { consultation_id, diagnosis_text } = data;
    if (!await checkIdExists('consultations', consultation_id)) {
        throw new Error(`Consultation with ID ${consultation_id} not found.`);
    }
    const [result] = await pool.query('INSERT INTO diagnoses (consultation_id, diagnosis_text) VALUES (?, ?)', [consultation_id, diagnosis_text]);
    return { id: result.insertId, ...data };
}

async function updateDiagnosis(id, data) {
    const { consultation_id, diagnosis_text } = data;
    const [result] = await pool.query('UPDATE diagnoses SET consultation_id = ?, diagnosis_text = ? WHERE id = ?', [consultation_id, diagnosis_text, id]);
    return result.affectedRows;
}

// --- CRUD Models: Prescriptions ---
async function createPrescription(data) {
    const { diagnosis_id, medicine_name, dosage } = data;
    if (!await checkIdExists('diagnoses', diagnosis_id)) {
        throw new Error(`Diagnosis with ID ${diagnosis_id} not found.`);
    }
    const [result] = await pool.query('INSERT INTO prescriptions (diagnosis_id, medicine_name, dosage) VALUES (?, ?, ?)', [diagnosis_id, medicine_name, dosage]);
    return { id: result.insertId, ...data };
}
async function updatePrescription(id, data) {
    const { diagnosis_id, medicine_name, dosage } = data;
    const [result] = await pool.query('UPDATE prescriptions SET diagnosis_id = ?, medicine_name = ?, dosage = ? WHERE id = ?', [diagnosis_id, medicine_name, dosage, id]);
    return result.affectedRows;
}

// --- CRUD Models: Health Monitorings ---
async function createHealthMonitoring(data) {
    const { diagnosis_id, kota_kejadian } = data;
    if (!await checkIdExists('diagnoses', diagnosis_id)) {
        throw new Error(`Diagnosis with ID ${diagnosis_id} not found.`);
    }
    const [result] = await pool.query('INSERT INTO health_monitorings (diagnosis_id, kota_kejadian) VALUES (?, ?)', [diagnosis_id, kota_kejadian]);
    return { id: result.insertId, ...data };
}

async function updateHealthMonitoring(id, data) {
    const { diagnosis_id, kota_kejadian } = data;
    const [result] = await pool.query('UPDATE health_monitorings SET diagnosis_id = ?, kota_kejadian = ? WHERE id = ?', [diagnosis_id, kota_kejadian, id]);
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
            c.id as consultation_id, c.symptoms, c.date as consultation_date,
            d.name as doctor_name,
            diag.id as diagnosis_id, diag.diagnosis_text, diag.diagnosis_date,
            pr.id as prescription_id, pr.medicine_name, pr.dosage,
            hm.id as monitoring_id, hm.kota_kejadian, hm.monitoring_date
        FROM patients p
        LEFT JOIN consultations c ON p.id = c.patient_id
        LEFT JOIN doctors d ON c.doctor_id = d.id
        LEFT JOIN diagnoses diag ON c.id = diag.consultation_id
        LEFT JOIN prescriptions pr ON diag.id = pr.diagnosis_id
        LEFT JOIN health_monitorings hm ON diag.id = hm.diagnosis_id
        WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) return null;

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
                consultation_date: row.consultation_date,
                doctor_name: row.doctor_name,
                diagnoses: []
            };
        }

        let currentDiagnosis = consultations[row.consultation_id].diagnoses.find(d => d.diagnosis_id === row.diagnosis_id);
        if (row.diagnosis_id && !currentDiagnosis) {
            currentDiagnosis = {
                diagnosis_id: row.diagnosis_id,
                diagnosis_text: row.diagnosis_text,
                diagnosis_date: row.diagnosis_date,
                prescriptions: [],
                health_monitorings: []
            };
            consultations[row.consultation_id].diagnoses.push(currentDiagnosis);
        }

        if (row.prescription_id && currentDiagnosis && !currentDiagnosis.prescriptions.some(p => p.prescription_id === row.prescription_id)) {
            currentDiagnosis.prescriptions.push({
                prescription_id: row.prescription_id,
                medicine_name: row.medicine_name,
                dosage: row.dosage
            });
        }

        if (row.monitoring_id && currentDiagnosis && !currentDiagnosis.health_monitorings.some(hm => hm.monitoring_id === row.monitoring_id)) {
            currentDiagnosis.health_monitorings.push({
                monitoring_id: row.monitoring_id,
                kota_kejadian: row.kota_kejadian,
                monitoring_date: row.monitoring_date
            });
        }
    });

    patientData.history = Object.values(consultations);
    return patientData;
}

// =================================================================
// BAGIAN 3: CONTROLLER (Penghubung Route dan Model)
// =================================================================

const createGetAllController = (tableName) => async (req, res) => {
    try {
        const data = await fetchAllFromTable(tableName);
        res.status(200).json({ status: 'success', data: data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const createGetByIdController = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fetchById(tableName, id);
        data ? res.status(200).json({ status: 'success', data: data }) : res.status(404).json({ status: 'error', message: `${tableName.slice(0, -1)} not found` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const createPostController = (modelFunction, requiredFields = []) => async (req, res) => {
    if (!req.body) return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
    for (const field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === '') {
            return res.status(400).json({ status: 'error', message: `Field '${field}' is required` });
        }
    }
    try {
        const data = await modelFunction(req.body);
        res.status(201).json({ status: 'success', data: data });
    } catch (error) {
        error.message.includes('not found') ? res.status(404).json({ status: 'error', message: error.message }) : res.status(500).json({ status: 'error', message: error.message });
    }
};

const createUpdateController = (modelFunction, requiredFields = []) => async (req, res) => {
    try {
        const { id } = req.params;
        const tableName = req.params.tableName; // Dapatkan tableName dari req.params yang disuntikkan middleware
        if (!req.body) return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === '') {
                return res.status(400).json({ status: 'error', message: `Field '${field}' is required` });
            }
        }
        const affectedRows = await modelFunction(id, req.body);
        affectedRows > 0 ? res.status(200).json({ status: 'success', data: await fetchById(tableName, id) }) : res.status(404).json({ status: 'error', message: 'Record not found' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const createDeleteController = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await deleteById(tableName, id);
        affectedRows > 0 ? res.status(200).json({ status: 'success', message: 'Record deleted successfully' }) : res.status(404).json({ status: 'error', message: 'Record not found' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// --- CONTROLLER UNTUK INTEGRASI ---

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

async function handleCheckApotekStock(req, res) {
    try {
        const { id } = req.params;
        const apotekServiceUrl = `http://apotek-service:3002/obat/${id}/stock`;
        const response = await axios.get(apotekServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to check stock from apotek service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}

async function handlePostHealthMonitoring(req, res) {
    try {
        const { diagnosis_id, kota_kejadian } = req.body;

        if (!diagnosis_id || !kota_kejadian) {
            return res.status(400).json({ status: 'error', message: 'Fields "diagnosis_id" and "kota_kejadian" are required.' });
        }

        const newMonitoring = await createHealthMonitoring({ diagnosis_id, kota_kejadian });

        const diagnosisData = await fetchById('diagnoses', diagnosis_id);
        if (!diagnosisData) {
            return res.status(404).json({ status: 'error', message: 'Associated diagnosis not found.' });
        }

        const healthStatisticServiceUrl = 'http://health-statistic-service:3003/report-case';
        try {
            const statisticResponse = await axios.post(healthStatisticServiceUrl, {
                diagnosis_text: diagnosisData.diagnosis_text,
                kota_kejadian: kota_kejadian
            });
            res.status(201).json({
                status: 'success',
                message: 'Health monitoring recorded and reported to statistics service.',
                data: newMonitoring,
                statistic_data: statisticResponse.data.data
            });
        } catch (axiosError) {
            console.error('Error reporting to Health Statistic Service:', axiosError.message);
            const message = axiosError.response ? axiosError.response.data.message : 'Failed to report case to health statistic service.';
            const statusCode = axiosError.response ? axiosError.response.status : 500;
            res.status(statusCode).json({
                status: 'warning',
                message: `Health monitoring recorded but failed to report to statistics service: ${message}`,
                data: newMonitoring
            });
        }

    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ status: 'error', message: error.message });
        } else {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

async function getHealthStatistics(req, res) {
    try {
        const healthStatisticServiceUrl = 'http://health-statistic-service:3003/statistics';
        const response = await axios.get(healthStatisticServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to fetch statistics from health statistic service';
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

// --- CRUD Routes untuk Diagnoses ---
app.post('/diagnoses', createPostController(createDiagnosis, ['consultation_id', 'diagnosis_text']));
app.get('/diagnoses', createGetAllController('diagnoses'));
app.get('/diagnoses/:id', createGetByIdController('diagnoses'));
app.put('/diagnoses/:id', addTableName('diagnoses'), createUpdateController(updateDiagnosis, ['consultation_id', 'diagnosis_text']));
app.delete('/diagnoses/:id', createDeleteController('diagnoses'));

// --- CRUD Routes untuk Prescriptions ---
app.post('/prescriptions', createPostController(createPrescription, ['diagnosis_id', 'medicine_name', 'dosage']));
app.get('/prescriptions', createGetAllController('prescriptions'));
app.get('/prescriptions/:id', createGetByIdController('prescriptions'));
app.put('/prescriptions/:id', addTableName('prescriptions'), createUpdateController(updatePrescription, ['diagnosis_id', 'medicine_name', 'dosage']));
app.delete('/prescriptions/:id', createDeleteController('prescriptions'));

// --- CRUD Routes untuk Health Monitorings ---
app.post('/health-monitorings', handlePostHealthMonitoring);
app.get('/health-monitorings', createGetAllController('health_monitorings'));
app.get('/health-monitorings/:id', createGetByIdController('health_monitorings'));
app.put('/health-monitorings/:id', addTableName('health_monitorings'), createUpdateController(updateHealthMonitoring, ['diagnosis_id', 'kota_kejadian']));
app.delete('/health-monitorings/:id', createDeleteController('health_monitorings'));


// --- ROUTES UNTUK INTEGRASI ---
app.get('/patients/:id/details', handleGetPatientDetailsById);
app.get('/obat-from-apotek', getObatFromApotek);
app.get('/check-stock/:id', handleCheckApotekStock);
app.get('/health-statistics', getHealthStatistics);

// =================================================================
// BAGIAN 5: PENANGANAN ERROR & SERVER START
// =================================================================
app.get('/health', (req, res) => { res.status(200).json({ status: 'UP', service: 'Hospital Service' }); });
app.use((req, res) => { res.status(404).json({ status: 'error', message: 'Endpoint not found' }); });

async function startServer() {
    await initDb();
    app.listen(PORT, () => console.log(`Hospital service berjalan di http://localhost:${PORT}`));
}

startServer();