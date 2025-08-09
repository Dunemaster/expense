package com.example.expensemanagement.repository;

import com.example.expensemanagement.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    // Find expenses by currency
    List<Expense> findByCurrency(String currency);
    
    // Find expenses between two dates
    List<Expense> findByMomentBetween(Instant startDate, Instant endDate);
    
    // Find expenses by description containing text (case insensitive)
    List<Expense> findByDescriptionContainingIgnoreCase(String description);
    
    // Custom query to find expenses ordered by moment descending
    @Query("SELECT e FROM Expense e ORDER BY e.moment DESC")
    List<Expense> findAllOrderByMomentDesc();
    
    // Find expenses by currency and date range
    @Query("SELECT e FROM Expense e WHERE e.currency = :currency AND e.moment BETWEEN :startDate AND :endDate ORDER BY e.moment DESC")
    List<Expense> findByCurrencyAndMomentBetween(@Param("currency") String currency, 
                                                @Param("startDate") Instant startDate, 
                                                @Param("endDate") Instant endDate);
}
