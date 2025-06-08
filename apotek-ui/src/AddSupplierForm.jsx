import React, { useState, useEffect } from 'react';

function AddSupplierForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        name: initialData.name || '',
        contact: initialData.contact || '',
      });
    }
  }, [initialData, isUpdateMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(''); // Reset error
    setLoading(true);

    try {
      const endpoint = isUpdateMode
        ? `/api-apotek/suppliers/${initialData.id}`
        : '/api-apotek/suppliers';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} supplier.`);
      }

      alert(`Supplier berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      if (!isUpdateMode) {
        setFormData({ name: '', contact: '' }); // reset form hanya untuk tambah baru
      }
      onSuccess();
    } catch (e) {
      onError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Supplier' : 'Tambah Supplier Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Supplier</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Kontak</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? (isUpdateMode ? 'Menyimpan...' : 'Menyimpan...') : (isUpdateMode ? 'Simpan Perubahan' : 'Simpan')}
        </button>
      </form>
    </div>
  );
}

export default AddSupplierForm;
