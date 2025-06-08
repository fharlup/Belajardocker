import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddObatForm from './AddObatForm';
import AddSupplierForm from './AddSupplierForm';
import AddOrderForm from './AddOrderForm';
import AddPurchaseForm from './AddPurchaseHistoryForm';

const APOTEK_API_URL = '/api-apotek';
const HOSPITAL_API_URL = '/api-hospital';

const dataConfigs = {
  obat: {
    title: 'Data Obat',
    endpoint: '/obat',
    form: 'Obat',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nama Obat' },
      { key: 'stock', header: 'Stok' },
      { key: 'price', header: 'Harga (Rp)' },
    ],
  },
  suppliers: {
    title: 'Data Supplier',
    endpoint: '/suppliers',
    form: 'Supplier',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nama Supplier' },
      { key: 'phone', header: 'Telepon' },
      { key: 'address', header: 'Alamat' },
    ],
  },
  orders: {
    title: 'Data Order',
    endpoint: '/orders',
    form: 'Order',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'supplier_id', header: 'ID Supplier' },
      { key: 'order_date', header: 'Tanggal Order' },
      { key: 'status', header: 'Status' },
    ],
  },
  'purchase-history': {
    title: 'Riwayat Pembelian',
    endpoint: '/purchase-history',
    form: 'Purchase',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'order_id', header: 'ID Order' },
      { key: 'purchase_date', header: 'Tanggal Pembelian' },
      { key: 'total_price', header: 'Total Harga (Rp)' },
    ],
  },
  'patients-from-hospital': {
    title: 'Data Pasien dari Hospital',
    endpoint: '/patients',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nama Pasien' },
      { key: 'age', header: 'Umur' },
      { key: 'address', header: 'Alamat' },
    ],
  },
};

function ApotekDashboard() {
  const [activeView, setActiveView] = useState('obat');
  const [viewKey, setViewKey] = useState(Date.now());
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const handleNavClick = (view) => {
    setActiveView(view);
    setError('');
    setEditingItem(null);
    setViewKey(Date.now());
  };

  const handleUpdate = (item) => {
    setEditingItem(item);
    const formType = dataConfigs[activeView]?.form;
    if (formType) {
      setActiveView(`update${formType}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data ini (ID: ${item.id})?`)) {
      return;
    }
    try {
      const endpoint = dataConfigs[activeView].endpoint;
      // Jika data pasien dari hospital, panggil API Hospital
      const apiBaseUrl = activeView === 'patients-from-hospital' ? HOSPITAL_API_URL : APOTEK_API_URL;
      const response = await fetch(`${apiBaseUrl}${endpoint}/${item.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal menghapus data.');
      }
      alert('Data berhasil dihapus!');
      setViewKey(Date.now());
    } catch (e) {
      setError(e.message);
    }
  };

  // Mendapatkan komponen form Add / Update sesuai tipe data
  const getFormComponent = (viewType, isUpdate = false) => {
    const entityName = viewType.toLowerCase().replace('add', '').replace('update', '');

    const commonProps = {
      onSuccess: () => handleNavClick(entityName),
      onError: setError,
      isUpdateMode: isUpdate,
      initialData: isUpdate ? editingItem : null,
    };

    if (entityName === 'obat') return <AddObatForm {...commonProps} />;
    if (entityName === 'supplier') return <AddSupplierForm {...commonProps} />;
    if (entityName === 'order') return <AddOrderForm {...commonProps} />;
    if (entityName === 'purchase') return <AddPurchaseForm {...commonProps} />;

    return null;
  };

  const apiBaseUrl = activeView === 'patients-from-hospital' ? HOSPITAL_API_URL : APOTEK_API_URL;

  return (
    <div className="container">
      <nav className="navigation">
        <p><strong>Lihat Data:</strong></p>
        <button onClick={() => handleNavClick('obat')}>Obat</button>
        <button onClick={() => handleNavClick('suppliers')}>Supplier</button>
        <button onClick={() => handleNavClick('orders')}>Order</button>
        <button onClick={() => handleNavClick('purchase-history')}>Riwayat Pembelian</button>
        <button onClick={() => handleNavClick('patients-from-hospital')}>Pasien dari Hospital</button>
      </nav>
      <nav className="navigation">
        <p><strong>Tambah Data:</strong></p>
        <button className="add-btn" onClick={() => handleNavClick('addObat')}>+ Obat</button>
        <button className="add-btn" onClick={() => handleNavClick('addSupplier')}>+ Supplier</button>
        <button className="add-btn" onClick={() => handleNavClick('addOrder')}>+ Order</button>
        <button className="add-btn" onClick={() => handleNavClick('addPurchase')}>+ Riwayat Pembelian</button>
      </nav>

      <div className="content">
        {error && <p className="error-message">Error: {error}</p>}

        {dataConfigs[activeView] && (
          <DataViewer
            key={viewKey}
            config={dataConfigs[activeView]}
            apiBaseUrl={apiBaseUrl}
            onError={setError}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}

        {/* Render form add/update */}
        {getFormComponent(activeView, activeView.startsWith('update'))}
      </div>
    </div>
  );
}

export default ApotekDashboard;
