import React, { useState, useEffect } from 'react';

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}

function DataViewer({ config, apiBaseUrl, onError, onUpdate, onDelete, refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      onError(''); // Reset error setiap fetch baru

      const fullUrl = `${apiBaseUrl}${config.endpoint}`;

      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Gagal mengambil data dari jaringan (status: ${response.status})`);

        const result = await response.json();

        if (result.status === 'success') {
          setData(result.data);
        } else if (Array.isArray(result)) {
          // Jika respons langsung berupa array data tanpa status 'success'
          setData(result);
        } else if (result.status === 'error') {
          throw new Error(result.message || 'Terjadi kesalahan pada server backend.');
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
  }, [config, apiBaseUrl, onError, refreshTrigger]);

  if (loading) {
    return <p>Loading {config.title}...</p>;
  }

  return (
    <div>
      <h2>{config.title}</h2>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              {config.columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
              {(onUpdate || onDelete) && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                {config.columns.map((col) => {
                  let cellContent = null;

                  if (col.render) {
                    cellContent = col.render(item);
                  } else if (col.key === 'price') {
                    cellContent = new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(item[col.key]);
                  } else if (col.key.toLowerCase().includes('date')) {
                    // Format tanggal secara umum untuk kolom yang mengandung kata 'date'
                    cellContent = formatDate(item[col.key]);
                  } else {
                    cellContent = item[col.key];
                  }

                  return <td key={col.key}>{cellContent}</td>;
                })}
                {(onUpdate || onDelete) && (
                  <td>
                    {onUpdate && (
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#4caf50',
                          fontSize: '18px',
                          marginRight: '8px',
                        }}
                        onClick={() => onUpdate(item)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#f44336',
                          fontSize: '18px',
                        }}
                        onClick={() => onDelete(item)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    )}
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
