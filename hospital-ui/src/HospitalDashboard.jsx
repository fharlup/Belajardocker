import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddPatientForm from './AddPatientForm';
import AddDoctorForm from './AddDoctorForm';
import AddConsultationForm from './AddConsultationForm'; // <-- Impor baru
import AddPrescriptionForm from './AddPrescriptionForm'; // <-- Impor baru

const HOSPITAL_API_URL = '/api-hospital';
const APOTEK_API_URL = '/api-apotek';

const dataConfigs = {
  patients: { title: 'Daftar Pasien', endpoint: '/patients', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Pasien' }, { key: 'age', header: 'Umur' }, { key: 'address', header: 'Alamat' } ] },
  doctors: { title: 'Daftar Dokter', endpoint: '/doctors', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Dokter' }, { key: 'specialization', header: 'Spesialisasi' } ] },
  consultations: { title: 'Daftar Konsultasi', endpoint: '/consultations', columns: [ { key: 'id', header: 'ID' }, { key: 'patient_id', header: 'ID Pasien' }, { key: 'doctor_id', header: 'ID Dokter' }, { key: 'diagnosis', header: 'Diagnosis' }, { key: 'date', header: 'Tanggal' } ] },
  prescriptions: { title: 'Daftar Resep', endpoint: '/prescriptions', columns: [ { key: 'id', header: 'ID' }, { key: 'consultation_id', header: 'ID Konsultasi' }, { key: 'medicine_name', header: 'Nama Obat' }, { key: 'dosage', header: 'Dosis' } ] },
  'obat-from-apotek': { title: 'Data Obat (dari Apotek)', endpoint: '/obat', columns: [ { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Obat' }, { key: 'stock', header: 'Stok' }, { key: 'price', header: 'Harga (Rp)' } ] },
};

function HospitalDashboard() {
  const [activeView, setActiveView] = useState('patients');
  const [viewKey, setViewKey] = useState(Date.now());
  const [error, setError] = useState('');

  const handleNavClick = (view) => {
    setActiveView(view);
    setError('');
    setViewKey(Date.now());
  };

  return (
    <div className="container">
      <h1>Dashboard Hospital</h1>
      <div className="navigation">
        <p><strong>Lihat Data:</strong></p>
        <button onClick={() => handleNavClick('patients')}>Pasien</button>
        <button onClick={() => handleNavClick('doctors')}>Dokter</button>
        <button onClick={() => handleNavClick('consultations')}>Konsultasi</button>
        <button onClick={() => handleNavClick('prescriptions')}>Resep</button>
        <button onClick={() => handleNavClick('obat-from-apotek')}>Obat (dari Apotek)</button>
      </div>
      <div className="navigation">
        <p><strong>Tambah Data:</strong></p>
        <button className="add-btn" onClick={() => handleNavClick('addPatient')}>+ Tambah Pasien</button>
        <button className="add-btn" onClick={() => handleNavClick('addDoctor')}>+ Tambah Dokter</button>
        <button className="add-btn" onClick={() => handleNavClick('addConsultation')}>+ Tambah Konsultasi</button>
        <button className="add-btn" onClick={() => handleNavClick('addPrescription')}>+ Tambah Resep</button>
      </div>

      <div className="content">
        {error && <p className="error-message">Error: {error}</p>}
        
        {dataConfigs[activeView] && (
          <DataViewer 
            key={viewKey}
            config={dataConfigs[activeView]}
            apiBaseUrl={activeView === 'obat-from-apotek' ? APOTEK_API_URL : HOSPITAL_API_URL}
            onError={setError}
          />
        )}
        
        {activeView === 'addPatient' && <AddPatientForm onSuccess={() => handleNavClick('patients')} onError={setError} />}
        {activeView === 'addDoctor' && <AddDoctorForm onSuccess={() => handleNavClick('doctors')} onError={setError} />}
        {activeView === 'addConsultation' && <AddConsultationForm onSuccess={() => handleNavClick('consultations')} onError={setError} />}
        {activeView === 'addPrescription' && <AddPrescriptionForm onSuccess={() => handleNavClick('prescriptions')} onError={setError} />}
      </div>
    </div>
  );
}

export default HospitalDashboard;