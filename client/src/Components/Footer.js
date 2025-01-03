import React from "react";
import Logo from "../Assets/edulogo-2.png";
import { BsTwitter } from "react-icons/bs";
import { SiLinkedin } from "react-icons/si";
import { BsYoutube } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <div style={{ backgroundColor: '#100B5C', color: '#fff', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={Logo} alt="EduMocks Logo" style={{ maxWidth: '200px', marginBottom: '10px' }} />
          <p style={{ fontSize: '1.2rem', color: '#FFDC5C' }}>Enhancing Your CFA Exam Preparation</p>
          <div style={{ fontSize: '2rem', marginTop: '10px' }}>
            <SiLinkedin style={{ marginRight: '15px', cursor: 'pointer' }} />
            <BsYoutube style={{ marginRight: '15px', cursor: 'pointer' }} />
            <FaFacebookF style={{ marginRight: '15px', cursor: 'pointer' }} />
            <BsTwitter style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px', marginBottom: '30px' }}>
            <h3 style={{ color: '#FFDC5C', fontSize: '1.4rem' }}>Contact Us</h3>
            <span style={{ display: 'block', marginTop: '10px' }}>244-5333-7783</span>
            <span style={{ display: 'block', marginTop: '10px' }}>hello@edumocks.com</span>
            <span style={{ display: 'block', marginTop: '10px' }}>press@edumocks.com</span>
            <span style={{ display: 'block', marginTop: '10px' }}>contact@edumocks.com</span>
          </div>

          <div style={{ flex: '1', minWidth: '250px', marginBottom: '30px' }}>
            <h3 style={{ color: '#FFDC5C', fontSize: '1.4rem' }}>Quick Links</h3>
            <span style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}>Terms & Conditions</span>
            <span style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}>Privacy Policy</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: '#ddd' }}>
        <p>&copy; 2025 EduMocks. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
