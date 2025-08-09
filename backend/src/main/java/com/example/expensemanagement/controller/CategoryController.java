package com.example.expensemanagement.controller;

import com.example.expensemanagement.dto.ErrorResponse;
import com.example.expensemanagement.entity.Category;
import com.example.expensemanagement.entity.TransactionType;
import com.example.expensemanagement.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    
    /**
     * Create a new category
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category, HttpServletRequest request) {
        try {
            Category savedCategory = categoryService.saveCategory(category);
            System.out.println("Created new category: " + savedCategory);
            return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error creating category: " + e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value(), request.getRequestURI());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating category: " + e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getRequestURI());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all categories
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryService.findAllCategories();
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving categories: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        try {
            Optional<Category> category = categoryService.findById(id);
            return category.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                         .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            System.err.println("Error retrieving category with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get categories by transaction type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable String type) {
        try {
            TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.findByType(transactionType);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid transaction type: " + type);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error retrieving categories by type " + type + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get root categories by transaction type
     */
    @GetMapping("/type/{type}/roots")
    public ResponseEntity<List<Category>> getRootCategoriesByType(@PathVariable String type) {
        try {
            TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.findRootCategoriesByType(transactionType);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid transaction type: " + type);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error retrieving root categories by type " + type + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get hierarchical categories by transaction type
     */
    @GetMapping("/type/{type}/hierarchy")
    public ResponseEntity<List<Category>> getHierarchicalCategoriesByType(@PathVariable String type) {
        try {
            TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.findByTypeOrderByHierarchy(transactionType);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid transaction type: " + type);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error retrieving hierarchical categories by type " + type + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get child categories of a parent
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<Category>> getChildCategories(@PathVariable Long parentId) {
        try {
            List<Category> categories = categoryService.findChildCategories(parentId);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving child categories for parent " + parentId + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Search categories by name and type
     */
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(
            @RequestParam String name, 
            @RequestParam String type) {
        try {
            TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.searchCategories(name, transactionType);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid transaction type: " + type);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error searching categories: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update an existing category
     */
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, category);
            System.out.println("Updated category: " + updatedCategory);
            return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error updating category with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error updating category: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Delete a category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            System.out.println("Deleted category with id: " + id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            System.err.println("Error deleting category with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting category: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get category count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getCategoryCount() {
        try {
            long count = categoryService.countCategories();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error counting categories: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
