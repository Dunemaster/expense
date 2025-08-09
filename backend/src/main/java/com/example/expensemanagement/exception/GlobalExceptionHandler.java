package com.example.expensemanagement.exception;

import com.example.expensemanagement.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        String message = "Validation failed";
        
        // Extract the first validation error message
        if (ex.getBindingResult().hasFieldErrors()) {
            message = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        }
        
        ErrorResponse errorResponse = new ErrorResponse(message, HttpStatus.BAD_REQUEST.value(), request.getRequestURI());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        String message = "Validation failed";
        
        // Extract the first constraint violation message
        if (!ex.getConstraintViolations().isEmpty()) {
            message = ex.getConstraintViolations().iterator().next().getMessage();
        }
        
        ErrorResponse errorResponse = new ErrorResponse(message, HttpStatus.BAD_REQUEST.value(), request.getRequestURI());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        String message = ex.getMessage() != null ? ex.getMessage() : "Invalid argument";
        ErrorResponse errorResponse = new ErrorResponse(message, HttpStatus.BAD_REQUEST.value(), request.getRequestURI());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getRequestURI());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
