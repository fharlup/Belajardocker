import React, { useState } from 'react';

function AddConsultationForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    symptoms: '',
    date: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api-hospital/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patient_id: parseInt(formData.patient_id, 10),
          doctor_id: parseInt(formData.doctor_id, 10),
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal menambahkan konsultasi.');
      }

      alert('Konsultasi berhasil ditambahkan!');
      onSuccess();
      setFormData({ patient_id: '', doctor_id: '', symptoms: '', date: '' });

    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Tambah Konsultasi Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patient_id">ID Pasien</label>
          <input
            id="patient_id"
            name="patient_id"
            type="number"
            value={formData.patient_id}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="doctor_id">ID Dokter</label>
          <input
            id="doctor_id"
            name="doctor_id"
            type="number"
            value={formData.doctor_id}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Gejala</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Tanggal Konsultasi</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Simpan Konsultasi</button>
      </form>
    </div>
  );
}

export default AddConsultationForm;
