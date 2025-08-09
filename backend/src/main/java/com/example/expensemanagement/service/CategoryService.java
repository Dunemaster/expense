package com.example.expensemanagement.service;

import com.example.expensemanagement.entity.Category;
import com.example.expensemanagement.entity.TransactionType;
import com.example.expensemanagement.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    /**
     * Save a new category
     */
    public Category saveCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        if (category.getType() == null) {
            throw new IllegalArgumentException("Category type cannot be null");
        }
        return categoryRepository.save(category);
    }
    
    /**
     * Find all categories
     */
    public List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }
    
    /**
     * Find category by ID
     */
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }
    
    /**
     * Find categories by transaction type
     */
    public List<Category> findByType(TransactionType type) {
        return categoryRepository.findByType(type);
    }
    
    /**
     * Find root categories by transaction type
     */
    public List<Category> findRootCategoriesByType(TransactionType type) {
        return categoryRepository.findByTypeAndParentIsNull(type);
    }
    
    /**
     * Find child categories of a parent
     */
    public List<Category> findChildCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }
    
    /**
     * Get hierarchical structure of categories for a specific type
     */
    public List<Category> findByTypeOrderByHierarchy(TransactionType type) {
        return categoryRepository.findByTypeOrderByHierarchy(type);
    }
    
    /**
     * Update an existing category
     */
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (categoryDetails.getName() != null && !categoryDetails.getName().trim().isEmpty()) {
            category.setName(categoryDetails.getName().trim());
        }
        if (categoryDetails.getType() != null) {
            category.setType(categoryDetails.getType());
        }
        if (categoryDetails.getParent() != null) {
            category.setParent(categoryDetails.getParent());
        }
        
        return categoryRepository.save(category);
    }
    
    /**
     * Delete a category
     */
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
    
    /**
     * Search categories by name and type
     */
    public List<Category> searchCategories(String name, TransactionType type) {
        return categoryRepository.findByNameContainingIgnoreCaseAndType(name, type);
    }
    
    /**
     * Count categories
     */
    public long countCategories() {
        return categoryRepository.count();
    }
}
