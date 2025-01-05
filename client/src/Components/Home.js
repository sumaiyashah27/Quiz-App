import React, { useEffect } from "react"; 
import BannerBackground from "../Assets/home-banner-background.jpg"; 
import { FiArrowRight } from "react-icons/fi"; 
import SignIn from "./SignIn"; 

const Home = () => {
  const firstName = localStorage.getItem("firstName"); // Retrieve user data

  // Function to scroll to the bookcourse section
  const scrollToBookCourse = () => {
    const bookcourseSection = document.getElementById("bookcourse");
    if (bookcourseSection) {
      bookcourseSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Check if firstName exists and ensure the page reloads only once
    if (firstName && !localStorage.getItem("reloaded")) {
      localStorage.setItem("reloaded", "true"); // Set the reloaded flag
      window.location.reload(); // Reload the page once after firstName is found
    }
  }, [firstName]); // This runs after firstName is fetched

  return (
    <div className="home-container">
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          {firstName && (
            <h2 className="welcome-text" style={{ color: '#C80D18' }}>Hello, {firstName}!</h2>
          )}
          <h1 className="primary-heading-mob">Ace Your CFA Exam with Confidence!</h1>
          <p className="primary-text-mob">
            Start your journey to becoming a CFA charterholder today. Join thousands of successful candidates who trusted us to achieve their goals.
          </p>
          <button className="about-buttons-container" onClick={scrollToBookCourse}>
            <span className="secondary-button">
              {firstName ? "Book Test" : "Book Your Test Now"} <FiArrowRight />
            </span>
          </button>
        </div>

        {/* Conditionally render the sign-in form */}
        {!firstName && (
          <div style={{
            flex: 0.4, // Reduce flex to take less space
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: '#f7f7f7',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            marginLeft: '20px',
            maxWidth: '400px', // Limit the width of the form
            height: 'auto', // Allow auto height based on content
            minHeight: '300px', // Ensure the form has a minimum height
          }}>
            <SignIn />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
