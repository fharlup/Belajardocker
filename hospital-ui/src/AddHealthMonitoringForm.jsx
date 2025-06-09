import React, { useState, useEffect } from 'react';

function AddHealthMonitoringForm({ onSuccess, onError, initialData, isUpdateMode, diagnosisId }) {
  const [formData, setFormData] = useState({
    diagnosis_id: '',
    kota_kejadian: '',
  });

  useEffect(() => {
    if (isUpdateMode && initialData) {
      setFormData({
        diagnosis_id: initialData.diagnosis_id || '',
        kota_kejadian: initialData.kota_kejadian || '',
      });
    }
  }, [initialData, isUpdateMode]);

  useEffect(() => {
    // Set diagnosis_id otomatis di mode tambah kalau props ada
    if (!isUpdateMode && diagnosisId) {
      setFormData(prev => ({ ...prev, diagnosis_id: diagnosisId }));
    }
  }, [diagnosisId, isUpdateMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi manual
    if (!formData.diagnosis_id || !formData.kota_kejadian.trim()) {
      onError('Mohon isi semua field terlebih dahulu.');
      return;
    }

    const endpoint = isUpdateMode
      ? `/api-hospital/health-monitorings/${initialData.id}`
      : '/api-hospital/health-monitorings';

    const method = isUpdateMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis_id: parseInt(formData.diagnosis_id, 10),
          kota_kejadian: formData.kota_kejadian.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
      
      }

      alert(`Monitoring kesehatan berhasil ${isUpdateMode ? 'diupdate' : 'ditambahkan'}!`);
      onSuccess();

      if (!isUpdateMode) {
        setFormData(prev => ({ ...prev, kota_kejadian: '' }));
      }
    } catch (err) {
    
    }
  };

  return (
    <div className="form-container">
      <h2>{isUpdateMode ? 'Update Monitoring Kesehatan' : 'Tambah Monitoring Kesehatan'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="diagnosis_id">ID Diagnosa</label>
          <input
            type="number"
            id="diagnosis_id"
            name="diagnosis_id"
            value={formData.diagnosis_id}
            onChange={handleChange}
            required
            disabled={!!diagnosisId || isUpdateMode}
          />
        </div>
        <div className="form-group">
          <label htmlFor="kota_kejadian">Kota Kejadian</label>
          <input
            type="text"
            id="kota_kejadian"
            name="kota_kejadian"
            value={formData.kota_kejadian}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{isUpdateMode ? 'Simpan Perubahan' : 'Simpan Monitoring'}</button>
      </form>
    </div>
  );
}

export default AddHealthMonitoringForm;
