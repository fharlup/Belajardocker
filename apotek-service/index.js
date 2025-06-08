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
    host: process.env.DB_HOST || 'db_apotek', // Sesuaikan dengan nama service Docker atau host lokal
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'a',
    database: process.env.DB_NAME || 'apotek_db',
    connectionLimit: 10
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

// Helper function untuk mengecek keberadaan ID
async function checkIdExists(tableName, id) {
    const [rows] = await pool.query(`SELECT id FROM ?? WHERE id = ? LIMIT 1`, [tableName, id]);
    return rows.length > 0;
}

// Model generik untuk mengambil semua data dari tabel
async function fetchAllFromTable(tableName) {
    const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]);
    return rows;
}

// Model generik untuk mengambil data berdasarkan ID
async function fetchById(tableName, id) {
    const [rows] = await pool.query(`SELECT * FROM ?? WHERE id = ?`, [tableName, id]);
    return rows[0];
}

// Model generik untuk menghapus data berdasarkan ID
async function deleteById(tableName, id) {
    const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
    return result.affectedRows;
}

// Model untuk mendapatkan stok obat berdasarkan ID
async function getObatStockById(id) {
    const [rows] = await pool.query('SELECT id, name, stock FROM obat WHERE id = ?', [id]);
    return rows[0];
}

// --- CRUD Models: Obat ---
async function createObat(data) {
    const { name, stock, price } = data;
    const [result] = await pool.query('INSERT INTO obat (name, stock, price) VALUES (?, ?, ?)', [name, stock, price]);
    return { id: result.insertId, ...data };
}

async function updateObat(id, data) {
    const { name, stock, price } = data;
    const [result] = await pool.query('UPDATE obat SET name = ?, stock = ?, price = ? WHERE id = ?', [name, stock, price, id]);
    return result.affectedRows;
}

// --- CRUD Models: Suppliers ---
async function createSupplier(data) {
    const { name, contact } = data;
    const [result] = await pool.query('INSERT INTO suppliers (name, contact) VALUES (?, ?)', [name, contact]);
    return { id: result.insertId, ...data };
}

async function updateSupplier(id, data) {
    const { name, contact } = data;
    const [result] = await pool.query('UPDATE suppliers SET name = ?, contact = ? WHERE id = ?', [name, contact, id]);
    return result.affectedRows;
}

// --- CRUD Models: Orders ---
async function createOrder(data) {
    const { obat_id, supplier_id, quantity, order_date } = data;
    // Validasi: Pastikan obat_id ada di tabel 'obat'
    if (!await checkIdExists('obat', obat_id)) {
        throw new Error(`Obat with ID ${obat_id} not found.`);
    }
    // Validasi: Pastikan supplier_id ada di tabel 'suppliers'
    if (!await checkIdExists('suppliers', supplier_id)) {
        throw new Error(`Supplier with ID ${supplier_id} not found.`);
    }
    const [result] = await pool.query(
        'INSERT INTO orders (obat_id, supplier_id, quantity, order_date) VALUES (?, ?, ?, ?)',
        [obat_id, supplier_id, quantity, order_date]
    );
    return { id: result.insertId, ...data };
}

async function updateOrder(id, data) {
    const { obat_id, supplier_id, quantity, order_date } = data;
    // Validasi: Pastikan obat_id ada jika disertakan dalam update
    if (obat_id !== undefined && !await checkIdExists('obat', obat_id)) {
        throw new Error(`Obat with ID ${obat_id} not found.`);
    }
    // Validasi: Pastikan supplier_id ada jika disertakan dalam update
    if (supplier_id !== undefined && !await checkIdExists('suppliers', supplier_id)) {
        throw new Error(`Supplier with ID ${supplier_id} not found.`);
    }
    const [result] = await pool.query(
        'UPDATE orders SET obat_id = ?, supplier_id = ?, quantity = ?, order_date = ? WHERE id = ?',
        [obat_id, supplier_id, quantity, order_date, id]
    );
    return result.affectedRows;
}

// --- CRUD Models: Purchase History ---
async function createPurchaseHistory(data) {
    const { order_id, medicine_name, quantity, purchase_date } = data;
    // Validasi: Pastikan order_id ada di tabel 'orders'
    if (!await checkIdExists('orders', order_id)) {
        throw new Error(`Order with ID ${order_id} not found.`);
    }

    const [result] = await pool.query(
        'INSERT INTO purchase_history (order_id, medicine_name, quantity, purchase_date) VALUES (?, ?, ?, ?)',
        [order_id, medicine_name, quantity, purchase_date]
    );
    return { id: result.insertId, ...data };
}

async function updatePurchaseHistory(id, data) {
    const { order_id, medicine_name, quantity, purchase_date } = data;
    // Validasi: Pastikan order_id ada jika disertakan dalam update
    if (order_id !== undefined && !await checkIdExists('orders', order_id)) {
        throw new Error(`Order with ID ${order_id} not found.`);
    }

    const [result] = await pool.query(
        'UPDATE purchase_history SET order_id = ?, medicine_name = ?, quantity = ?, purchase_date = ? WHERE id = ?',
        [order_id, medicine_name, quantity, purchase_date, id]
    );
    return result.affectedRows;
}


// =================================================================
// BAGIAN CONTROLLER (Logika Request & Response)
// =================================================================

// Helper untuk menambahkan nama tabel ke req.params (untuk controller generik)
const addTableName = (tableName) => (req, res, next) => {
    req.params.tableName = tableName;
    next();
};

