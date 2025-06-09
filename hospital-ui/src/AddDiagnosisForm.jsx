import React, { useState, useEffect } from 'react';

function AddDiagnosisForm({ onSuccess, onError, initialData, isUpdateMode }) {
  const [formData, setFormData] = useState({
    consultation_id: '',
    diagnosis_text: '',
  });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        consultation_id: initialData.consultation_id || '',
        diagnosis_text: initialData.diagnosis_text || '',
      });
    }
  }, [initialData, isUpdateMode]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isUpdateMode
        ? `/api-hospital/diagnoses/${initialData.id}`
        : '/api-hospital/diagnoses';
      const method = isUpdateMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consultation_id: parseInt(formData.consultation_id, 10),
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(
          result.message ||
            `Gagal ${isUpdateMode ? 'mengupdate' : 'menambahkan'} diagnosa.`
        );
      }

      alert(`Diagnosa berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess();
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Diagnosa' : 'Tambah Diagnosa Baru'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Konsultasi</label>
          <input
            name="consultation_id"
            type="number"
            value={formData.consultation_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Diagnosa Penyakit</label>
          <textarea
            name="diagnosis_text"
            value={formData.diagnosis_text}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          {isUpdateMode ? 'Simpan Perubahan' : 'Simpan Diagnosa'}
        </button>
      </form>
    </div>
  );
}

export default AddDiagnosisForm;
