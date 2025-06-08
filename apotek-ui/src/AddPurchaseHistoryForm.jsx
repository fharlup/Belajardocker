import React, { useState, useEffect } from 'react';

function AddPurchaseHistoryForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({
    order_id: '',
    medicine_name: '',
    quantity: '',
    purchase_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        order_id: initialData.order_id || '',
        medicine_name: initialData.medicine_name || '',
        quantity: initialData.quantity || '',
        purchase_date: initialData.purchase_date || '',
      });
    }
  }, [initialData, isUpdateMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    setLoading(true);

    try {
      const endpoint = isUpdateMode
        ? `/api-apotek/purchase-history/${initialData.id}`
        : '/api-apotek/purchase-history';
      const method = isUpdateMode ? 'PUT' : 'POST';

      // Validasi agar order_id tidak kosong
      if (!formData.order_id || isNaN(parseInt(formData.order_id))) {
        throw new Error('Order ID wajib diisi dan harus berupa angka.');
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: parseInt(formData.order_id, 10),
          medicine_name: formData.medicine_name,
          quantity: parseInt(formData.quantity, 10),
          purchase_date: formData.purchase_date,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success')
        throw new Error(result.message || `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} riwayat pembelian.`);

      alert(`Riwayat pembelian berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);

      if (!isUpdateMode) {
        setFormData({
          order_id: '',
          medicine_name: '',
          quantity: '',
          purchase_date: '',
        });
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
      <h2>{isUpdateMode ? 'Update Riwayat Pembelian' : 'Tambah Riwayat Pembelian Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Order ID</label>
          <input
            type="number"
            name="order_id"
            value={formData.order_id}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Nama Obat</label>
          <input
            type="text"
            name="medicine_name"
            value={formData.medicine_name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Jumlah (Quantity)</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Tanggal Pembelian</label>
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? (isUpdateMode ? 'Menyimpan...' : 'Menyimpan...') : isUpdateMode ? 'Simpan Perubahan' : 'Simpan Riwayat'}
        </button>
      </form>
    </div>
  );
}

export default AddPurchaseHistoryForm;
