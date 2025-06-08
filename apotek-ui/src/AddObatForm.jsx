import React, { useState, useEffect } from 'react';

function AddObatForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        name: initialData.name || '',
        stock: initialData.stock !== undefined ? initialData.stock.toString() : '',
        price: initialData.price !== undefined ? initialData.price.toString() : '',
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
        ? `/api-apotek/obat/${initialData.id}`
        : '/api-apotek/obat';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          stock: parseInt(formData.stock, 10),
          price: parseFloat(formData.price),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} data obat.`);
      }

      alert(`Obat berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      if (!isUpdateMode) {
        setFormData({ name: '', stock: '', price: '' }); // reset form hanya saat tambah baru
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
      <h2>{isUpdateMode ? 'Update Obat' : 'Tambah Obat Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Obat</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock">Stok</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Harga</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? (isUpdateMode ? 'Menyimpan...' : 'Menyimpan...') : (isUpdateMode ? 'Simpan Perubahan' : 'Simpan')}
        </button>
      </form>
    </div>
  );
}

export default AddObatForm;
