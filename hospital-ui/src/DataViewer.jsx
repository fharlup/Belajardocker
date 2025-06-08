import React, { useState, useEffect } from 'react';

function DataViewer({ config, apiBaseUrl, onError, onDelete, onUpdate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      onError(''); // Reset error message
      const fullUrl = `${apiBaseUrl}${config.endpoint}`;

      try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data (status: ${response.status})`);
        }
        const result = await response.json();

        // Handle different API response structures
        if (result.status === 'success') {
          // For standard API responses like patients, doctors, etc.
          setData(result.data);
        } else if (config.endpoint === '/obat-from-apotek' && Array.isArray(result)) {
          // For Apotek data, which might return a direct array
          setData(result);
        } else if (config.endpoint === '/health-statistics' && result.status === 'success') {
          // For health-statistics, the data is nested.
          // We'll prepare it for display, potentially by flattening or special handling.
          // The actual rendering logic will need to handle this.
          setData(result.data);
        } else if (result.status === 'error') {
          throw new Error(result.message);
        } else {
          setData([]); // Fallback for unexpected structures
        }
      } catch (e) {
        onError(e.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config, apiBaseUrl, onError]);

  if (loading) {
    return <div className="loading">Loading {config.title}...</div>;
  }

  // --- Helper function to render complex data (like health statistics) ---
  const renderComplexData = (data) => {
    if (!data || typeof data !== 'object') {
      return <p>Tidak ada data untuk ditampilkan.</p>;
    }

    return (
      <div className="complex-data-display">
        {data.diseases && (
          <div>
            <h3>Penyakit</h3>
            <ul>
              {Object.entries(data.diseases).map(([diseaseName, stats]) => (
                <li key={diseaseName}>
                  <strong>{diseaseName}:</strong> Total Kasus: {stats.total_cases}, Kasus Aktif: {stats.active_cases}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.locations && (
          <div>
            <h3>Lokasi Kejadian</h3>
            <ul>
              {Object.entries(data.locations).map(([locationName, count]) => (
                <li key={locationName}>
                  <strong>{locationName}:</strong> {count} Kasus
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render logic for Health Statistics
  if (config.endpoint === '/health-statistics') {
    return (
      <div className="data-viewer">
        <h2>{config.title}</h2>
        {data ? renderComplexData(data) : <p>Tidak ada data statistik untuk ditampilkan.</p>}
      </div>
    );
  }

  // Render logic for regular table data (Patients, Doctors, Consultations, Diagnoses, Prescriptions, Health Monitorings, Apotek Obat)
  return (
    <div className="data-viewer">
      <h2>{config.title}</h2>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              {config.columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
              {/* Hanya tampilkan kolom Aksi jika bukan data eksternal (read-only) */}
              {!config.isExternal && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                {config.columns.map((col) => (
                  <td key={col.key} data-label={col.header}>
                    {/* Format harga jika ada */}
                    {col.key === 'price'
                      ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(item[col.key])
                      : (col.key.includes('date') || col.key.includes('Date')) // Cek apakah key mengandung 'date' atau 'Date'
                        ? item[col.key] ? new Date(item[col.key]).toLocaleDateString() : '' // Format tanggal
                        : item[col.key]}
                  </td>
                ))}
                {/* Hanya tampilkan tombol Aksi jika bukan data eksternal */}
                {!config.isExternal && (
                  <td data-label="Aksi">
                    <button
                      className="icon-btn edit"
                      onClick={() => onUpdate(item)}
                      title="Edit"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#4caf50',
                        fontSize: '18px',
                        marginRight: '8px',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => onDelete(item)}
                      title="Hapus"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#f44336',
                        fontSize: '18px',
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Tidak ada data.</p>
      )}
    </div>
  );
}

export default DataViewer;