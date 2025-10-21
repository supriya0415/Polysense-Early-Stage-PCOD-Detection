import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DebugLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set mock authentication data
    localStorage.setItem('token', 'debug-token-123');
    localStorage.setItem('username', 'DebugUser');
    
    // Redirect to home2 page
    navigate('/home2');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-pink-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-[#cf446d] mb-4">Debug Login</h1>
        <p className="text-gray-600">Setting debug credentials and redirecting...</p>
      </div>
    </div>
  );
};

export default DebugLogin;
