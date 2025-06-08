import React, { useState, useEffect } from 'react';

function AddDoctorForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({ name: '', specialization: '' });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        name: initialData.name || '',
        specialization: initialData.specialization || '',
      });
    }
  }, [isUpdateMode, initialData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isUpdateMode
        ? `/api-hospital/doctors/${initialData.id}`
        : '/api-hospital/doctors';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} dokter.`);
      }

      alert(`Dokter berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Data Dokter' : 'Tambah Dokter Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Dokter</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="specialization">Spesialisasi</label>
          <input
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{isUpdateMode ? 'Simpan Perubahan' : 'Simpan Dokter'}</button>
      </form>
    </div>
  );
}

export default AddDoctorForm;
