// apotek-frontend/src/EditObatForm.js
import React, { useState, useEffect } from 'react';

function EditObatForm({ obat, onSuccess, onError }) {
    // Inisialisasi state formData dengan data obat yang diterima melalui prop
    const [formData, setFormData] = useState({
        name: obat?.name || '',
        stock: obat?.stock || '',
        price: obat?.price || ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); 

    // Efek ini akan berjalan setiap kali prop 'obat' berubah
    useEffect(() => {
        if (obat) {
            setFormData({
                name: obat.name || '',
                stock: obat.stock || '',
                price: obat.price || ''
            });
            setMessage(''); // Reset pesan jika data obat berubah
            onError(''); // Reset pesan error dari parent
        }
    }, [obat]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); 
        onError(''); 
        setLoading(true); 

        try {
            const response = await fetch(`/api-apotek/obat/${obat.id}`, { 
                method: 'PUT', // Menggunakan method PUT untuk update
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    stock: parseInt(formData.stock, 10), 
                    price: parseFloat(formData.price) 
                }),
            });
            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'Gagal memperbarui data.');
            }
            
            setMessage('Obat berhasil diperbarui!');
            onSuccess(); // Panggil callback onSuccess dari parent
        } catch (e) {
            onError(e.message); 
        } finally {
            setLoading(false); 
        }
    };

    // Tampilkan pesan loading jika data obat belum dimuat ke dalam form (opsional)
    if (!obat) {
        return <p>Memuat detail obat...</p>;
    }

    return (
        <div className="form-container">
            <h2>Edit Obat: {obat.name} (ID: {obat.id})</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="edit-name">Nama Obat</label>
                    <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-stock">Stok</label>
                    <input
                        type="number"
                        id="edit-stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-price">Harga</label>
                    <input
                        type="number"
                        id="edit-price"
                        name="price"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
        </div>
    );
}

export default EditObatForm;