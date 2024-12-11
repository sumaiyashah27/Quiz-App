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
            <h2 className="welcome-text">Hello, {firstName}!</h2> // Welcome message
          )}
          <h1 className="primary-heading">Conquer Your CFA Level Exam!</h1>
          <p className="primary-text">
            Boost your confidence with our engaging mock tests. Prepare smarter, not harder!
          </p>
          <button className="about-buttons-container">
            <Link
              to={firstName ? "#bookcourse" : "/sign-in"} // Update button link
              className="secondary-button"
            >
              {firstName ? "Book Your Test" : "Start Now"} <FiArrowRight />
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
