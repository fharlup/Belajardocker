import React, { useState, useEffect } from 'react';

function AddObatForm({ onSuccess, onError, initialData, isUpdateMode }) {
    const [formData, setFormData] = useState({ name: '', stock: '', price: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isUpdateMode && initialData) {
            setFormData({
                name: initialData.name || '',
                stock: initialData.stock || '',
                price: initialData.price || ''
            });
        }
    }, [isUpdateMode, initialData]);

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
                    price: parseFloat(formData.price)
                }),
            });

            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} data.`);
            }

            setMessage(`Obat berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
            if (!isUpdateMode) {
                setFormData({ name: '', stock: '', price: '' }); // Reset hanya saat tambah
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
            <h2>{isUpdateMode ? 'Edit Data Obat' : 'Tambah Obat Baru'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="add-name">Nama Obat</label>
                    <input
                        type="text"
                        id="add-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="add-stock">Stok</label>
                    <input
                        type="number"
                        id="add-stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="add-price">Harga</label>
                    <input
                        type="number"
                        id="add-price"
                        name="price"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? (isUpdateMode ? 'Menyimpan Perubahan...' : 'Menyimpan...') : (isUpdateMode ? 'Simpan Perubahan' : 'Simpan')}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
        </div>
    );
}

export default AddObatForm;
