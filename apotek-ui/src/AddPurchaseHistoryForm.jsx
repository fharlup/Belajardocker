// ... (impor dan fungsi lainnya tetap sama)
import React, { useState } from 'react';

function AddPurchaseHistoryForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({ patient_id: '', medicine_name: '', quantity: '', purchase_date: '' });
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
            const response = await fetch('/api-apotek/purchase-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: parseInt(formData.patient_id, 10),
                    medicine_name: formData.medicine_name,
                    quantity: parseInt(formData.quantity, 10),
                    purchase_date: formData.purchase_date
                }),
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Gagal menambahkan riwayat pembelian.');
            
            setMessage('Riwayat pembelian berhasil ditambahkan!');
            onSuccess();
        } catch (e) {
            onError(e.message);
        }
    };
    // ... (return JSX tidak berubah)
    return (
        <div className="form-container">
          <h2>Tambah Riwayat Pembelian Baru</h2>
          <p className="form-note">Catatan: Untuk UI sederhana ini, masukkan ID Pasien secara manual.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ID Pasien</label>
              <input type="number" name="patient_id" value={formData.patient_id} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nama Obat</label>
              <input type="text" name="medicine_name" value={formData.medicine_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Jumlah (Quantity)</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tanggal Pembelian</label>
              <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} required />
            </div>
            <button type="submit">Simpan Riwayat</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
    );
}
export default AddPurchaseHistoryForm;