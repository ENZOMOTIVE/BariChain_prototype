import React, { useState } from 'react';
import './App.css';

function Admin() {
  const [phCriteria, setPhCriteria] = useState('');
  const [tempCriteria, setTempCriteria] = useState('');
  const [turbidityCriteria, setTurbidityCriteria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const criteriaData = {
      ph: parseFloat(phCriteria),
      temp: parseFloat(tempCriteria),
      turbidity: parseFloat(turbidityCriteria)
    };

    try {
      const response = await fetch('http://localhost:3001/admin/setCriteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(criteriaData)
      });

      if (response.ok) {
        console.log('Criteria set successfully');
      } else {
        console.error('Error setting criteria:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  return (
    <div className="App">
      <h1>Admin Interface</h1>
      <form onSubmit={handleSubmit}>
        <label>
          pH Criteria:
          <input type="number" value={phCriteria} onChange={(e) => setPhCriteria(e.target.value)} />
        </label>
        <br />
        <label>
          Temperature Criteria (°C):
          <input type="number" value={tempCriteria} onChange={(e) => setTempCriteria(e.target.value)} />
        </label>
        <br />
        <label>
          Turbidity Criteria (NTU):
          <input type="number" value={turbidityCriteria} onChange={(e) => setTurbidityCriteria(e.target.value)} />
        </label>
        <br />
        <button type="submit">Set Criteria</button>
      </form>
    </div>
  );
}

export default Admin;
