package com.example.expensemanagement.repository;

import com.example.expensemanagement.entity.Category;
import com.example.expensemanagement.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find all categories by transaction type
     */
    List<Category> findByType(TransactionType type);
    
    /**
     * Find all root categories (categories without parent) by transaction type
     */
    List<Category> findByTypeAndParentIsNull(TransactionType type);
    
    /**
     * Find all child categories of a parent category
     */
    List<Category> findByParentId(Long parentId);
    
    /**
     * Find categories by name and type
     */
    List<Category> findByNameContainingIgnoreCaseAndType(String name, TransactionType type);
    
    /**
     * Get hierarchical structure of categories for a specific type
     */
    @Query("SELECT c FROM Category c WHERE c.type = :type ORDER BY c.parent.id ASC NULLS FIRST, c.name ASC")
    List<Category> findByTypeOrderByHierarchy(@Param("type") TransactionType type);
}
