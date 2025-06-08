import React, { useState } from 'react';

function AddPatientForm({ onSuccess, onError }) {
 function AddPatientForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({ name: '', age: '', address: '', phone: '' });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
      });
    }
  }, [initialData, isUpdateMode]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isUpdateMode ? `/api-hospital/patients/${initialData.id}` : '/api-hospital/patients';
    const method = isUpdateMode ? 'PUT' : 'POST';
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age, 10) }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} pasien.`);
      }
      alert(`Pasien berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Data Pasien' : 'Tambah Pasien Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Lengkap</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="age">Umur</label>
          <input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="address">Alamat</label>
          <input id="address" name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">No. Telepon</label>
          <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <button type="submit">{isUpdateMode ? 'Simpan Perubahan' : 'Simpan Pasien'}</button>
      </form>
    </div>
  );
}
}
export default AddPatientForm;