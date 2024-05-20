import React, { useState } from 'react';
import './App.css';

function User() {
  const [ph, setPh] = useState('');
  const [temp, setTemp] = useState('');
  const [turbidity, setTurbidity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      ph: parseFloat(ph),
      temp: parseFloat(temp),
      turbidity: parseFloat(turbidity)
    };

    try {
      const response = await fetch('http://localhost:3001/user/submitData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        console.log('Data submitted successfully');
      } else {
        console.error('Error submitting data:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  return (
    <div className="App">
      <h1>User Interface</h1>
      <form onSubmit={handleSubmit}>
        <label>
          pH:
          <input type="number" value={ph} onChange={(e) => setPh(e.target.value)} />
        </label>
        <br />
        <label>
          Temperature (°C):
          <input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} />
        </label>
        <br />
        <label>
          Turbidity (NTU):
          <input type="number" value={turbidity} onChange={(e) => setTurbidity(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit Data</button>
      </form>
    </div>
  );
}

export default User;
