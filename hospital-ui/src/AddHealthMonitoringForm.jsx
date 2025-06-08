import React, { useState, useEffect } from 'react';
import AddPrescriptionForm from './AddPrescriptionForm';
import AddHealthMonitoringForm from './AddHealthMonitoringForm'; // Import komponen baru

function DiagnosisDetailPage({ diagnosisId }) {
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState(null);
  const [showAddMonitoring, setShowAddMonitoring] = useState(false); // State baru untuk monitoring
  const [monitoringToEdit, setMonitoringToEdit] = useState(null); // State baru untuk data monitoring yang akan di-edit

  const fetchDiagnosisDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api-hospital/diagnoses/${diagnosisId}`);
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal mengambil detail diagnosa.');
      }
      setDiagnosis(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diagnosisId) {
      fetchDiagnosisDetails();
    }
  }, [diagnosisId]);

  const handlePrescriptionSuccess = () => {
    fetchDiagnosisDetails();
    setShowAddPrescription(false);
    setPrescriptionToEdit(null);
  };

  // Handler baru untuk sukses monitoring
  const handleMonitoringSuccess = () => {
    fetchDiagnosisDetails();
    setShowAddMonitoring(false); // Sembunyikan form tambah monitoring
    setMonitoringToEdit(null); // Reset mode edit
  };

  const handleError = (message) => {
    setError(message);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!diagnosis) return <div>Diagnosa tidak ditemukan.</div>;

  return (
    <div>
      <h1>Detail Diagnosa</h1>
      <p>ID Diagnosa: {diagnosis.id}</p>
      <p>ID Konsultasi: {diagnosis.consultation_id}</p>
      <p>Teks Diagnosa: {diagnosis.diagnosis_text}</p>
      <p>Tanggal Diagnosa: {new Date(diagnosis.diagnosis_date).toLocaleDateString()}</p>

      <hr />
      <h2>Daftar Resep Obat</h2>
      {diagnosis.prescriptions && diagnosis.prescriptions.length > 0 ? (
        <ul>
          {diagnosis.prescriptions.map(pres => (
            <li key={pres.id}>
              {pres.medicine_name} - {pres.dosage}
              <button onClick={() => { setPrescriptionToEdit(pres); setShowAddPrescription(true); }}>Edit</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Belum ada resep untuk diagnosa ini.</p>
      )}
      <button onClick={() => { setShowAddPrescription(true); setPrescriptionToEdit(null); }}>
        Tambah Resep Baru
      </button>

      {showAddPrescription && (
        <AddPrescriptionForm
          onSuccess={handlePrescriptionSuccess}
          onError={handleError}
          initialData={prescriptionToEdit}
          isUpdateMode={!!prescriptionToEdit}
          diagnosisId={diagnosis.id}
        />
      )}

      <hr />
      <h2>Catatan Monitoring Kesehatan</h2>
      {diagnosis.health_monitorings && diagnosis.health_monitorings.length > 0 ? (
        <ul>
          {diagnosis.health_monitorings.map(monitor => (
            <li key={monitor.id}>
              {monitor.kota_kejadian} ({new Date(monitor.monitoring_date).toLocaleDateString()})
              <button onClick={() => { setMonitoringToEdit(monitor); setShowAddMonitoring(true); }}>Edit</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Belum ada catatan monitoring kesehatan.</p>
      )}
      <button onClick={() => { setShowAddMonitoring(true); setMonitoringToEdit(null); }}>
        Tambah Catatan Monitoring
      </button>

      {showAddMonitoring && (
        <AddHealthMonitoringForm
          onSuccess={handleMonitoringSuccess}
          onError={handleError}
          initialData={monitoringToEdit}
          isUpdateMode={!!monitoringToEdit}
          diagnosisId={diagnosis.id}
        />
      )}
    </div>
  );
}

export default DiagnosisDetailPage;