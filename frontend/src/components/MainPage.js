import React, { useState, useEffect } from 'react';

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

function MainPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    sum: '',
    currency: 'EUR',
    moment: new Date().toISOString().slice(0, 16), // Default to current date-time in local timezone
    type: 'EXPENSE', // Default to expense
    categoryId: '' // Category selection
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'moment',
    direction: 'desc'
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    endDate: new Date().toISOString().slice(0, 10)     // Today's date in YYYY-MM-DD format
  });
  const [quickFilter, setQuickFilter] = useState('today');
  const [categories, setCategories] = useState([]);

  // Load expenses when component mounts or date filter changes
  useEffect(() => {
    loadExpenses();
  }, [dateFilter]);

  // Load categories when transaction type changes
  useEffect(() => {
    loadCategories();
  }, [newExpense.type]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/type/${newExpense.type}/tree`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      // Get client timezone offset in format like "+02:00" or "-05:00"
      const timezoneOffset = new Date().getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const sign = timezoneOffset <= 0 ? '+' : '-';
      const timezone = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
      
      const url = `${API_BASE_URL}/expenses/date-range?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}&timezone=${encodeURIComponent(timezone)}`;
      const response = await fetch(url);
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
    if (!newExpense.sum || !newExpense.categoryId) {
      alert('Please fill in amount and select a category');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newExpense.description.trim(),
          sum: parseFloat(newExpense.sum),
          currency: newExpense.currency,
          moment: new Date(newExpense.moment).toISOString(),
          type: newExpense.type,
          category: { id: parseInt(newExpense.categoryId) }
        }),
      });

      if (response.ok) {
        const createdExpense = await response.json();
        // Reload expenses to get filtered data from server
        await loadExpenses();
        setNewExpense({ 
          description: '', 
          sum: '', 
          currency: 'EUR',
          moment: new Date().toISOString().slice(0, 16),
          type: 'EXPENSE',
          categoryId: ''
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
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
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
    const totals = {
      expenses: {},
      incomes: {}
    };
    
    expenses.forEach(expense => {
      const category = expense.type === 'INCOME' ? 'incomes' : 'expenses';
      
      if (!totals[category][expense.currency]) {
        totals[category][expense.currency] = 0;
      }
      totals[category][expense.currency] += expense.sum;
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

  const getSortedExpenses = () => {
    const sortedExpenses = [...expenses];
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

  const getDateRangeForQuickFilter = (filterType) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    
    switch (filterType) {
      case 'today':
        return { startDate: todayStr, endDate: todayStr };
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      
      case 'thisWeek':
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
        startOfWeek.setDate(today.getDate() - daysToMonday);
        return { 
          startDate: startOfWeek.toISOString().slice(0, 10), 
          endDate: todayStr 
        };
      
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        const daysToLastSunday = today.getDay() === 0 ? 7 : today.getDay();
        lastWeekEnd.setDate(today.getDate() - daysToLastSunday);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return { 
          startDate: lastWeekStart.toISOString().slice(0, 10), 
          endDate: lastWeekEnd.toISOString().slice(0, 10) 
        };
      
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { 
          startDate: startOfMonth.toISOString().slice(0, 10), 
          endDate: todayStr 
        };
      
      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { 
          startDate: thirtyDaysAgo.toISOString().slice(0, 10), 
          endDate: todayStr 
        };
      
      default:
        return { startDate: todayStr, endDate: todayStr };
    }
  };

  const handleQuickFilterChange = (filterType) => {
    setQuickFilter(filterType);
    const dateRange = getDateRangeForQuickFilter(filterType);
    setDateFilter(dateRange);
  };

  // Helper functions for category tree structure in dropdown
  const getRootCategories = () => {
    return categories.filter(cat => !cat.parent);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parent && cat.parent.id === parentId);
  };

  const buildCategoryTree = () => {
    const treeOptions = [];
    
    const addCategoryToTree = (category, level = 0) => {
      const indent = '  '.repeat(level); // 2 spaces per level
      const displayName = level > 0 ? `${indent}└─ ${category.name}` : category.name;
      
      treeOptions.push({
        id: category.id,
        name: category.name,
        displayName: displayName,
        level: level
      });
      
      // Add children recursively
      const children = getChildCategories(category.id);
      children.forEach(child => {
        addCategoryToTree(child, level + 1);
      });
    };
    
    // Start with root categories
    const rootCategories = getRootCategories();
    rootCategories.forEach(rootCategory => {
      addCategoryToTree(rootCategory);
    });
    
    return treeOptions;
  };

  return (
    <header className="App-header">
      <h1>Expense Management System</h1>
      
      <div className="expense-management">
        <div className="expense-form-container">
          <h2>Add New Expense</h2>
          <form onSubmit={handleExpenseSubmit} className="expense-form">
            <div className="form-row">
              <div className="type-switch-container">
                <label className="type-switch">
                  <input
                    type="checkbox"
                    checked={newExpense.type === 'INCOME'}
                    onChange={(e) => setNewExpense({...newExpense, type: e.target.checked ? 'INCOME' : 'EXPENSE'})}
                    disabled={isLoading}
                  />
                  <span className="type-slider"></span>
                  <span className="type-label">{newExpense.type === 'INCOME' ? 'Income' : 'Expense'}</span>
                </label>
              </div>

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
                value={newExpense.categoryId}
                onChange={(e) => setNewExpense({...newExpense, categoryId: e.target.value})}
                className="expense-select category-tree-select"
                disabled={isLoading}
                required
              >
                <option value="">Select Category</option>
                {buildCategoryTree().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
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
                title="Date and time"
              />
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder={newExpense.type === 'INCOME' ? 'Income description' : 'Expense description'}
                className="expense-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="add-button"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : `Add ${newExpense.type === 'INCOME' ? 'Income' : 'Expense'}`}
              </button>
            </div>
          </form>
        </div>

        <div className="expense-list">
          <h3>Recent Expenses ({getSortedExpenses().length})</h3>
          <div className="date-filter-container">
            <div className="date-filter">
              <select
                id="quickFilter"
                value={quickFilter}
                onChange={(e) => handleQuickFilterChange(e.target.value)}
                className="quick-filter-select"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="last30Days">Last 30 Days</option>
              </select>
              <label htmlFor="startDate">From:</label>
              <input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => {
                  setDateFilter({...dateFilter, startDate: e.target.value});
                  setQuickFilter('custom');
                }}
                className="date-input"
              />
              <label htmlFor="endDate">To:</label>
              <input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => {
                  setDateFilter({...dateFilter, endDate: e.target.value});
                  setQuickFilter('custom');
                }}
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
                  <th>Category</th>
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
                    <td className="expense-category">
                      {expense.category ? 
                        (expense.category.parent ? 
                          `${expense.category.parent.name} > ${expense.category.name}` : 
                          expense.category.name
                        ) : 
                        'No Category'
                      }
                    </td>
                    <td className="expense-description">{expense.description || '-'}</td>
                    <td className={`expense-amount ${expense.type === 'INCOME' ? 'income' : 'expense'}`}>
                      {expense.type === 'INCOME' ? '+' : '-'}{expense.sum.toFixed(2)}
                    </td>
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
          {(() => {
            const totals = getTotalExpenses();
            const hasExpenses = Object.keys(totals.expenses).length > 0;
            const hasIncomes = Object.keys(totals.incomes).length > 0;
            
            if (!hasExpenses && !hasIncomes) {
              return <div className="total-item">Total for Selected Period: No transactions</div>;
            }
            
            return (
              <div className="total-single-line">
                <span className="total-caption">Total for Selected Period:</span>
                {hasExpenses && (
                  <span className="total-section">
                    <span className="total-label">Expenses:</span>
                    <span className="total-amounts expense">
                      {Object.entries(totals.expenses).map(([currency, total]) => (
                        <span key={currency} className="currency-total">
                          -{currency} {total.toFixed(2)}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
                {hasIncomes && (
                  <span className="total-section">
                    <span className="total-label">Incomes:</span>
                    <span className="total-amounts income">
                      {Object.entries(totals.incomes).map(([currency, total]) => (
                        <span key={currency} className="currency-total">
                          +{currency} {total.toFixed(2)}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </header>
  );
}

export default MainPage;
