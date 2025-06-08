import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddPatientForm from './AddPatientForm';
import AddDoctorForm from './AddDoctorForm';
import AddConsultationForm from './AddConsultationForm';
import AddPrescriptionForm from './AddPrescriptionForm';

const HOSPITAL_API_URL = '/api-hospital';
const APOTEK_API_URL = '/api-apotek';

// Konfigurasi untuk setiap jenis data yang akan ditampilkan
const dataConfigs = {
  patients: { title: 'Daftar Pasien', endpoint: '/patients', form: 'Patient', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Pasien' }, { key: 'age', header: 'Umur' }, { key: 'address', header: 'Alamat' }, { key: 'phone', header: 'Telepon' } ] },
  doctors: { title: 'Daftar Dokter', endpoint: '/doctors', form: 'Doctor', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Dokter' }, { key: 'specialization', header: 'Spesialisasi' } ] },
  consultations: { title: 'Daftar Konsultasi', endpoint: '/consultations', form: 'Consultation', columns: [ { key: 'id', header: 'ID' }, { key: 'patient_id', header: 'ID Pasien' }, { key: 'doctor_id', header: 'ID Dokter' }, {key: 'symptoms', header: 'Gejala'}, { key: 'diagnosis', header: 'Diagnosis' }, { key: 'date', header: 'Tanggal' } ] },
  prescriptions: { title: 'Daftar Resep', endpoint: '/prescriptions', form: 'Prescription', columns: [ { key: 'id', header: 'ID' }, { key: 'consultation_id', header: 'ID Konsultasi' }, { key: 'medicine_name', header: 'Nama Obat' }, { key: 'dosage', header: 'Dosis' } ] },
  'obat-from-apotek': { title: 'Data Obat (dari Apotek)', endpoint: '/obat', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Obat' }, { key: 'stock', header: 'Stok' }, { key: 'price', header: 'Harga (Rp)' } ] },
};

function HospitalDashboard() {
  const [activeView, setActiveView] = useState('patients');
  const [viewKey, setViewKey] = useState(Date.now());
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Fungsi untuk navigasi utama
  const handleNavClick = (view) => {
    setActiveView(view);
    setError('');
    setEditingItem(null);
    setViewKey(Date.now());
  };

  // --- Alur CRUD Kontekstual (Direkomendasikan) ---
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
      const apiBaseUrl = activeView === 'obat-from-apotek' ? APOTEK_API_URL : HOSPITAL_API_URL;
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

  // Helper untuk merender form Add/Update yang relevan
  const getFormComponent = (viewType, isUpdate = false) => {
    const entityName = viewType.toLowerCase().replace('add', '').replace('update', '');
    const props = {
      onSuccess: () => handleNavClick(entityName + 's'),
      onError: setError,
      isUpdateMode: isUpdate,
      initialData: isUpdate ? editingItem : null,
    };
    
    if (entityName === 'patient') return <AddPatientForm {...props} />;
    if (entityName === 'doctor') return <AddDoctorForm {...props} />;
    if (entityName === 'consultation') return <AddConsultationForm {...props} />;
    if (entityName === 'prescription') return <AddPrescriptionForm {...props} />;
    return null;
  };

  return (
    <div className="container">
      {/* Bagian Navigasi */}
      <nav className="navigation">
        <p><strong>Lihat Data:</strong></p>
        <button onClick={() => handleNavClick('patients')}>Pasien</button>
        <button onClick={() => handleNavClick('doctors')}>Dokter</button>
        <button onClick={() => handleNavClick('consultations')}>Konsultasi</button>
        <button onClick={() => handleNavClick('prescriptions')}>Resep</button>
        <button onClick={() => handleNavClick('obat-from-apotek')}>Obat (dari Apotek)</button>
      </nav>
      <nav className="navigation">
        <p><strong>Tambah Data:</strong></p>
        <button className="add-btn" onClick={() => handleNavClick('addPatient')}>+ Pasien</button>
        <button className="add-btn" onClick={() => handleNavClick('addDoctor')}>+ Dokter</button>
        <button className="add-btn" onClick={() => handleNavClick('addConsultation')}>+ Konsultasi</button>
        <button className="add-btn" onClick={() => handleNavClick('addPrescription')}>+ Resep</button>
      </nav>
      <nav className="navigation">
        <p><strong>Aksi Manual:</strong></p>
        <button className="edit-btn" onClick={() => handleNavClick('manageDoctor')}>Kelola Dokter by ID</button>
        {/* Anda bisa menambahkan tombol serupa untuk entitas lain di sini */}
      </nav>

      {/* Bagian Konten Utama */}
      <div className="content">
        {error && <p className="error-message">Error: {error}</p>}
        
        {/* Render DataViewer jika view aktif ada di dataConfigs */}
        {dataConfigs[activeView] && (
          <DataViewer 
            key={viewKey}
            config={dataConfigs[activeView]}
            apiBaseUrl={activeView === 'obat-from-apotek' ? APOTEK_API_URL : HOSPITAL_API_URL}
            onError={setError}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
        
        {/* Render form Add/Update (alur kontekstual) */}
        {getFormComponent(activeView, activeView.startsWith('update'))}

        {/* Render form Manage by ID (alur manual) */}
        {activeView === 'manageDoctor' && (
          <ManageDoctorForm
            onSuccess={() => handleNavClick('doctors')}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
}

export default HospitalDashboard;