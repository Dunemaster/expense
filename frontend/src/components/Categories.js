import React, { useState, useEffect } from 'react';
import './Categories.css';

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('EXPENSE');
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'EXPENSE',
    parent: null
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load categories when component mounts or type changes
  useEffect(() => {
    loadCategories();
    // Update newCategory type when selectedType changes
    setNewCategory(prev => ({
      ...prev,
      type: selectedType
    }));
  }, [selectedType]);

  const loadCategories = async () => {
    try {
      // Try hierarchy endpoint first
      let response = await fetch(`${API_BASE_URL}/categories/type/${selectedType}/hierarchy`);
      
      if (!response.ok) {
        // If hierarchy endpoint fails, try the simpler type endpoint
        console.warn('Hierarchy endpoint failed, trying type endpoint');
        response = await fetch(`${API_BASE_URL}/categories/type/${selectedType}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        setMessage(''); // Clear any previous error messages
      } else {
        console.error('Failed to load categories:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage(`Error loading categories: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setMessage(`Error loading categories: ${error.message}`);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setIsLoading(true);
    try {
      const categoryData = {
        name: newCategory.name.trim(),
        type: newCategory.type,
        parent: newCategory.parent ? { id: newCategory.parent } : null
      };

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await loadCategories();
        setNewCategory({ name: '', type: selectedType, parent: null });
        setMessage('Category created successfully!');
      } else {
        const errorData = await response.text();
        setMessage(`Error: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name.trim(),
          type: editingCategory.type,
          parent: editingCategory.parent
        }),
      });

      if (response.ok) {
        await loadCategories();
        setEditingCategory(null);
        setMessage('Category updated successfully!');
      } else {
        setMessage('Error: Failed to update category');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCategories();
        setMessage('Category deleted successfully!');
      } else {
        setMessage('Error: Failed to delete category');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Could not connect to server');
    }
  };

  const startEditing = (category) => {
    setEditingCategory({ ...category });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const getRootCategories = () => {
    return categories.filter(cat => !cat.parent);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parent && cat.parent.id === parentId);
  };

  const renderCategoryTree = (category, level = 0) => {
    const children = getChildCategories(category.id);
    const indentStyle = { marginLeft: `${level * 20}px` };
    
    return (
      <div key={category.id} className="tree-node">
        <div className="category-item" style={indentStyle}>
          {editingCategory && editingCategory.id === category.id ? (
            <form onSubmit={handleUpdateCategory} className="edit-form">
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                className="edit-input"
              />
              <div className="edit-actions">
                <button type="submit" className="save-button">Save</button>
                <button type="button" onClick={cancelEditing} className="cancel-button">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="category-display">
              <span className="category-name">
                {level > 0 && <span className="tree-connector">└─ </span>}
                {category.name}
              </span>
              <div className="category-actions">
                <button 
                  onClick={() => startEditing(category)}
                  className="edit-button"
                  title="Edit category"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="delete-button"
                  title="Delete category"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
        {children.length > 0 && (
          <div className="tree-children">
            {children.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Manage Categories</h1>
        <div className="type-selector">
          <button 
            className={selectedType === 'EXPENSE' ? 'active' : ''}
            onClick={() => setSelectedType('EXPENSE')}
          >
            Expense Categories
          </button>
          <button 
            className={selectedType === 'INCOME' ? 'active' : ''}
            onClick={() => setSelectedType('INCOME')}
          >
            Income Categories
          </button>
        </div>
      </div>

      <div className="categories-content">
        <div className="category-form-section">
          <h2>Add New Category</h2>
          <form onSubmit={handleCreateCategory} className="category-form">
            <div className="form-group">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Category name"
                className="category-input"
                disabled={isLoading}
              />
              <select
                value={newCategory.parent || ''}
                onChange={(e) => setNewCategory({...newCategory, parent: e.target.value || null})}
                className="category-select"
                disabled={isLoading}
              >
                <option value="">Root Category</option>
                {getRootCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button 
                type="submit" 
                className="add-category-button"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>

        <div className="categories-list-section">
          <h2>{selectedType === 'EXPENSE' ? 'Expense' : 'Income'} Categories ({categories.length})</h2>
          {categories.length === 0 ? (
            <p className="no-categories">No categories found. Create your first category above.</p>
          ) : (
            <div className="categories-tree">
              {getRootCategories().map(category => renderCategoryTree(category))}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </div>
  );
}

export default Categories;
