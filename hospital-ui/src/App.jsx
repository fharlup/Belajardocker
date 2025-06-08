import React from 'react';
import HospitalDashboard from './HospitalDashboard';
import './App.css'; // Impor CSS untuk styling

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistem Informasi Rumah Sakit</h1>
      </header>
      <main>
        <HospitalDashboard />
      </main>
    </div>
  );
}

export default App;