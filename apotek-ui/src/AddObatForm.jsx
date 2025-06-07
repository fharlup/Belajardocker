import React, { useState } from 'react';

function AddObatForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({ name: '', stock: '', price: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch('/api-apotek/obat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    stock: parseInt(formData.stock, 10),
                    price: parseFloat(formData.price)
                }),
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan data.');
            
            setMessage('Obat berhasil ditambahkan!');
            onSuccess();
        } catch (e) {
            onError(e.message);
        }
    };
    return (
        <div className="form-container">
          <h2>Tambah Obat Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Obat</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stok</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Harga</label>
              <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>
            <button type="submit">Simpan</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
    );
}
export default AddObatForm;