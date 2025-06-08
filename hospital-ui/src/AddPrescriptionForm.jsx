import React, { useState, useEffect } from 'react';

function AddPrescriptionForm({ onSuccess, onError, initialData, isUpdateMode, diagnosisId }) {
  const [formData, setFormData] = useState({
    diagnosis_id: diagnosisId || '', // Menerima diagnosisId dari props
    medicine_name: '',
    dosage: ''
  });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        diagnosis_id: initialData.diagnosis_id || '',
        medicine_name: initialData.medicine_name || '',
        dosage: initialData.dosage || ''
      });
    } else if (diagnosisId) {
      // Jika mode tambah dan diagnosisId disediakan, set otomatis
      setFormData(prev => ({ ...prev, diagnosis_id: diagnosisId }));
    }
  }, [initialData, isUpdateMode, diagnosisId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isUpdateMode
        ? `/api-hospital/prescriptions/${initialData.id}` // Jika update, gunakan ID resep yang ada
        : '/api-hospital/prescriptions';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          diagnosis_id: parseInt(formData.diagnosis_id, 10), // Pastikan ID adalah integer
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(
          result.message ||
          `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} resep.`
        );
      }

      alert(`Resep berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess(); // Panggil onSuccess untuk memberi tahu komponen induk agar merefresh data
      
      // Reset form jika dalam mode tambah setelah berhasil submit
      if (!isUpdateMode) {
        setFormData(prev => ({ ...prev, medicine_name: '', dosage: '' }));
      }

    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Resep' : 'Tambah Resep Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="diagnosis_id">ID Diagnosa</label>
          <input
            id="diagnosis_id"
            name="diagnosis_id"
            type="number"
            value={formData.diagnosis_id}
            onChange={handleChange}
            required
            disabled={isUpdateMode || diagnosisId} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="medicine_name">Nama Obat</label>
          <input
            id="medicine_name"
            name="medicine_name"
            type="text"
            value={formData.medicine_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dosage">Dosis</label>
          <input
            id="dosage"
            name="dosage"
            type="text"
            value={formData.dosage}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          {isUpdateMode ? 'Simpan Perubahan Resep' : 'Simpan Resep'}
        </button>
      </form>
    </div>
  );
}

export default AddPrescriptionForm;