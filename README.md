# Polysense - PCOD Management and Period Tracking Application 🌸

Polysense is a comprehensive web application designed to help women track their menstrual cycles, detect PCOD (Polycystic Ovary Disease) symptoms, and get personalized diet and workout recommendations based on their health data.

## ✨ Features

### 1. User Authentication 🔐
- Secure login and registration system
- JWT authentication for protected routes
- Personalized dashboard for each user

### 2. Period Tracking 📆
- Calendar-based period tracking
- Prediction of future periods based on cycle data
- Visualization of cycle trends with interactive charts
- Detection of irregular cycles
- Statistical insights on cycle length

### 3. PCOD Information and Detection 🔍
- Educational content about PCOD and irregular periods
- Comprehensive questionnaire for PCOD risk assessment
- Machine learning-based PCOD prediction
- Detailed result analysis with probability score

### 4. Personalized Health Plans 💪
- Diet recommendations based on PCOD probability
- Customizable meal plans considering dietary preferences
- Workout plans tailored to fitness level and health conditions
- Print-friendly health plans for offline use

## 📸 Screenshots

### 1. Home Page  
![Home Page]  ![alt text](<Screenshot 2025-10-21 235259-1.png>)

---

### 2. Period Tracking Dashboard  
![Period Tracking Dashboard] ![alt text](<Screenshot 2025-10-21 235853.png>)

---

### 3. Information Section  
![Information Section] ![alt text](<Screenshot 2025-10-22 000043.png>)

---

### 4. PCOD Test  
![PCOD Test] ![alt text](<Screenshot 2025-10-22 000158.png>)

---

### 5. Results Page  
![Results Page]  ![alt text](<Screenshot 2025-09-21 194412.png>)

---

### 6. Meal Plan  
#### Example 1  ![alt text](<Screenshot 2025-10-22 000354.png>)

---

### 7. Workout Plan  
![Workout Plan]  
![alt text](<Screenshot 2025-10-22 000506.png>)


## 🏗️ Project Structure

```
client/
├── assets/               # Images and static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Footer.jsx    # Footer component
│   │   ├── MealPlanComponent.jsx # Diet plan generator
│   │   ├── Navbar.jsx    # Navigation bar
│   │   ├── PrivateRoute.jsx # Auth protection
│   │   └── WorkoutPlanComponent.jsx # Workout plan generator
│   ├── pages/            # Application pages
│   │   ├── Auth.jsx      # Login/Registration page
│   │   ├── Home.jsx      # Landing page
│   │   ├── Home2.jsx     # Dashboard page with period tracking
│   │   ├── Result.jsx    # PCOD test results page
│   │   ├── Test.jsx      # PCOD prediction test page
│   │   └── Track.jsx     # PCOD information page
│   ├── App.jsx           # Main application component with routes
│   ├── index.js          # Entry point for React app
│   └── main.jsx          # Vite entry point
├── index.html            # HTML template
└── vite.config.js        # Vite configuration
```

## 🛠️ Technology Stack

- **Frontend**: React.js with React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date operations
- **API Integration**: Axios for HTTP requests
- **AI Integration**: Google's Gemini AI API for generating meal and workout plans
- **Build Tool**: Vite for fast development experience
- **Authentication**: JWT for secure user sessions

## 🔄 Backend Integration

The application connects to a backend service running on `http://localhost:5001` with the following API endpoints:
- `/api/login` - User authentication
- `/api/register` - User registration
- `/api/period/dates` - Period tracking data
- `/predict` - PCOD prediction based on user health data

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd PCOD-Copy/client
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The application will be available at `http://localhost:5173`

### Backend Setup

Ensure the backend server is running on port 5000. The Vite configuration includes a proxy to route all `/api` requests to the backend.

## 📱 Usage

1. Start by creating an account or logging in
2. Navigate to the period tracking dashboard to log your cycle dates
3. Use the PCOD test feature to assess your risk factors
4. View your results and get personalized diet and workout recommendations
5. Access educational content about PCOD and menstrual health

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

