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
![Home Page]
<img width="1919" height="1019" alt="Screenshot 2025-10-21 235259" src="https://github.com/user-attachments/assets/7e74754f-583b-46b4-ad6b-a95e7b8be2e5" />

---

### 2. Period Tracking Dashboard  
<img width="1911" height="1016" alt="Screenshot 2025-10-21 235853" src="https://github.com/user-attachments/assets/598f47ac-c8f9-4c50-ad35-ee7fd2957f47" />


---

### 3. Information Section  
<img width="1918" height="1016" alt="Screenshot 2025-10-22 000043" src="https://github.com/user-attachments/assets/215613ef-c04a-4cf9-bd04-a23a0f35788e" />


---

### 4. PCOD Test  
<img width="1916" height="1018" alt="Screenshot 2025-10-22 000158" src="https://github.com/user-attachments/assets/37173120-a393-441e-ba84-fb1efccbe502" />


---

### 5. Results Page  
<img width="1193" height="569" alt="Screenshot 2025-09-21 194412" src="https://github.com/user-attachments/assets/17a9cbbe-62e7-44b1-a71a-b918ea1bc5cd" />


---

### 6. Meal Plan
<img width="1919" height="1022" alt="Screenshot 2025-10-22 000354" src="https://github.com/user-attachments/assets/ee7bfc31-ec5b-4338-ba2f-7d74db9203f4" />


---

### 7. Workout Plan  
<img width="1919" height="1022" alt="Screenshot 2025-10-22 000506" src="https://github.com/user-attachments/assets/563fc358-41d0-4c15-b902-56c0bc9bc4b0" />



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

