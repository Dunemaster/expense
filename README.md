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

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Enter your name in the input field
3. Click "Submit Name"
4. The name will be sent to the backend server
5. Check the backend console to see the logged message
6. A success message will be displayed on the frontend

## API Endpoints

- `POST /api/name` - Accepts a JSON payload with a name field and returns a greeting message

## Technologies Used

- **Backend**: Spring Boot 3.2.0, Java 17, Maven
- **Frontend**: React 18, JavaScript, CSS
- **Communication**: REST API with JSON


## Next steps

 - reformat main page - show only todays expenses, add date range filter
 - add ability to select expense, edit it, save and delete
 - add storage place
 -- backend
 - show current balance
 -- calculate on backend
 -- show on frontend

 - decide how to deploy into cloud (function? which database to use?)