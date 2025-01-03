import React from "react";
import AboutBackground from "../Assets/about-background.png";
import { FiArrowRight } from "react-icons/fi";
import AboutBackgroundImage from "../Assets/about-background-image.png";
import { Link } from "react-router-dom";

const About = () => {
  const firstName = localStorage.getItem("firstName"); // Retrieve user data

  return (
    <div className="about-section-container"  style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 'auto', filter: 'blur(5px)', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <img src={AboutBackground} alt="About Background" style={{ width: '100%' }} />
      </div>
      <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', color: '#C80D18', fontWeight: 'bold' }}>Why Choose Us?</p>
        <h1 style={{ fontSize: '2.1rem', color: '#100B5C', margin: '20px 0' }}>Why Thousands of CFA Candidates Choose Us</h1>
        <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>Join thousands of successful candidates who have relied on our resources to enhance their exam readiness. Let’s make your CFA journey smoother and more effective!</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', marginTop: '40px', padding: '0 15px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', width: '250px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', textAlign: 'center', transition: 'transform 0.3s ease-in-out', marginBottom: '20px' }}>
            <div style={{ fontSize: '2.5rem', color: '#100B5C' }}>📚</div>
            <h3 style={{ fontSize: '1.5rem', color: '#C80D18', marginTop: '15px' }}>Realistic Mock Exams</h3>
            <p style={{ fontSize: '1rem', color: '#555', marginTop: '10px' }}>Prepare like you’re already in the exam room. Our practice tests mirror the real CFA exam to help you feel ready and confident.</p>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', width: '250px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', textAlign: 'center', transition: 'transform 0.3s ease-in-out', marginBottom: '20px' }}>
            <div style={{ fontSize: '2.5rem', color: '#100B5C' }}>📈</div>
            <h3 style={{ fontSize: '1.5rem', color: '#C80D18', marginTop: '15px' }}>Personalized Performance Analytics</h3>
            <p style={{ fontSize: '1rem', color: '#555', marginTop: '10px' }}>Track your progress, identify areas for improvement, and boost your weak spots. Our analytics ensure you know exactly what to focus on.</p>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', width: '250px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', textAlign: 'center', transition: 'transform 0.3s ease-in-out', marginBottom: '20px' }}>
            <div style={{ fontSize: '2.5rem', color: '#100B5C' }}>🎓</div>
            <h3 style={{ fontSize: '1.5rem', color: '#C80D18', marginTop: '15px' }}>Expert Tips and Strategies</h3>
            <p style={{ fontSize: '1rem', color: '#555', marginTop: '10px' }}>Gain exclusive access to CFA exam tips and strategies from top performers. Learn the tricks to maximize your score!</p>
          </div>
        </div>

        <div style={{ marginTop: '40px' }} >
          <Link to={firstName ? "#bookcourse" : "/sign-in"} style={{ backgroundColor: '#100B5C', padding: '15px 30px', fontSize: '1.1rem', color: '#fff', textDecoration: 'none', borderRadius: '5px', transition: 'background-color 0.3s ease', display: 'inline-block' }}>
            {firstName ? "Book Your Test" : "Student Sign In"} <FiArrowRight   style={{ fontSize: "1.5rem",  marginLeft: "8px",  verticalAlign: "middle",}}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
