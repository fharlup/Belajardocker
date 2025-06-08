import React, { useState } from 'react';

function ManageDoctorForm({ onSuccess, onError }) {
  // State untuk menyimpan ID yang diketik pengguna
  const [id, setId] = useState('');
  
  // State untuk menyimpan data dokter SETELAH berhasil dicari
  const [doctorData, setDoctorData] = useState(null);
  
  // State untuk loading dan pesan error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- FUNGSI-FUNGSI ---

  // 1. Fungsi untuk MENCARI data dokter berdasarkan ID
  const handleFetchDoctor = async () => {
    if (!id) {
      setError('Silakan masukkan ID Dokter terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    setError('');
    setDoctorData(null); // Reset data sebelumnya setiap kali mencari
    try {
      const response = await fetch(`/api-hospital/doctors/${id}`);
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || `Dokter dengan ID ${id} tidak ditemukan.`);
      }
      setDoctorData(result.data); // Simpan data dokter yang ditemukan ke state
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fungsi untuk menangani perubahan pada form (setelah data ditemukan)
  const handleChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  // 3. Fungsi untuk mengirim request UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api-hospital/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal mengupdate data.');
      }
      alert('Data Dokter berhasil diupdate!');
      onSuccess(); // Kembali ke halaman utama/daftar dokter
    } catch (err) {
      onError(err.message);
    }
  };

  // 4. Fungsi untuk mengirim request DELETE
  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus dokter ${doctorData.name}?`)) {
      return;
    }
    try {
      const response = await fetch(`/api-hospital/doctors/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal menghapus data.');
      }
      alert('Data Dokter berhasil dihapus!');
      onSuccess();
    } catch (err) {
      onError(err.message);
    }
  };

  // --- TAMPILAN JSX ---
  return (
    <div className="form-container">
      <h2>Kelola Data Dokter</h2>
      <p className="form-note">Masukkan ID Dokter untuk Update atau Delete.</p>
      
      {/* Bagian untuk mencari ID */}
      <div className="form-group">
        <label htmlFor="search-id">ID Dokter</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            id="search-id"
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Ketik ID lalu klik Cari"
          />
          <button onClick={handleFetchDoctor} disabled={isLoading}>
            {isLoading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </div>

      {/* Tampilkan pesan error jika ada */}
      {error && <p className="error-message">{error}</p>}

      {/* Form untuk Update/Delete ini hanya akan muncul JIKA data sudah ditemukan */}
      {doctorData && (
        <form onSubmit={handleUpdate} style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <h4>Data Ditemukan</h4>
          <div className="form-group">
            <label htmlFor="name">Nama Dokter</label>
            <input id="name" name="name" value={doctorData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="specialization">Spesialisasi</label>
            <input id="specialization" name="specialization" value={doctorData.specialization} onChange={handleChange} required />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
            <button type="submit">Update Data</button>
            <button type="button" className="delete-btn" onClick={handleDelete}>Delete Data</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ManageDoctorForm;