// ... (impor dan fungsi lainnya tetap sama)
import React, { useState } from 'react';

function AddSupplierForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({ name: '', contact: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // PERUBAHAN: URL diubah ke path proxy
            const response = await fetch('/api-apotek/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan data.');
            
            setMessage('Supplier berhasil ditambahkan!');
            onSuccess();
        } catch (e) {
            onError(e.message);
        }
    };
    // ... (return JSX tidak berubah)
    return (
        <div className="form-container">
          <h2>Tambah Supplier Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Supplier</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Kontak</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
            </div>
            <button type="submit">Simpan</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
    );
}
export default AddSupplierForm;