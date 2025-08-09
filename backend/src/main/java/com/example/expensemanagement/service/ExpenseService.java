package com.example.expensemanagement.service;

import com.example.expensemanagement.entity.Expense;
import com.example.expensemanagement.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Validated
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    /**
     * Save a new expense
     */
    public Expense saveExpense(Expense expense) {
        if (expense.getMoment() == null) {
            expense.setMoment(Instant.now());
        }
        return expenseRepository.save(expense);
    }

    /**
     * Find expense by ID
     */
    @Transactional(readOnly = true)
    public Optional<Expense> findById(Long id) {
        return expenseRepository.findById(id);
    }

    /**
     * Get all expenses
     */
    @Transactional(readOnly = true)
    public List<Expense> findAllExpenses() {
        return expenseRepository.findAllOrderByMomentDesc();
    }

    /**
     * Find expenses by currency
     */
    @Transactional(readOnly = true)
    public List<Expense> findByCurrency(String currency) {
        return expenseRepository.findByCurrency(currency);
    }

    /**
     * Find expenses between two dates
     */
    @Transactional(readOnly = true)
    public List<Expense> findByDateRange(Instant startDate, Instant endDate) {
        return expenseRepository.findByMomentBetween(startDate, endDate);
    }

    /**
     * Find expenses by description containing text
     */
    @Transactional(readOnly = true)
    public List<Expense> findByDescriptionContaining(String description) {
        return expenseRepository.findByDescriptionContainingIgnoreCase(description);
    }

    /**
     * Find expenses by currency and date range
     */
    @Transactional(readOnly = true)
    public List<Expense> findByCurrencyAndDateRange(String currency, Instant startDate, Instant endDate) {
        return expenseRepository.findByCurrencyAndMomentBetween(currency, startDate, endDate);
    }

    /**
     * Update an existing expense
     */
    public Expense updateExpense(Long id, Expense updatedExpense) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expense.setDescription(updatedExpense.getDescription());
                    expense.setSum(updatedExpense.getSum());
                    expense.setCurrency(updatedExpense.getCurrency());
                    expense.setMoment(updatedExpense.getMoment());
                    return expenseRepository.save(expense);
                })
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    /**
     * Delete an expense by ID
     */
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    /**
     * Check if expense exists
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return expenseRepository.existsById(id);
    }

    /**
     * Count total expenses
     */
    @Transactional(readOnly = true)
    public long countExpenses() {
        return expenseRepository.count();
    }
}
