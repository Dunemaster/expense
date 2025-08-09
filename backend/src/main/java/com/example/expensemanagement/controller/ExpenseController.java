package com.example.expensemanagement.controller;

import com.example.expensemanagement.dto.ErrorResponse;
import com.example.expensemanagement.entity.Expense;
import com.example.expensemanagement.service.ExpenseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {
    
    private final ExpenseService expenseService;
    
    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }
    
    /**
     * Create a new expense
     */
    @PostMapping
    public ResponseEntity<?> createExpense(@Valid @RequestBody Expense expense, HttpServletRequest request) {
        try {
            Expense savedExpense = expenseService.saveExpense(expense);
            System.out.println("Created new expense: " + savedExpense);
            return new ResponseEntity<>(savedExpense, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error creating expense: " + e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value(), request.getRequestURI());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating expense: " + e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getRequestURI());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all expenses
     */
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        try {
            List<Expense> expenses = expenseService.findAllExpenses();
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving expenses: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get expense by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        try {
            Optional<Expense> expense = expenseService.findById(id);
            return expense.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                         .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            System.err.println("Error retrieving expense with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get expenses by currency
     */
    @GetMapping("/currency/{currency}")
    public ResponseEntity<List<Expense>> getExpensesByCurrency(@PathVariable String currency) {
        try {
            List<Expense> expenses = expenseService.findByCurrency(currency);
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving expenses by currency " + currency + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Search expenses by description
     */
    @GetMapping("/search")
    public ResponseEntity<List<Expense>> searchExpensesByDescription(@RequestParam String description) {
        try {
            List<Expense> expenses = expenseService.findByDescriptionContaining(description);
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching expenses by description '" + description + "': " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get expenses by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "UTC") String timezone) {
        try {
            // Convert date strings (YYYY-MM-DD) to Instant range using client timezone
            // Parse the timezone offset (e.g., "+02:00", "-05:00")
            String startDateTime = startDate + "T00:00:00.000" + (timezone.equals("UTC") ? "Z" : timezone);
            String endDateTime = endDate + "T23:59:59.999" + (timezone.equals("UTC") ? "Z" : timezone);
            
            Instant start = Instant.parse(startDateTime);
            Instant end = Instant.parse(endDateTime);
            List<Expense> expenses = expenseService.findByDateRange(start, end);
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving expenses by date range: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Update an existing expense
     */
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        try {
            Expense updatedExpense = expenseService.updateExpense(id, expense);
            System.out.println("Updated expense: " + updatedExpense);
            return new ResponseEntity<>(updatedExpense, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error updating expense with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error updating expense: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Delete an expense
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            System.out.println("Deleted expense with id: " + id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            System.err.println("Error deleting expense with id " + id + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting expense: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

}
