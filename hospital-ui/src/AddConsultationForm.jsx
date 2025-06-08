import React, { useState } from 'react';

function AddConsultationForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', symptoms: '', diagnosis: '', date: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api-hospital/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            patient_id: parseInt(formData.patient_id, 10),
            doctor_id: parseInt(formData.doctor_id, 10)
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan konsultasi.');
      setMessage('Konsultasi berhasil ditambahkan!');
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Tambah Konsultasi Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>ID Pasien</label>
            <input name="patient_id" type="number" value={formData.patient_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>ID Dokter</label>
            <input name="doctor_id" type="number" value={formData.doctor_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>Gejala (Symptoms)</label>
            <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>Diagnosis</label>
            <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>Tanggal</label>
            <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <button type="submit">Simpan Konsultasi</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}

export default AddConsultationForm; // <-- BARIS PENTING YANG DITAMBAHKAN