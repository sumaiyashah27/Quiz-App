import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js"; // Import Elements
import { loadStripe } from "@stripe/stripe-js"; // Import loadStripe
import "./App.css";
import Home from "./Components/Home";
import About from "./Components/About";
import Bookcourse from "./Components/Bookcourse";
import Testimonial from "./Components/Testimonial";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import ForgotPassword from "./Components/ForgotPassword";
import UserPanel from "./Components/Userpanel";
import AdminPanel from "./Components/Adminpanel";
import Navbar from "./Components/Navbar";
import Payment from "./Components/Usepanel/payment";
import Test from "./Components/Usepanel/test";
import DelayTestPayment from './Components/Usepanel/DelayTestPayment'; 

// Load Stripe with your publishable key
const stripePromise = loadStripe("pk_live_51OycdmERHQrnMM9imLJNMrKj0ce8aiM5Id3f3Fysv3blGmFeJukWIZ1yvf3j8VJ0WUCOaMgfyJyXcUkJyjDTesNn00y5Rdqcwh");

function App() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // Track logged-in user

  const handleScroll = () => {
    setShowScrollButton(window.scrollY > 100);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section id="home">
                  <Home loggedInUser={loggedInUser} />
                </section>
                <section id="about">
                  <About loggedInUser={loggedInUser} />
                </section>
                <section id="bookcourse">
                  <Bookcourse />
                </section>
                <section id="testimonials">
                  <Testimonial />
                </section>
                <section id="contact">
                  <Contact />
                </section>
              </>
            }
          />
          <Route path="/sign-in" element={<SignIn setLoggedInUser={setLoggedInUser} />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user-panel" element={<UserPanel />} />
          <Route path="/admin-panel" element={<AdminPanel />} />

          {/* Wrap the Payment route with Elements */}
          <Route path="/payment" element={<Elements stripe={stripePromise}><Payment /></Elements>} />
          <Route path="/test/:course/:subject" element={<Test />} />
          <Route
            path="/delaytestpayment"
            element={
              <Elements stripe={stripePromise}>
                <DelayTestPayment />
              </Elements>
            }
          />
        </Routes>
        <Footer />
        {showScrollButton && (
          <button
            className="scroll-up"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;