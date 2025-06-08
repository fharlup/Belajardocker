import React, { useState, useEffect } from 'react';

function AddOrderForm({ initialData = null, onSuccess, onError }) {
  // initialData kalau null berarti mode tambah,
  // kalau ada berarti mode edit
  const isEditMode = initialData !== null;

  const [formData, setFormData] = useState({
    obat_id: '',
    supplier_id: '',
    quantity: '',
    order_date: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        obat_id: initialData.obat_id || '',
        supplier_id: initialData.supplier_id || '',
        quantity: initialData.quantity || '',
        order_date: initialData.order_date || '',
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    onError('');

    if (isEditMode && (!initialData.id || initialData.id === null)) {
      onError('ID order tidak valid, tidak bisa update.');
      return;
    }

    try {
      const response = await fetch(isEditMode ? `/api-apotek/orders/${initialData.id}` : '/api-apotek/orders', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obat_id: parseInt(formData.obat_id, 10),
          supplier_id: parseInt(formData.supplier_id, 10),
          quantity: parseInt(formData.quantity, 10),
          order_date: formData.order_date,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || `Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} order.`);

      setMessage(`Order berhasil ${isEditMode ? 'diupdate' : 'ditambahkan'}!`);

      if (!isEditMode) {
        setFormData({
          obat_id: '',
          supplier_id: '',
          quantity: '',
          order_date: '',
        });
      }

      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isEditMode ? 'Edit Order' : 'Tambah Order Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Obat</label>
          <input type="number" name="obat_id" value={formData.obat_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>ID Supplier</label>
          <input type="number" name="supplier_id" value={formData.supplier_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Jumlah (Quantity)</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Tanggal Order</label>
          <input type="date" name="order_date" value={formData.order_date} onChange={handleChange} required />
        </div>
        <button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan Order'}</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}

export default AddOrderForm;
