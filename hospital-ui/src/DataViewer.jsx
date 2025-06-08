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
        if (!response.ok) throw new Error(`Gagal mengambil data (status: ${response.status})`);
        const result = await response.json();
        if (result.status === 'success') setData(result.data);
        else if (Array.isArray(result)) setData(result);
        else if (result.status === 'error') throw new Error(result.message);
        else setData([]);
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

  return (
    <div className="data-viewer">
      <h2>{config.title}</h2>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              {config.columns.map((col) => <th key={col.key}>{col.header}</th>)}
              <th>Aksi</th>
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
                          minimumFractionDigits: 0
                        }).format(item[col.key])
                      : item[col.key]}
                  </td>
                ))}
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
