# BudgetBook

## Overview
BudgetBook is a full-stack web application designed to simplify personal and collaborative financial management. The application enables users to track expenses, manage budgets, gain AI-driven financial insights, and generate detailed reports. Built using modern web technologies, BudgetBook provides a responsive and user-friendly experience for effective financial planning.

## Features
- **Expense Tracking**: Record and manage daily expenses with detailed categorization.
- **Budget Management**: Set and monitor budgets to ensure financial discipline.
- **AI-Driven Insights**: Integrated Google Gemini API to provide actionable financial tips based on spending patterns.
- **Interactive Data Visualization**: Real-time charts and graphs using Chart.js for spending analysis.
- **Automated PDF Reports**: Generate detailed financial reports in PDF format using jsPDF.
- **Group Expense Splitting**: Simplify group expense management with contributor tracking and automated splits.
- **Secure Authentication**: Implemented user login and session management using JWT and bcrypt.
- **Cloud Storage**: MongoDB Atlas for scalable and secure data storage.

## Tech Stack
### Frontend
- **Framework**: React.js
- **Charting**: Chart.js, React-Chartjs-2
- **Styling**: CSS, Bootstrap

### Backend
- **Framework**: Node.js, Express.js
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **APIs**: RESTful APIs, Google Gemini API Integration

### Database
- **Primary Database**: MongoDB Atlas
- **Session Storage**: MongoStore

### Deployment
- **Platform**: Render (Frontend + Backend)

## Installation
### Prerequisites
- Node.js (v16 or above)
- npm (Node Package Manager)
- MongoDB Atlas account

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/budgetbook.git
   cd budgetbook
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```env
     MONGODB_URI=<Your MongoDB Atlas URI>
     SESSION_SECRET=<Your Session Secret>
     GOOGLE_API_KEY=<Your Google Gemini API Key>
     PORT=5000
     ```

4. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

5. Start the application:
   ```bash
   npm run start
   ```

6. Access the application at `http://localhost:5000`.

## API Endpoints
### Authentication
- `POST /register`: Register a new user.
- `POST /login`: User login.
- `POST /logout`: User logout.

### Budget Management
- `POST /fetchBudgets`: Retrieve user budgets.

### Group Expense Management
- `POST /api/groups`: Manage group expenses.

### Insights
- `POST /api/insights`: Fetch AI-driven financial insights.

### Reporting
- `POST /save-image`: Save chart images for reports.

## Future Enhancements
- Add support for multi-currency transactions.
- Implement notifications for budget limits.
- Integrate more advanced AI APIs for predictive financial analysis.

## Contact
For any queries or contributions, feel free to reach out:
- **Email**: mayank2002singh@gmail.com
