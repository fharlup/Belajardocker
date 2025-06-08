import React, { useState, useEffect } from 'react';

function AddConsultationForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    symptoms: '',
    diagnosis: '',
    date: '',
  });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        patient_id: initialData.patient_id || '',
        doctor_id: initialData.doctor_id || '',
        symptoms: initialData.symptoms || '',
        diagnosis: initialData.diagnosis || '',
        date: initialData.date || '',
      });
    }
  }, [initialData, isUpdateMode]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isUpdateMode
        ? `/api-hospital/consultations/${initialData.id}`
        : '/api-hospital/consultations';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patient_id: parseInt(formData.patient_id, 10),
          doctor_id: parseInt(formData.doctor_id, 10),
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(
          result.message ||
            `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} konsultasi.`
        );
      }

      alert(`Konsultasi berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Konsultasi' : 'Tambah Konsultasi Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Pasien</label>
          <input
            name="patient_id"
            type="number"
            value={formData.patient_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>ID Dokter</label>
          <input
            name="doctor_id"
            type="number"
            value={formData.doctor_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Gejala</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Tanggal</label>
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          {isUpdateMode ? 'Simpan Perubahan' : 'Simpan Konsultasi'}
        </button>
      </form>
    </div>
  );
}

export default AddConsultationForm;
