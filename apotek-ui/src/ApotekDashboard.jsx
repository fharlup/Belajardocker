import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddObatForm from './AddObatForm';
import AddSupplierForm from './AddSupplierForm';
import AddOrderForm from './AddOrderForm';
import AddPurchaseHistoryForm from './AddPurchaseHistoryForm';

const APOTEK_API_URL = '/api-apotek'; // Path proxy untuk service apotek
const HOSPITAL_API_URL = '/api-hospital'; // Path proxy untuk service hospital

const dataConfigs = {
  obat: { title: 'Daftar Obat', endpoint: '/obat', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Obat' }, { key: 'stock', header: 'Stok' }, { key: 'price', header: 'Harga (Rp)' } ] },
  suppliers: { title: 'Daftar Supplier', endpoint: '/suppliers', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Supplier' }, { key: 'contact', header: 'Kontak' } ] },
  orders: { title: 'Daftar Order', endpoint: '/orders', columns: [ { key: 'id', header: 'ID' }, { key: 'obat_id', header: 'ID Obat' }, { key: 'quantity', header: 'Jumlah' }, { key: 'order_date', header: 'Tgl Order' } ] },
  'purchase-history': { title: 'Riwayat Pembelian', endpoint: '/purchase-history', columns: [ { key: 'id', header: 'ID' }, { key: 'patient_id', header: 'ID Pasien' }, { key: 'medicine_name', header: 'Nama Obat' }, { key: 'quantity', header: 'Jumlah' }, { key: 'purchase_date', header: 'Tgl Pembelian' } ] },
  'patients-from-hospital': { title: 'Data Pasien (dari Hospital)', endpoint: '/patients', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Pasien' }, { key: 'age', header: 'Umur' }, { key: 'address', header: 'Alamat' } ] }
};

function ApotekDashboard() {
  const [activeView, setActiveView] = useState('obat');
  const [viewKey, setViewKey] = useState(Date.now());
  const [error, setError] = useState('');

  const handleNavClick = (view) => {
    setActiveView(view);
    setError('');
    setViewKey(Date.now());
  };

  return (
    <div className="container">
      <h1>Dashboard Apotek</h1>
      <div className="navigation">
        <p><strong>Lihat Data:</strong></p>
        <button onClick={() => handleNavClick('obat')}>Obat</button>
        <button onClick={() => handleNavClick('suppliers')}>Supplier</button>
        <button onClick={() => handleNavClick('orders')}>Order</button>
        <button onClick={() => handleNavClick('purchase-history')}>Riwayat Beli</button>
        <button onClick={() => handleNavClick('patients-from-hospital')}>Pasien (dari Hospital)</button>
      </div>
      <div className="navigation">
        <p><strong>Tambah Data:</strong></p>
        <button className="add-btn" onClick={() => handleNavClick('addObat')}>+ Tambah Obat</button>
        <button className="add-btn" onClick={() => handleNavClick('addSupplier')}>+ Tambah Supplier</button>
        <button className="add-btn" onClick={() => handleNavClick('addOrder')}>+ Tambah Order</button>
        <button className="add-btn" onClick={() => handleNavClick('addPurchase')}>+ Tambah Riwayat Beli</button>
      </div>

      <div className="content">
        {error && <p className="error-message">Error: {error}</p>}
        
        {dataConfigs[activeView] && (
            <DataViewer 
                key={viewKey}
                config={dataConfigs[activeView]} 
                apiBaseUrl={activeView === 'patients-from-hospital' ? HOSPITAL_API_URL : APOTEK_API_URL}
                onError={setError}
            />
        )}
        
        {activeView === 'addObat' && <AddObatForm onSuccess={() => handleNavClick('obat')} onError={setError} />}
        {activeView === 'addSupplier' && <AddSupplierForm onSuccess={() => handleNavClick('suppliers')} onError={setError} />}
        {activeView === 'addOrder' && <AddOrderForm onSuccess={() => handleNavClick('orders')} onError={setError} />}
        {activeView === 'addPurchase' && <AddPurchaseHistoryForm onSuccess={() => handleNavClick('purchase-history')} onError={setError} />}
      </div>
    </div>
  );
}

export default ApotekDashboard;