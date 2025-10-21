import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/BGimage.png"; // Replace with your actual file path

function Auth() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // Success or Error
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/login" : "/api/register";
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(endpoint, form);
      setMessage(response.data.message || (isLogin ? "Login successful" : "Registration successful"));
      setMessageType("success"); // Green message for success

      if (response.data.token) {
        localStorage.setItem("username", form.username);
        localStorage.setItem("token", response.data.token); // Store the JWT token

        // Delay navigation for user to see loading state
        setTimeout(() => {
          setIsLoading(false);
          navigate("/home2");
        }, 2000);
      } else {
        setIsLoading(false);
        
        // If we're registering and no token was returned, switch to login
        if (!isLogin) {
          setMessage("Registration successful! Please log in.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred. Please try again.");
      setMessageType("error"); // Red message for error
      setIsLoading(false); // Stop loading
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Attempting login with:', { email: form.username, password: form.password });
    
    try {
      // Try the direct login endpoint first to verify basic connectivity
      const res = await axios.post('/api/login/direct', {});
      
      console.log('Direct login response:', res.data);
      
      // Store the token and username in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      
      // Show success message
      setMessage("Login successful!");
      setMessageType("success");
      
      // Redirect to Home2 page after successful login
      setTimeout(() => {
        navigate('/home2');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error status:', error.response?.status);
      console.error('Login error details:', error.response?.data);
      
      // Show the specific error message from the server if available
      const errorMessage = error.response?.data?.msg || 'Login failed. Please try again.';
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${bgImage})`,
        backgroundSize: "85%",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Auth Form */}
      <div className="w-full max-w-lg p-10 bg-white bg-opacity-90 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? "Welcome Back!" : "Create an Account"}
        </h1>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-[#7d3c98] bg-gray-50 shadow-sm"
            />
            <span className="absolute top-3 right-4 text-gray-400">
              <i className="fas fa-user"></i>
            </span>
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-[#7d3c98] bg-gray-50 shadow-sm"
            />
            <span className="absolute top-3 right-4 text-gray-400">
              <i className="fas fa-lock"></i>
            </span>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#cf446d] to-[#7d3c98] rounded-lg shadow-lg hover:shadow-xl hover:opacity-90 focus:outline-none focus:ring focus:ring-[#7d3c98] transition-transform transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              isLogin ? "Login" : "Register"
            )}
          </button>
        </form>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
          className="w-full mt-6 px-6 py-4 bg-gray-100 text-lg font-bold text-gray-700 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring focus:ring-gray-300 transition-all"
        >
          {isLogin ? "Switch to Register" : "Switch to Login"}
        </button>

        {/* Message Display */}
        {message && (
          <p
            className={`text-center text-lg mt-6 font-semibold ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;