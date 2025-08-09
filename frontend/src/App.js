import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    sum: '',
    currency: 'EUR'
  });

  // Load expenses when component mounts
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!newExpense.description.trim() || !newExpense.sum) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newExpense.description.trim(),
          sum: parseFloat(newExpense.sum),
          currency: newExpense.currency
        }),
      });

      if (response.ok) {
        const createdExpense = await response.json();
        setExpenses([createdExpense, ...expenses]);
        setNewExpense({ description: '', sum: '', currency: 'EUR' });
        setMessage('Expense added successfully!');
      } else {
        // Try to extract error message from server response
        try {
          const errorData = await response.text();
          // Check if it's a JSON error response
          try {
            const errorJson = JSON.parse(errorData);
            setMessage(`Error: ${errorJson.message || errorJson.error || 'Failed to add expense'}`);
          } catch {
            // If not JSON, try to extract meaningful error from various formats
            let errorMessage = 'Failed to add expense';
            
            // Try to extract content after common error prefixes
            const errorPatterns = [
              /JSON parse error:\s*(.+?)[\.\]]/i,
              /error:\s*(.+?)[\.\]]/i,
              /exception:\s*(.+?)[\.\]]/i,
              /message:\s*(.+?)[\.\]]/i
            ];
            
            for (const pattern of errorPatterns) {
              const match = errorData.match(pattern);
              if (match && match[1] && match[1].trim()) {
                errorMessage = match[1].trim();
                break;
              }
            }
            
            // If no pattern matched, use the raw error data if it's reasonably short
            if (errorMessage === 'Failed to add expense' && errorData && errorData.length < 200) {
              errorMessage = errorData.trim();
            }
            
            setMessage(`Error: ${errorMessage}`);
          }
        } catch {
          setMessage('Error: Failed to add expense');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
        setMessage('Expense deleted successfully!');
      } else {
        setMessage('Error: Failed to delete expense');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalExpenses = () => {
    const totals = {};
    expenses.forEach(expense => {
      if (!totals[expense.currency]) {
        totals[expense.currency] = 0;
      }
      totals[expense.currency] += expense.sum;
    });
    return totals;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Expense Management System</h1>
        
          <div className="expense-management">
            <div className="expense-form-container">
              <h2>Add New Expense</h2>
              <form onSubmit={handleExpenseSubmit} className="expense-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Expense description"
                    className="expense-input"
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.sum}
                    onChange={(e) => setNewExpense({...newExpense, sum: e.target.value})}
                    placeholder="Amount"
                    className="expense-input"
                    disabled={isLoading}
                  />
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
                    className="expense-select"
                    disabled={isLoading}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                  <button 
                    type="submit" 
                    className="add-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>

            <div className="expense-summary">
              <h3>Total Expenses</h3>
              {Object.entries(getTotalExpenses()).map(([currency, total]) => (
                <div key={currency} className="total-item">
                  {currency}: {total.toFixed(2)}
                </div>
              ))}
            </div>

            <div className="expense-list">
              <h3>Recent Expenses ({expenses.length})</h3>
              {expenses.length === 0 ? (
                <p className="no-expenses">No expenses recorded yet.</p>
              ) : (
                <div className="expenses-grid">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-header">
                        <h4>{expense.description}</h4>
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="delete-button"
                          title="Delete expense"
                        >
                          ×
                        </button>
                      </div>
                      <div className="expense-details">
                        <span className="expense-amount">
                          {expense.currency} {expense.sum.toFixed(2)}
                        </span>
                        <span className="expense-date">
                          {formatDate(expense.moment)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
