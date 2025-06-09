import React, { useState } from 'react';
import DataViewer from './DataViewer';
import AddPatientForm from './AddPatientForm';
import AddDoctorForm from './AddDoctorForm';
import AddConsultationForm from './AddConsultationForm';
import AddDiagnosisForm from './AddDiagnosisForm';
import AddPrescriptionForm from './AddPrescriptionForm';
import AddHealthMonitoringForm from './AddHealthMonitoringForm';

const HOSPITAL_API_URL = '/api-hospital'; // Proxy ke backend Node.js

const dataConfigs = {
    patients: {
        title: 'Daftar Pasien', endpoint: '/patients', form: 'Patient',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Pasien' },
            { key: 'age', header: 'Umur' }, { key: 'address', header: 'Alamat' },
            { key: 'phone', header: 'Telepon' }
        ]
    },
    doctors: {
        title: 'Daftar Dokter', endpoint: '/doctors', form: 'Doctor',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Dokter' },
            { key: 'specialization', header: 'Spesialisasi' }
        ]
    },
    consultations: {
        title: 'Daftar Konsultasi', endpoint: '/consultations', form: 'Consultation',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'patient_id', header: 'ID Pasien' },
            { key: 'doctor_id', header: 'ID Dokter' }, { key: 'symptoms', header: 'Gejala' },
            { key: 'date', header: 'Tanggal' }
        ]
    },
    diagnoses: {
        title: 'Daftar Diagnosa', endpoint: '/diagnoses', form: 'Diagnosis',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'consultation_id', header: 'ID Konsultasi' },
            { key: 'diagnosis_text', header: 'Teks Diagnosa' }, { key: 'diagnosis_date', header: 'Tanggal Diagnosa' }
        ]
    },
    prescriptions: {
        title: 'Daftar Resep', endpoint: '/prescriptions', form: 'Prescription',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'diagnosis_id', header: 'ID Diagnosa' },
            { key: 'medicine_name', header: 'Nama Obat' }, { key: 'dosage', header: 'Dosis' }
        ]
    },
    'health-monitorings': {
        title: 'Daftar Monitoring Kesehatan', endpoint: '/health-monitorings', form: 'HealthMonitoring',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'diagnosis_id', header: 'ID Diagnosa' },
            { key: 'kota_kejadian', header: 'Kota Kejadian' }, { key: 'monitoring_date', header: 'Tanggal Monitoring' }
        ]
    },
    'obat-from-apotek': {
        title: 'Data Obat (dari Apotek)', endpoint: '/obat-from-apotek',
        columns: [
            { key: 'id', header: 'ID' }, { key: 'name', header: 'Nama Obat' },
            { key: 'stock', header: 'Stok' }, { key: 'price', header: 'Harga (Rp)' }
        ],
        isExternal: true
    },
};

function HospitalDashboard() {
    const [activeView, setActiveView] = useState('patients');
    const [viewKey, setViewKey] = useState(Date.now());
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [obatIdFilter, setObatIdFilter] = useState(''); // State untuk filter ID obat

    const handleNavClick = (view) => {
        setActiveView(view);
        setError('');
        setEditingItem(null);
        setViewKey(Date.now()); // Forces DataViewer to re-render
        setObatIdFilter(''); // Reset filter saat pindah view
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
            const apiBaseUrl = HOSPITAL_API_URL;
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

    const getFormComponent = (viewType, isUpdate = false) => {
        const entityName = viewType.toLowerCase().replace('add', '').replace('update', '');

        const props = {
            onSuccess: () => handleNavClick(entityName + 's'),
            onError: setError,
            isUpdateMode: isUpdate,
            initialData: isUpdate ? editingItem : null,
        };

        switch (entityName) {
            case 'patient': return <AddPatientForm {...props} />;
            case 'doctor': return <AddDoctorForm {...props} />;
            case 'consultation': return <AddConsultationForm {...props} />;
            case 'diagnosis': return <AddDiagnosisForm {...props} />;
            case 'prescription': return <AddPrescriptionForm {...props} />;
            case 'healthmonitoring': return <AddHealthMonitoringForm {...props} />;
            default: return null;
        }
    };

    return (
        <div className="container">
            {/* Navigation Section */}
            <nav className="navigation">
                <p><strong>Lihat Data:</strong></p>
                <button onClick={() => handleNavClick('patients')}>Pasien</button>
                <button onClick={() => handleNavClick('doctors')}>Dokter</button>
                <button onClick={() => handleNavClick('consultations')}>Konsultasi</button>
                <button onClick={() => handleNavClick('diagnoses')}>Diagnosa</button>
                <button onClick={() => handleNavClick('prescriptions')}>Resep</button>
                <button onClick={() => handleNavClick('health-monitorings')}>Monitoring Kesehatan</button>
                <button onClick={() => handleNavClick('obat-from-apotek')}>Obat (dari Apotek)</button>
            </nav>
            <nav className="navigation">
                <p><strong>Tambah Data:</strong></p>
                <button className="add-btn" onClick={() => handleNavClick('addPatient')}>+ Pasien</button>
                <button className="add-btn" onClick={() => handleNavClick('addDoctor')}>+ Dokter</button>
                <button className="add-btn" onClick={() => handleNavClick('addConsultation')}>+ Konsultasi</button>
                <button className="add-btn" onClick={() => handleNavClick('addDiagnosis')}>+ Diagnosa</button>
                <button className="add-btn" onClick={() => handleNavClick('addPrescription')}>+ Resep</button>
                <button className="add-btn" onClick={() => handleNavClick('addHealthMonitoring')}>+ Monitoring</button>
            </nav>

            {/* Filter untuk obat-from-apotek */}
            {activeView === 'obat-from-apotek' && (
                <div style={{ margin: '10px 0' }}>
                    <label>
                        Filter Obat by ID:{' '}
                        <input
                            type="text"
                            value={obatIdFilter}
                            onChange={(e) => setObatIdFilter(e.target.value)}
                            placeholder="Masukkan ID obat"
                        />
                    </label>
                    <button onClick={() => setViewKey(Date.now())}>Apply Filter</button>
                    <p style={{fontSize: '0.9em', color: '#555'}}>
                        * Masukkan ID obat untuk filter, kosongkan untuk tampil semua.
                    </p>
                </div>
            )}

            {/* Main Content Section */}
            <div className="content">
                {error && <p className="error-message">Error: {error}</p>}

                {/* Render DataViewer jika activeView ada di dataConfigs */}
                {dataConfigs[activeView] && (
                    <DataViewer
                        key={viewKey}
                        config={{
                            ...dataConfigs[activeView],
                            endpoint: activeView === 'obat-from-apotek' && obatIdFilter
                                ? `${dataConfigs[activeView].endpoint}?id=${encodeURIComponent(obatIdFilter)}`
                                : dataConfigs[activeView].endpoint
                        }}
                        apiBaseUrl={HOSPITAL_API_URL}
                        onError={setError}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                )}

                {/* Render Add/Update form */}
                {getFormComponent(activeView, activeView.startsWith('update'))}
            </div>
        </div>
    );
}

export default HospitalDashboard;
