import React, { useState } from 'react';

function AddPatientForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({ name: '', age: '', address: '', phone: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api-hospital/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age, 10) }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal');
      setMessage('Pasien berhasil ditambahkan!');
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Tambah Pasien Baru</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" required />
        <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Umur" required />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Alamat" required />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="No. Telepon" required />
        <button type="submit">Simpan Pasien</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}
export default AddPatientForm;