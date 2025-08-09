import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    sum: '',
    currency: 'EUR',
    moment: new Date().toISOString().slice(0, 16) // Default to current date-time in local timezone
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'moment',
    direction: 'desc'
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    endDate: new Date().toISOString().slice(0, 10)     // Today's date in YYYY-MM-DD format
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
          currency: newExpense.currency,
          moment: new Date(newExpense.moment).toISOString()
        }),
      });

      if (response.ok) {
        const createdExpense = await response.json();
        setExpenses([createdExpense, ...expenses]);
        setNewExpense({ 
          description: '', 
          sum: '', 
          currency: 'EUR',
          moment: new Date().toISOString().slice(0, 16)
        });
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
    const filteredExpenses = getFilteredExpenses();
    filteredExpenses.forEach(expense => {
      if (!totals[expense.currency]) {
        totals[expense.currency] = 0;
      }
      totals[expense.currency] += expense.sum;
    });
    return totals;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.moment).toISOString().slice(0, 10);
      return expenseDate >= dateFilter.startDate && expenseDate <= dateFilter.endDate;
    });
  };

  const getSortedExpenses = () => {
    const filteredExpenses = getFilteredExpenses();
    const sortedExpenses = [...filteredExpenses];
    if (sortConfig.key) {
      sortedExpenses.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (sortConfig.key === 'moment') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === 'sum') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedExpenses;
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
                  <input
                    type="datetime-local"
                    value={newExpense.moment}
                    onChange={(e) => setNewExpense({...newExpense, moment: e.target.value})}
                    className="expense-input"
                    disabled={isLoading}
                    title="Expense date and time"
                  />
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

            <div className="expense-list">
              <h3>Recent Expenses ({getSortedExpenses().length} of {expenses.length})</h3>
              <div className="date-filter-container">
                <div className="date-filter">
                  <label htmlFor="startDate">From:</label>
                  <input
                    id="startDate"
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                    className="date-input"
                  />
                  <label htmlFor="endDate">To:</label>
                  <input
                    id="endDate"
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                    className="date-input"
                  />
                </div>
              </div>
              {expenses.length === 0 ? (
                <p className="no-expenses">No expenses recorded yet.</p>
              ) : (
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th 
                        onClick={() => handleSort('description')}
                        className="sortable-header"
                        title="Click to sort by description"
                      >
                        Description {getSortIcon('description')}
                      </th>
                      <th 
                        onClick={() => handleSort('sum')}
                        className="sortable-header"
                        title="Click to sort by amount"
                      >
                        Amount {getSortIcon('sum')}
                      </th>
                      <th 
                        onClick={() => handleSort('currency')}
                        className="sortable-header"
                        title="Click to sort by currency"
                      >
                        Currency {getSortIcon('currency')}
                      </th>
                      <th 
                        onClick={() => handleSort('moment')}
                        className="sortable-header"
                        title="Click to sort by date"
                      >
                        Date {getSortIcon('moment')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedExpenses().map((expense) => (
                      <tr key={expense.id}>
                        <td className="expense-description">{expense.description}</td>
                        <td className="expense-amount">{expense.sum.toFixed(2)}</td>
                        <td className="expense-currency">{expense.currency}</td>
                        <td className="expense-date">{formatDate(expense.moment)}</td>
                        <td className="expense-actions">
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="delete-button"
                            title="Delete expense"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="expense-summary">
              <h3>Total for Selected Period</h3>
              {Object.entries(getTotalExpenses()).length === 0 ? (
                <div className="total-item">No expenses in selected period</div>
              ) : (
                Object.entries(getTotalExpenses()).map(([currency, total]) => (
                  <div key={currency} className="total-item">
                    {currency}: {total.toFixed(2)}
                  </div>
                ))
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
