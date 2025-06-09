import React, { useState, useEffect } from 'react';

function DataViewer({ config, apiBaseUrl, onError, onDelete, onUpdate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      onError('');
      const fullUrl = `${apiBaseUrl}${config.endpoint}`;

      try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data (status: ${response.status})`);
        }
        const result = await response.json();

        if (result.status === 'success') {
          setData(result.data);
        } else if (config.endpoint === '/obat-from-apotek' && Array.isArray(result)) {
          setData(result);
        } else if (config.endpoint === '/health-statistics' && result.status === 'success') {
          setData(result.data);
        } else if (result.status === 'error') {
          throw new Error(result.message);
        } else {
          setData([]);
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

  // --- Fungsi untuk menghitung jumlah per kota ---
  const countByCity = (data, cityKey = 'kota_kejadian') => {
    const cityCount = {};
    data.forEach((item) => {
      const city = item[cityKey];
      if (city) {
        const cityFormatted = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        cityCount[cityFormatted] = (cityCount[cityFormatted] || 0) + 1;
      }
    });
    return cityCount;
  };

  // --- Render untuk data kompleks: Statistik Kesehatan ---
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

  // --- Render khusus untuk /health-statistics ---
  if (config.endpoint === '/health-statistics') {
    return (
      <div className="data-viewer">
        <h2>{config.title}</h2>
        {data ? renderComplexData(data) : <p>Tidak ada data statistik untuk ditampilkan.</p>}
      </div>
    );
  }

  // --- Render khusus untuk /health-monitorings (tampilkan kasus per kota) ---
  if (config.endpoint === '/health-monitorings') {
    const cityStats = countByCity(data);

    return (
      <div className="data-viewer">
        <h2>{config.title}</h2>

        {/* Tambahkan statistik jumlah kasus per kota */}
        <h3>Jumlah Kasus per Kota</h3>
        <ul>
          {Object.entries(cityStats).map(([city, count]) => (
            <li key={city}>
              <strong>{city}:</strong> {count} kasus
            </li>
          ))}
        </ul>

        {/* Tabel data monitoring */}
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key}>{col.header}</th>
                ))}
                {!config.isExternal && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index}>
                  {config.columns.map((col) => (
                    <td key={col.key} data-label={col.header}>
                      {col.key === 'price'
                        ? new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item[col.key])
                        : (col.key.includes('date') || col.key.includes('Date'))
                          ? item[col.key]
                            ? new Date(item[col.key]).toLocaleDateString()
                            : ''
                          : item[col.key]}
                    </td>
                  ))}
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

  // --- Default: Render tabel biasa untuk endpoint lain ---
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
              {!config.isExternal && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                {config.columns.map((col) => (
                  <td key={col.key} data-label={col.header}>
                    {col.key === 'price'
                      ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(item[col.key])
                      : (col.key.includes('date') || col.key.includes('Date'))
                        ? item[col.key]
                          ? new Date(item[col.key]).toLocaleDateString()
                          : ''
                        : item[col.key]}
                  </td>
                ))}
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