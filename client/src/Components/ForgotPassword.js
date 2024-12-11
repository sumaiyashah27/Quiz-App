import React, { useState } from 'react';
import Navbar from './Navbar'; // Import the Navbar component

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [inputBg, setInputBg] = useState('#fff');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleFocus = () => {
    setInputBg('#e8f0fe'); // Change background color on focus
  };

  const handleBlur = () => {
    setInputBg('#fff'); // Reset background color on blur
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    // Here you would typically make a request to your API to send the OTP
    console.log('OTP sent to:', email);
    setMessage('An OTP has been sent to your email.');
    setIsOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // Here you would typically verify the OTP
    if (otp === '123456') { // Replace with actual OTP validation logic
      setMessage('OTP verified. You can now reset your password.');
      setIsOtpVerified(true);
    } else {
      setMessage('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Here you would typically send the new password to your API
    console.log('Password reset to:', newPassword);
    setMessage('Your password has been reset successfully.');
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>Forgot Password</h1>

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: inputBg,
                }}
              />
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
            >
              Send OTP
            </button>
          </form>
        ) : !isOtpVerified ? (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                id="otp"
                name="otp"
                required
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
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
            >
              Verify OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
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
            >
              Reset Password
            </button>
          </form>
        )}

        {message && <p style={{ textAlign: 'center', color: isOtpVerified ? 'green' : 'red' }}>{message}</p>}
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
