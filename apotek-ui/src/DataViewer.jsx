import React, { useState, useEffect } from 'react';

function DataViewer({ config, apiBaseUrl, onError }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      onError(''); // Reset error setiap kali fetch baru

      const fullUrl = `${apiBaseUrl}${config.endpoint}`;

      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Gagal mengambil data dari jaringan (status: ${response.status})`);
        
        const result = await response.json();
        
        if (result.status === 'success') {
          setData(result.data);
        } else if (Array.isArray(result)) {
          setData(result);
        } else if (result.status === 'error'){
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
  }, [config, apiBaseUrl, onError]);

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
              {config.columns.map((col) => <th key={col.key}>{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                {config.columns.map((col) => (
                  <td key={col.key}>
                    {col.key === 'price' ? new Intl.NumberFormat('id-ID').format(item[col.key]) : item[col.key]}
                  </td>
                ))}
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