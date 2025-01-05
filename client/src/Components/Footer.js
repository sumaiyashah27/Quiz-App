import React from "react";
import Logo from "../Assets/edulogo-2.png";
import { BsTwitter } from "react-icons/bs";
import { SiLinkedin } from "react-icons/si";
import { BsYoutube } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#100B5C', color: '#fff', padding: '20px 0', fontFamily: 'Arial, sans-serif', width: '100%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Section */}
          <div style={{ textAlign: 'center', flex: '1', minWidth: '300px', marginBottom: '20px' }}>
            <img src={Logo} alt="EduMocks Logo" style={{ maxWidth: '180px', marginBottom: '10px' }} />
            <p style={{ fontSize: '1.2rem', color: '#FFDC5C' }}>Enhancing Your CFA Exam Preparation</p>
            <div style={{ fontSize: '1.5rem', marginTop: '10px' }}>
              <SiLinkedin style={{ marginRight: '15px', cursor: 'pointer' }} />
              <BsYoutube style={{ marginRight: '15px', cursor: 'pointer' }} />
              <FaFacebookF style={{ marginRight: '15px', cursor: 'pointer' }} />
              <BsTwitter style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Contact Section */}
          <div style={{ flex: '1', minWidth: '250px', marginBottom: '20px' }}>
            <h3 style={{ color: '#FFDC5C', fontSize: '1.4rem' }}>Contact Us</h3>
            <span style={{ display: 'block', marginTop: '10px' }}>244-5333-7783</span>
            <span style={{ display: 'block', marginTop: '10px' }}>hello@edumocks.com</span>
            <span style={{ display: 'block', marginTop: '10px' }}>press@edumocks.com</span>
            <span style={{ display: 'block', marginTop: '10px' }}>contact@edumocks.com</span>
          </div>

          {/* Quick Links Section */}
          <div style={{ flex: '1', minWidth: '250px', marginBottom: '20px' }}>
            <h3 style={{ color: '#FFDC5C', fontSize: '1.4rem' }}>Quick Links</h3>
            <span style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}>Terms & Conditions</span>
            <span style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}>Privacy Policy</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#ddd' }}>
        <p>&copy; 2025 EduMocks. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
