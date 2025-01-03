import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Import the Navbar component

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [inputBg, setInputBg] = useState('#fff');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleFocus = () => {
    setInputBg('#e8f0fe'); // Change background color on focus
  };

  const handleBlur = () => {
    setInputBg('#fff'); // Reset background color on blur
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    // Verify email request - now it sends the email to /api/users/verify-email
    const response = await fetch('/api/users/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage('Email verified. You can now reset your password.');
      setIsEmailVerified(true);
    } else {
      setMessage('Email not found. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    // Password reset request - now it sends the email and new password to /api/users/reset-password
    const response = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {  // Check for a successful response
      setMessage('Your password has been reset successfully.');
      navigate('/sign-in'); 
    } else {
      setMessage(`Error: ${data.message || 'Please try again.'}`);
    }
};

  return (
    <>
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>Forgot Password</h1>

        {!isEmailVerified ? (
          <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <input type="email" id="email" name="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: inputBg, }}
              />
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px', }} >
              Verify Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" id="newPassword" name="newPassword" required placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', }} />
            </div>
            <button type="submit" style={{  padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px',}} >
              Reset Password
            </button>
          </form>
        )}

        {message && <p style={{ textAlign: 'center', color: isEmailVerified ? 'green' : 'red' }}>{message}</p>}
        <p style={{ textAlign: 'center' }}>
          <a href="/sign-in" style={{ textDecoration: 'none' }}>
            Back to Sign In
          </a>
        </p>
      </div>
    </>
  );
};

export default ForgotPassword;
