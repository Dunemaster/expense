import React, { useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(result);
        setName('');
      } else {
        setMessage('Error: Failed to submit name');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Expense Management System</h1>
        <div className="name-form-container">
          <h2>Welcome! Please enter your name:</h2>
          <form onSubmit={handleSubmit} className="name-form">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Name'}
            </button>
          </form>
          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
