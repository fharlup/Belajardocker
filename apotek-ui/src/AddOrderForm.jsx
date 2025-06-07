import React, { useState } from 'react';

function AddOrderForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({ obat_id: '', quantity: '', order_date: '' });
    const [message, setMessage] = useState('');
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch('/api-apotek/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    obat_id: parseInt(formData.obat_id, 10),
                    quantity: parseInt(formData.quantity, 10),
                    order_date: formData.order_date
                }),
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan order.');
            
            setMessage('Order berhasil ditambahkan!');
            onSuccess();
        } catch (e) {
            onError(e.message);
        }
    };
    return (
        <div className="form-container">
          <h2>Tambah Order Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ID Obat</label>
              <input type="number" name="obat_id" value={formData.obat_id} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Jumlah (Quantity)</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tanggal Order</label>
              <input type="date" name="order_date" value={formData.order_date} onChange={handleChange} required />
            </div>
            <button type="submit">Simpan Order</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
    );
}
export default AddOrderForm;