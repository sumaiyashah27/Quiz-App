import React from "react";
import AboutBackground from "../Assets/about-background.png";
import AboutBackgroundImage from "../Assets/about-background-image.png";
import { Link } from "react-router-dom";

const About = () => {
  const firstName = localStorage.getItem("firstName"); // Retrieve user data

  return (
    <div className="about-section-container">
      <div className="about-background-image-container">
        <img src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <img src={AboutBackgroundImage} alt="" />
      </div>
      <div className="about-section-text-container">
        <p className="primary-subheading">About Us</p>
        <h1 className="primary-heading">Your Path to CFA Success Starts Here</h1>
        <p className="primary-text">
          At Edumock, we understand that preparing for the CFA Level Exam can be challenging. Our comprehensive mock tests are designed to help you master the material and build confidence.
        </p>
        <p className="primary-text">
          Join thousands of successful candidates who have relied on our resources to enhance their exam readiness. Let’s make your CFA journey smoother and more effective!
        </p>
        <div className="about-buttons-container">
          <Link
            to={firstName ? "#bookcourse" : "/sign-in"} // Update button link
            className="secondary-button"
          >
            {firstName ? "Book Your Test" : "Student Sign In"} 
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
