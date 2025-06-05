import React, { useState } from 'react';

function AddDoctorForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({ name: '', specialization: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api-hospital/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal');
      setMessage('Dokter berhasil ditambahkan!');
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Tambah Dokter Baru</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nama Dokter" required />
        <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Spesialisasi" required />
        <button type="submit">Simpan Dokter</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}
export default AddDoctorForm;