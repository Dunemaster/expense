package com.example.expensemanagement.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class NameController {

    @PostMapping("/name")
    public String submitName(@RequestBody NameRequest nameRequest) {
        String name = nameRequest.getName();
        System.out.println("Received name from user: " + name);
        return "Hello, " + name + "! Your name has been processed successfully.";
    }

    public static class NameRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
