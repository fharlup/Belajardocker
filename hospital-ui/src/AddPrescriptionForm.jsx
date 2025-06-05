import React, { useState } from 'react';

function AddPrescriptionForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({ consultation_id: '', medicine_name: '', dosage: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api-hospital/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            consultation_id: parseInt(formData.consultation_id, 10),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan resep.');
      setMessage('Resep berhasil ditambahkan!');
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Tambah Resep Baru</h2>
      <p className="form-note">Catatan: Masukkan ID Konsultasi dari data konsultasi yang sudah ada.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>ID Konsultasi</label>
            <input name="consultation_id" type="number" value={formData.consultation_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>Nama Obat</label>
            <input name="medicine_name" value={formData.medicine_name} onChange={handleChange} placeholder="Contoh: Paracetamol 500mg" required />
        </div>
        <div className="form-group">
            <label>Dosis</label>
            <input name="dosage" value={formData.dosage} onChange={handleChange} placeholder="Contoh: 3 x 1 hari" required />
        </div>
        <button type="submit">Simpan Resep</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}

export default AddPrescriptionForm; // <-- BARIS PENTING YANG DITAMBAHKAN