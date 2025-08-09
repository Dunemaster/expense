# Expense Management System

A Spring Boot web application with React frontend that allows users to enter their name, which is then sent to the server and processed via a POST method.

## Project Structure

```
spring-react-app/
├── backend/                 # Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/example/expensemanagement/
│   │       │       ├── ExpenseManagementApplication.java
│   │       │       └── controller/
│   │       │           └── NameController.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
├── frontend/                # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## Features

- **Landing Page**: Clean, modern interface for user interaction
- **Name Input**: Form where users can enter their name
- **POST Request**: Name is sent to Spring Boot backend via POST method
- **Server Processing**: Backend processes the name and logs it to console
- **Response Display**: Success message is displayed to the user

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Node.js 14 or higher
- npm or yarn

## Running the Application

### Backend (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`




## Next steps

 - add ability to select expense, edit it and save
 - add income
 - add expense categories tree
 - add storage place
 -- backend
 - show current balance
   -- calculate on backend
   -- show on frontend

 - configure persistent storage (postgres)
 - add normal logging (instead of println)

 - data export
 - data import
 - data import from drebedengi

START USING LOCALLY

 -- authentication
 -- decide how to deploy into cloud (function? which database to use?)
 
START USING IN THE CLOUD

check logging in the cloud
monitoring (just to test) requests number
reports: by category in a period
   for selected categories
mobile app?
