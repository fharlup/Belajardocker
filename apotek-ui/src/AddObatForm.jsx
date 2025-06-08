// apotek-frontend/src/AddObatForm.js
import React, { useState } from 'react';

function AddObatForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({ name: '', stock: '', price: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Reset pesan sukses sebelumnya
        onError(''); // Reset pesan error dari parent
        setLoading(true); 

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

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'Gagal menambahkan data.');
            }
            
            setMessage('Obat berhasil ditambahkan!');
            setFormData({ name: '', stock: '', price: '' }); // Reset formulir setelah sukses
            onSuccess(); // Panggil callback onSuccess dari parent
        } catch (e) {
            onError(e.message); 
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="form-container">
            <h2>Tambah Obat Baru</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="add-name">Nama Obat</label>
                    <input type="text" id="add-name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="add-stock">Stok</label>
                    <input type="number" id="add-stock" name="stock" value={formData.stock} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="add-price">Harga</label>
                    <input type="number" id="add-price" name="price" step="0.01" value={formData.price} onChange={handleChange} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
        </div>
    );
}

export default AddObatForm;