// Controller generik untuk GET all
const createGetAllController = (tableName) => async (req, res) => {
    try {
        const data = await fetchAllFromTable(tableName);
        res.status(200).json({ status: 'success', data: data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Controller generik untuk GET by ID
const createGetByIdController = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fetchById(tableName, id);
        data ?
            res.status(200).json({ status: 'success', data: data }) :
            res.status(404).json({ status: 'error', message: `${tableName.slice(0, -1)} not found` }); // Menghilangkan 's' dari nama tabel
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Controller generik untuk POST (Create)
const createPostController = (modelFunction, requiredFields = []) => async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ status: 'error', message: 'Invalid JSON body.' });
    }

    for (const field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
            return res.status(400).json({ status: 'error', message: `Field '${field}' is required.` });
        }
    }

    try {
        const newData = await modelFunction(req.body);
        res.status(201).json({ status: 'success', data: newData });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ status: 'error', message: error.message });
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') { // MySQL error for foreign key constraint fail
            res.status(400).json({ status: 'error', message: 'Foreign key constraint failed. Related record not found.' });
        }
        else {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

// Controller generik untuk PUT (Update)
const createUpdateController = (modelFunction, tableName, requiredFields = []) => async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid JSON body. No data provided for update.' });
        }

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                return res.status(400).json({ status: 'error', message: `Field '${field}' is required for update.` });
            }
        }

        const affectedRows = await modelFunction(id, req.body);
        if (affectedRows > 0) {
            const updatedData = await fetchById(tableName, id);
            res.status(200).json({ status: 'success', data: updatedData });
        } else {
            res.status(404).json({ status: 'error', message: 'Record not found.' });
        }
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ status: 'error', message: error.message });
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') { // MySQL error for foreign key constraint fail
            res.status(400).json({ status: 'error', message: 'Foreign key constraint failed. Related record not found.' });
        }
        else {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

// Controller generik untuk DELETE
const createDeleteController = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await deleteById(tableName, id);
        if (affectedRows > 0) {
            res.status(200).json({ status: 'success', message: 'Record deleted successfully.' });
        } else {
            res.status(404).json({ status: 'error', message: 'Record not found.' });
        }
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(409).json({ status: 'error', message: `Cannot delete ${tableName.slice(0, -1)} with ID ${id} because it is referenced by other records.` });
        } else {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};


// --- CONTROLLER UNTUK INTEGRASI ---

// Controller untuk MEMANGGIL Hospital Service (mendapatkan daftar pasien)
async function getPatientsFromHospital(req, res) {
    try {
        const hospitalServiceUrl = 'http://hospital-service:3001/patients';
        const response = await axios.get(hospitalServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to fetch patients from hospital service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}

// Controller untuk MEMANGGIL Hospital Service (mendapatkan detail pasien berdasarkan ID)
async function getPatientDetailsFromHospital(req, res) {
    try {
        const { id } = req.params;
        const hospitalServiceUrl = `http://hospital-service:3001/patients/${id}/details`;
        const response = await axios.get(hospitalServiceUrl);
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response ? error.response.data.message : 'Failed to fetch patient details from hospital service';
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({ status: 'error', message });
    }
}

// Controller untuk MENYEDIAKAN data stok obat untuk layanan lain (contoh: Hospital Service)
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

// --- CRUD Routes untuk Obat ---
app.get('/obat', createGetAllController('obat'));
app.post('/obat', createPostController(createObat, ['name', 'stock', 'price']));
app.get('/obat/:id', createGetByIdController('obat'));
app.put('/obat/:id', createUpdateController(updateObat, 'obat', ['name', 'stock', 'price']));
app.delete('/obat/:id', createDeleteController('obat'));

// --- CRUD Routes untuk Suppliers ---
app.get('/suppliers', createGetAllController('suppliers'));
app.post('/suppliers', createPostController(createSupplier, ['name', 'contact']));
app.get('/suppliers/:id', createGetByIdController('suppliers'));
app.put('/suppliers/:id', createUpdateController(updateSupplier, 'suppliers', ['name', 'contact']));
app.delete('/suppliers/:id', createDeleteController('suppliers'));

// --- CRUD Routes untuk Orders ---
app.get('/orders', createGetAllController('orders'));
app.post('/orders', createPostController(createOrder, ['obat_id', 'supplier_id', 'quantity', 'order_date']));
app.get('/orders/:id', createGetByIdController('orders'));
app.put('/orders/:id', createUpdateController(updateOrder, 'orders', ['obat_id', 'supplier_id', 'quantity', 'order_date']));
app.delete('/orders/:id', createDeleteController('orders'));

// --- CRUD Routes untuk Purchase History ---
app.get('/purchase-history', createGetAllController('purchase_history'));
app.post('/purchase-history', createPostController(createPurchaseHistory, ['order_id', 'medicine_name', 'quantity', 'purchase_date']));
app.get('/purchase-history/:id', createGetByIdController('purchase_history'));
app.put('/purchase-history/:id', createUpdateController(updatePurchaseHistory, 'purchase_history', ['order_id', 'medicine_name', 'quantity', 'purchase_date']));
app.delete('/purchase-history/:id', createDeleteController('purchase_history'));


// --- ROUTES UNTUK INTEGRASI ---
app.get('/patients-from-hospital', getPatientsFromHospital);
app.get('/patients-from-hospital/:id/details', getPatientDetailsFromHospital);
app.get('/obat/:id/stock', handleGetObatStockById);


// =================================================================
// PENANGANAN ERROR & MENJALANKAN SERVER
// =================================================================
app.get('/health', (req, res) => { res.status(200).json({ status: 'UP', service: 'Apotek Service' }); });
app.use((req, res) => { res.status(404).json({ status: 'error', message: 'Endpoint not found' }); });

async function startServer() {
    await initDb();
    app.listen(PORT, () => console.log(`Apotek service berjalan di http://localhost:${PORT}`));
}

startServer();