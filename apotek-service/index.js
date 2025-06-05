const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');

// =================================================================
// KONFIGURASI APLIKASI
// =================================================================
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3002;

// =================================================================
// KONFIGURASI DATABASE
// =================================================================
const dbConfig = {
    host: process.env.DB_HOST || 'db_apotek',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'a',
    database: process.env.DB_NAME || 'apotek_db'
};

let pool;

async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.query('SELECT 1');
        console.log('Koneksi ke database apotek berhasil.');
    } catch (error) {
        console.error('Gagal koneksi ke database:', error.message);
        process.exit(1);
    }
}

// =================================================================
// BAGIAN MODEL (Logika Query ke Database)
// =================================================================

async function fetchAllFromTable(tableName) {
    const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]);
    return rows;
}

async function getObatStockById(id) {
    const [rows] = await pool.query('SELECT id, name, stock FROM obat WHERE id = ?', [id]);
    return rows[0];
}

async function createObat(data) {
    const { name, stock, price } = data;
    const [result] = await pool.query('INSERT INTO obat (name, stock, price) VALUES (?, ?, ?)', [name, stock, price]);
    return { id: result.insertId, ...data };
}

async function createSupplier(data) {
    const { name, contact } = data;
    const [result] = await pool.query('INSERT INTO suppliers (name, contact) VALUES (?, ?)', [name, contact]);
    return { id: result.insertId, ...data };
}

async function createOrder(data) {
    const { obat_id, quantity, order_date } = data;
    const [result] = await pool.query('INSERT INTO orders (obat_id, quantity, order_date) VALUES (?, ?, ?)', [obat_id, quantity, order_date]);
    return { id: result.insertId, ...data };
}

async function createPurchaseHistory(data) {
    const { patient_id, medicine_name, quantity, purchase_date } = data;
    const [result] = await pool.query(
        'INSERT INTO purchase_history (patient_id, medicine_name, quantity, purchase_date) VALUES (?, ?, ?, ?)', 
        [patient_id, medicine_name, quantity, purchase_date]
    );
    return { id: result.insertId, ...data };
}

// =================================================================
// BAGIAN CONTROLLER (Logika Request & Response)
// =================================================================

// Controller generik untuk GET all
function createGetAllController(tableName) {
    return async (req, res) => {
        try {
            const data = await fetchAllFromTable(tableName);
            res.status(200).json({ status: 'success', data: data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };
}

// Controller generik untuk POST
function createPostController(modelFunction) {
    return async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
        }
        try {
            const newData = await modelFunction(req.body);
            res.status(201).json({ status: 'success', data: newData });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };
}

// Controller untuk integrasi
async function getPatientsFromHospital(req, res) {
    try {
        const hospitalServiceUrl = 'http://hospital-service:3001/patients';
        const response = await axios.get(hospitalServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to fetch patients from hospital service';
        res.status(500).json({ status: 'error', message });
    }
}

async function handleGetObatStockById(req, res) {
    try {
        const { id } = req.params;
        const stockInfo = await getObatStockById(id);
        if (!stockInfo) {
            return res.status(404).json({ status: 'error', message: 'Obat tidak ditemukan' });
        }
        res.status(200).json({ status: 'success', data: stockInfo });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// =================================================================
// BAGIAN ROUTES (ENDPOINT API)
// =================================================================

// GET Endpoints
app.get('/obat', createGetAllController('obat'));
app.get('/suppliers', createGetAllController('suppliers'));
app.get('/orders', createGetAllController('orders'));
app.get('/purchase-history', createGetAllController('purchase_history'));
app.get('/patients-from-hospital', getPatientsFromHospital); // Integrasi #1
app.get('/obat/:id/stock', handleGetObatStockById); // Integrasi #2 (menyediakan data)

// POST Endpoints
app.post('/obat', createPostController(createObat));
app.post('/suppliers', createPostController(createSupplier));
app.post('/orders', createPostController(createOrder));
app.post('/purchase-history', createPostController(createPurchaseHistory));

// Lainnya
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', service: 'Apotek Service' }));
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Endpoint not found' }));

// =================================================================
// MENJALANKAN SERVER
// =================================================================
async function startServer() {
    await initDb();
    app.listen(PORT, () => console.log(`Apotek service berjalan di http://localhost:${PORT}`));
}

startServer();