import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputBg, setInputBg] = useState({ email: '#fff', password: '#fff' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Capture state passed with navigation
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFocus = (field) => {
    setInputBg((prev) => ({ ...prev, [field]: '#e8f0fe' }));
  };

  const handleBlur = (field) => {
    setInputBg((prev) => ({ ...prev, [field]: '#fff' }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/signin",
        { email, password }
      );
  
      if (response.data.message === "Login successful") {
        const { userId, firstName } = response.data;
  
        // Store user details in localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("email", email);
  
        // Check if the user is an admin (support@eduinvest.in)
        if (email === "kunal@edumocks.com") {
          // Navigate to admin panel if email matches
          navigate("/admin-panel");
        } else if (location.state?.from) {
          // Navigate back to the originally intended page if exists
          navigate(location.state.from, { state: location.state });
        } else {
          // Default navigation for regular users
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };  

  const responseGoogle = (credentialResponse) => {
    if (credentialResponse.credential) {
      const userData = parseJwt(credentialResponse.credential);
      localStorage.setItem('accessToken', credentialResponse.credential);
      if (userData && userData.email) {
        setEmail(userData.email);
      }
    } else {
      console.error("Google login failed:", credentialResponse);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  };

  return (
    <GoogleOAuthProvider clientId="1066864495489-a36j2vv904kp4tkptnvo80gsp40stnca.apps.googleusercontent.com">
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>Sign In</h1>
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>} {/* Display error */}
        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Email"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: inputBg.email,
              }}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              required
              placeholder="Password"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                paddingRight: '40px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: inputBg.password,
              }}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '15px',
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center' }}>
          <a href="/forgot-password" style={{ textDecoration: 'none' }}>Forgot Password?</a>
        </p>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Not yet registered? <a href="/sign-up" style={{ textDecoration: 'none' }}>Sign Up</a>
        </p>
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={responseGoogle}
            onError={() => console.log('Google login failed')}
            useOneTap
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;
