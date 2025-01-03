import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const SignUp = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputBg, setInputBg] = useState({firstName: '#fff', lastName: '#fff', email: '#fff', phone: '#fff', password: '#fff', confirmPassword: '#fff',
  });
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', phone: '', countryCode: '+1',  // Default to +1 password: '', confirmPassword: '',
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const handleFocus = (field) => setInputBg((prev) => ({ ...prev, [field]: '#e8f0fe' }));
  const handleBlur = (field) => setInputBg((prev) => ({ ...prev, [field]: '#fff' }));
  const [error, setError] = useState('');
  
  const handleInputs = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser((prevUser) => ({ ...prevUser, [name]: value }));

    if (name === 'email') {
      setEmail(value);
      setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    }
  };

  const PostData = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      // Combine the country code and phone number before sending
      const fullPhoneNumber = user.countryCode + user.phone;

      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName: user.firstName,lastName: user.lastName,email: user.email,countryCode: user.countryCode,phone: user.phone,fullPhoneNumber: fullPhoneNumber,password: user.password, }),
      });

      const data = await response.json();
      if (response.ok) {
        setError(''); // Successful registration
        await sendWelcomeEmail(user.email, user.firstName);
        navigate('/sign-in'); // Redirect to sign-in page after successful signup
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred during registration');
    }
  };
  // Send the welcome email via backend API call
  const sendWelcomeEmail = async (email, firstName) => {
    try {
      console.log('Sending welcome email to:', email, 'with first name:', firstName); // Add this log
      const response = await fetch('/api/email/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, firstName: firstName }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to send welcome email:', data.message);
      } else {
        console.log('Welcome email sent successfully:', data.message);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };
  

  const responseGoogle = (credentialResponse) => {
    if (credentialResponse.credential) {
      const userData = parseJwt(credentialResponse.credential);
      console.log('User Data:', userData);

      // Update the user state with data from Google
      setUser({ ...user, firstName: userData.given_name || '',lastName: userData.family_name || '',email: userData.email || '',});
      localStorage.setItem('accessToken', credentialResponse.credential);
    } else {
      console.error('Google login failed:', credentialResponse);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  };

  return (
    <GoogleOAuthProvider clientId="1066864495489-a36j2vv904kp4tkptnvo80gsp40stnca.apps.googleusercontent.com">
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>Sign Up</h1>
        <form method="POST" style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="text" id="firstName" name="firstName" required placeholder="First Name" autoComplete="off" value={user.firstName} onChange={handleInputs} style={{ ...inputStyles, backgroundColor: inputBg.firstName }} onFocus={() => handleFocus('firstName')} onBlur={() => handleBlur('firstName')} />
          <input type="text" id="lastName" name="lastName" required placeholder="Last Name" autoComplete="off" value={user.lastName} onChange={handleInputs} style={{ ...inputStyles, backgroundColor: inputBg.lastName }} onFocus={() => handleFocus('lastName')} onBlur={() => handleBlur('lastName')} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <input type="email" id="email" name="email" required placeholder="Email" autoComplete="off" value={user.email} onChange={handleInputs} style={{ ...inputStyles, backgroundColor: inputBg.email, paddingRight: '40px' }} onFocus={() => handleFocus('email')} onBlur={() => handleBlur('email')} />
            {email.length > 0 && (emailValid ? <AiOutlineCheck style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translate(0, -50%)', color: 'green' }} /> : <AiOutlineClose style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translate(0, -50%)', color: 'red' }} />)}
          </div>
          <div style={{ display: 'flex' }}>
            <select id="countryCode" name="countryCode" value={user.countryCode} onChange={handleInputs} style={{ ...countryCodeStyles }}>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+91">+91 (India)</option>
            </select>
            <input type="tel" id="phone" name="phone" required placeholder="Phone Number" autoComplete="off" value={user.phone} onChange={handleInputs} style={{ ...phoneInputStyles, backgroundColor: inputBg.phone, flex: 1 }} onFocus={() => handleFocus('phone')} onBlur={() => handleBlur('phone')} />
          </div>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" required placeholder="Password" autoComplete="off" value={user.password} onChange={handleInputs} style={{ ...inputStyles, backgroundColor: inputBg.password }} onFocus={() => handleFocus('password')} onBlur={() => handleBlur('password')} />
            <span onClick={togglePasswordVisibility} style={iconStyles}>{showPassword ? <FaEye /> : <FaEyeSlash />}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" required placeholder="Confirm Password" autoComplete="off" value={user.confirmPassword} onChange={handleInputs} style={{ ...inputStyles, backgroundColor: inputBg.confirmPassword }} onFocus={() => handleFocus('confirmPassword')} onBlur={() => handleBlur('confirmPassword')} />
            <span onClick={toggleConfirmPasswordVisibility} style={iconStyles}>{showConfirmPassword ? <FaEye /> : <FaEyeSlash />}</span>
          </div>
          <button type="submit" onClick={PostData} style={buttonStyles}>Sign Up</button>
        </form>   
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>} {/* Error message display */}

        <div style={googleButtonContainerStyles}>
          <GoogleLogin onSuccess={responseGoogle}  onError={responseGoogle}  style={googleButtonStyles} />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const inputStyles = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '50px', marginBottom: '15px' };
const countryCodeStyles = { width: '30%', padding: '12px', borderRadius: '8px 0 0 8px', height: '50px', border: '1px solid #ccc', marginBottom: '15px' };
const phoneInputStyles = { width: '70%', padding: '12px', borderRadius: '0 8px 8px 0', border: '1px solid #ccc', height: '50px', marginBottom: '15px' };
const iconStyles = { position: 'absolute', right: '10px', top: '50%', transform: 'translate(0, -50%)', cursor: 'pointer' };
const buttonStyles = { padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px' };
const googleButtonStyles = { width: '100%', padding: '12px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', marginTop: '15px' };
const googleButtonContainerStyles = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '20px' };

export default SignUp;