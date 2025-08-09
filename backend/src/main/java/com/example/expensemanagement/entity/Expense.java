package com.example.expensemanagement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "expenses")
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false, precision = 19, scale = 2)
    @Positive(message = "Sum must positive")
    private BigDecimal sum;
    
    @Column(nullable = false)
    private String currency;
    
    @Column(nullable = false)
    private Instant moment;
    
    // Default constructor
    public Expense() {
    }
    

    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getSum() {
        return sum;
    }
    
    public void setSum(BigDecimal sum) {
        if (sum.compareTo(BigDecimal.ZERO) <= 0 ) {
           throw new IllegalArgumentException("Sum should be positive.");
        }
        this.sum = sum;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public Instant getMoment() {
        return moment;
    }
    
    public void setMoment(Instant moment) {
        this.moment = moment;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Expense expense = (Expense) o;
        return Objects.equals(id, expense.id) &&
               Objects.equals(description, expense.description) &&
               Objects.equals(sum, expense.sum) &&
               Objects.equals(currency, expense.currency) &&
               Objects.equals(moment, expense.moment);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, description, sum, currency, moment);
    }
    
    @Override
    public String toString() {
        return "Expense{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", sum=" + sum +
                ", currency='" + currency + '\'' +
                ", moment=" + moment +
                '}';
    }
}
