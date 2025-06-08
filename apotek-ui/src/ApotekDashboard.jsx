// apotek-frontend/src/ApotekDashboard.js
import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddObatForm from './AddObatForm';
import EditObatForm from './EditObatForm'; 
// Impor form Add lainnya yang sudah Anda buat
import AddSupplierForm from './AddSupplierForm';
import AddOrderForm from './AddOrderForm';
import AddPurchaseHistoryForm from './AddPurchaseHistoryForm';

// === BASE URL TIDAK DIRUBAH, MENGGUNAKAN PROXY PATH ===
const APOTEK_API_URL = '/api-apotek';   // Path proxy untuk service apotek
const HOSPITAL_API_URL = '/api-hospital'; // Path proxy untuk service hospital
// =======================================================

function ApotekDashboard() {
    const [currentError, setCurrentError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0); 
    const [showAddForm, setShowAddForm] = useState(false); 
    const [showEditForm, setShowEditForm] = useState(false); 
    const [selectedItemForEdit, setSelectedItemForEdit] = useState(null); 
    const [activeTab, setActiveTab] = useState('obat'); 

    const handleDataReload = () => {
        setRefreshKey(prev => prev + 1); 
        setShowAddForm(false); 
        setShowEditForm(false); 
        setSelectedItemForEdit(null); 
        setCurrentError(''); 
    };

    const handleEditClick = (item, type) => {
        if (type === 'obat') {
            setSelectedItemForEdit(item);
            setShowEditForm(true);
            setShowAddForm(false); 
            setCurrentError(''); 
        } else {
            setCurrentError(`Fitur edit untuk ${type} belum diimplementasikan. Mohon buatkan komponen form editnya terlebih dahulu.`);
            console.warn(`Edit for ${type} is not yet implemented.`);
        }
    };

    const handleDeleteClick = async (id, type) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${type} dengan ID ${id}?`)) {
            return;
        }
        setCurrentError('');
        try {
            // Menggunakan APOTEK_API_URL atau HOSPITAL_API_URL sebagai base
            const baseUrl = type === 'patients-from-hospital' ? HOSPITAL_API_URL : APOTEK_API_URL;
            const response = await fetch(`${baseUrl}/${type}/${id}`, { // Sesuaikan URL
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal menghapus ${type}.`);
            }
            alert(`${type} berhasil dihapus!`);
            handleDataReload(); 
        } catch (e) {
            setCurrentError(e.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Konfigurasi untuk DataViewer
    // Perhatikan endpoint sekarang hanya path relatif dari APOTEK_API_URL atau HOSPITAL_API_URL
    const obatConfig = {
        endpoint: '/obat', 
        title: 'Daftar Obat',
        type: 'obat', 
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Nama Obat' },
            { key: 'stock', header: 'Stok' },
            { key: 'price', header: 'Harga' },
            {
                key: 'actions',
                header: 'Aksi',
                render: (item) => ( 
                    <>
                        <button onClick={() => handleEditClick(item, 'obat')} className="button-edit">Edit</button>
                        <button onClick={() => handleDeleteClick(item.id, 'obat')} className="button-delete">Hapus</button>
                    </>
                )
            }
        ]
    };

    const supplierConfig = {
        endpoint: '/suppliers',
        title: 'Daftar Pemasok',
        type: 'suppliers', 
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Nama Pemasok' },
            { key: 'contact', header: 'Kontak' },
            {
                key: 'actions',
                header: 'Aksi',
                render: (item) => ( 
                    <>
                        <button onClick={() => handleEditClick(item, 'suppliers')} className="button-edit">Edit</button> 
                        <button onClick={() => handleDeleteClick(item.id, 'suppliers')} className="button-delete">Hapus</button>
                    </>
                )
            }
        ]
    };

    const orderConfig = {
        endpoint: '/orders',
        title: 'Daftar Pesanan',
        type: 'orders', 
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'obat_id', header: 'ID Obat' },
            { key: 'supplier_id', header: 'ID Pemasok' },
            { key: 'quantity', header: 'Kuantitas' },
            { key: 'order_date', header: 'Tanggal Pesan' },
            {
                key: 'actions',
                header: 'Aksi',
                render: (item) => (
                    <>
                        <button onClick={() => handleEditClick(item, 'orders')} className="button-edit">Edit</button> 
                        <button onClick={() => handleDeleteClick(item.id, 'orders')} className="button-delete">Hapus</button>
                    </>
                )
            }
        ]
    };

    const purchaseHistoryConfig = {
        endpoint: '/purchase-history',
        title: 'Riwayat Pembelian',
        type: 'purchase-history', 
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'order_id', header: 'ID Pesanan' },
            { key: 'medicine_name', header: 'Nama Obat' },
            { key: 'quantity', header: 'Kuantitas' },
            { key: 'purchase_date', header: 'Tanggal Beli' },
            {
                key: 'actions',
                header: 'Aksi',
                render: (item) => (
                    <>
                        <button onClick={() => handleEditClick(item, 'purchase-history')} className="button-edit">Edit</button> 
                        <button onClick={() => handleDeleteClick(item.id, 'purchase-history')} className="button-delete">Hapus</button>
                    </>
                )
            }
        ]
    };

    const patientsFromHospitalConfig = {
        endpoint: '/patients', 
        title: 'Data Pasien (dari Hospital)',
        type: 'patients-from-hospital',
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Nama Pasien' },
            { key: 'age', header: 'Umur' },
            { key: 'address', header: 'Alamat' }
        ]
    };

    const displayContent = () => {
        if (showAddForm) {
            switch (activeTab) {
                case 'addObat': return <AddObatForm onSuccess={() => handleDataReload()} onError={setCurrentError} />;
                case 'addSupplier': return <AddSupplierForm onSuccess={() => handleDataReload()} onError={setCurrentError} />;
                case 'addOrder': return <AddOrderForm onSuccess={() => handleDataReload()} onError={setCurrentError} />;
                case 'addPurchase': return <AddPurchaseHistoryForm onSuccess={() => handleDataReload()} onError={setCurrentError} />;
                default: return null;
            }
        }
        if (showEditForm && selectedItemForEdit && selectedItemForEdit.type === 'obat') { 
            return (
                <EditObatForm
                    obat={selectedItemForEdit} 
                    onSuccess={handleDataReload}
                    onError={setCurrentError}
                />
            );
        }
        
        // Pilih config berdasarkan activeTab
        let currentConfig;
        let currentApiBaseUrl;

        switch (activeTab) {
            case 'obat':
                currentConfig = obatConfig;
                currentApiBaseUrl = APOTEK_API_URL;
                break;
            case 'suppliers':
                currentConfig = supplierConfig;
                currentApiBaseUrl = APOTEK_API_URL;
                break;
            case 'orders':
                currentConfig = orderConfig;
                currentApiBaseUrl = APOTEK_API_URL;
                break;
            case 'purchase-history':
                currentConfig = purchaseHistoryConfig;
                currentApiBaseUrl = APOTEK_API_URL;
                break;
            case 'patients-from-hospital':
                currentConfig = patientsFromHospitalConfig;
                currentApiBaseUrl = HOSPITAL_API_URL;
                break;
            default:
                return null;
        }

        return (
            <DataViewer
                key={`${activeTab}-${refreshKey}`} 
                config={currentConfig}
                apiBaseUrl={currentApiBaseUrl} // Menggunakan proxy path
                onError={setCurrentError}
                refreshTrigger={refreshKey} 
            />
        );
    };


    return (
        <div className="apotek-dashboard">
            <h1>Manajemen Apotek</h1>

            {currentError && <p className="error-message">Error: {currentError}</p>}

            <nav className="dashboard-nav">
                <button onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                    setActiveTab('addObat'); 
                }}>Tambah Obat Baru</button>
                 <button onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                    setActiveTab('addSupplier'); 
                }}>Tambah Supplier Baru</button>
                 <button onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                    setActiveTab('addOrder'); 
                }}>Tambah Order Baru</button>
                 <button onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                    setActiveTab('addPurchase'); 
                }}>Tambah Riwayat Beli Baru</button>
                
                <hr className="nav-separator" />

                <button onClick={() => {
                    setActiveTab('obat');
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                }}>Lihat Daftar Obat</button>
                <button onClick={() => {
                    setActiveTab('suppliers');
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                }}>Lihat Pemasok</button>
                <button onClick={() => {
                    setActiveTab('orders');
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                }}>Lihat Pesanan</button>
                <button onClick={() => {
                    setActiveTab('purchase-history');
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                }}>Lihat Riwayat Pembelian</button>
                <button onClick={() => {
                    setActiveTab('patients-from-hospital');
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                }}>Lihat Pasien (dari Hospital)</button>

            </nav>

            {displayContent()}

            {(showAddForm || showEditForm) && (
                <button onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedItemForEdit(null); 
                    setCurrentError('');
                    // Kembali ke tampilan daftar yang sesuai setelah menutup form
                    // Ini bisa diatur lebih cerdas (misal: kembali ke tab yang aktif sebelum form dibuka)
                    setActiveTab('obat'); 
                }} className="button-back">Kembali ke Daftar</button>
            )}
        </div>
    );
}

export default ApotekDashboard;