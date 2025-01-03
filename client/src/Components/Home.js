import React from "react";
import BannerBackground from "../Assets/home-banner-background.png";
import BannerImage from "../Assets/home-banner-image.png";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
  const firstName = localStorage.getItem("firstName"); // Retrieve user data

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
          <h1 className="primary-heading" style={{ fontSize: '2.1rem', color: '#100B5C', margin: '20px 0' }}>Ace Your CFA Exam with Confidence!</h1>
          <p className="primary-text">
          Start your journey to becoming a CFA charterholder today. Join thousands of successful candidates who trusted us to achieve their goals.
          </p>
          <button className="about-buttons-container">
            <Link
              to={firstName ? "#bookcourse" : "/sign-in"} // Update button link
              className="secondary-button"
            >
              {firstName ? "Book Test" : "Book Your Test Now"} <FiArrowRight />
            </Link>
          </button>
        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
