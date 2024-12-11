import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa"; 

const Bookcourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  // eslint-disable-next-line
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // To store user details
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch courses
    axios
      .get("/api/courses")
      .then((response) => setCourses(response.data))
      .catch((error) => console.error("Error fetching courses:", error));

    // Check if the user is logged in by looking for userId in localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
      // Fetch user data from MongoDB using the userId
      axios
        .get(`/api/users/${userId}`)
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

  const handleBookTest = (course) => {
    setSelectedCourse(course);  // Store the selected course in state
    // Fetch the subjects associated with this course from the backend
    axios
      .get(`/api/subjects?courseId=${course._id}`)  // Sending courseId to backend
      .then((response) => setSubjects(response.data))  // Set subjects in state
      .catch((error) => console.error("Error fetching subjects:", error));
  };
  

  const handleCheckboxChange = (subject) => {
    const isSelected = selectedSubjects.find((s) => s._id === subject._id);
    if (isSelected) {
      setSelectedSubjects(selectedSubjects.filter((s) => s._id !== subject._id));
      setTotalPrice((prevPrice) => {
        const newPrice = prevPrice - subject.price;
        return parseFloat(newPrice.toFixed(2)); // Ensure precision
      });
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
      setTotalPrice((prevPrice) => {
        const newPrice = prevPrice + subject.price;
        return parseFloat(newPrice.toFixed(2)); // Ensure precision
      });
    }
  };

  const handlePayment = async () => {
    if (selectedSubjects.length === 0) {
      setErrorMessage("Please select at least one subject.");
      return; // Stop the payment process if no subjects are selected
    } else {
      setErrorMessage(""); // Clear the error message if subjects are selected
    }
    if (!isLoggedIn) {
      // Redirect to sign-in page
      navigate("/sign-in", {
        state: {
          from: "/payment",
          courseId: selectedCourse._id,
          selectedSubjects: selectedSubjects,
          totalPrice: totalPrice,
        },
      });
    } else {
      // Proceed to payment page if logged in
      navigate("/payment", {
        state: {
          courseId: selectedCourse._id,
          selectedSubjects: selectedSubjects,
          totalPrice: totalPrice,
        },
      });
    }
  };

  return (
    <div className="work-section-wrapper" style={{ padding: "20px", backgroundColor: "#f4f4f9", fontFamily: "Arial, sans-serif" }}>
      <div className="work-section-top" style={{ textAlign: "center" }}>
        <p className="primary-subheading" style={{ fontSize: "1.2rem", color: "#fe9e0d" }}>Courses</p>
        <h1 className="primary-heading" style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>Book Your Test</h1>
      </div>

      {/* Display personalized message after login */}
      {isLoggedIn && user && (
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "1.2rem", color: "#007bff" }}>
            Hey {user.firstName}, book your test now!
          </p>
          {/* <p style={{ fontSize: "1.2rem", color: "#007bff" }}>{user._id}</p> */}
        </div>
      )}

      <div className="courses-section-wrapper" style={{ marginTop: "30px" }}>
        <div className="courses-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", justifyContent: "center", alignItems: "center" }}>
          {courses.map((course) => (
            <div key={course._id} className="course-card" style={{ backgroundColor: "#fff", borderRadius: "15px", padding: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", textAlign: "center", transition: "transform 0.3s ease-in-out" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-10px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <h3 className="course-name" style={{ fontSize: "1.5rem", color: "#333", marginBottom: "10px" }}>{course.name}</h3>
              <button className="book-test-button" onClick={() => handleBookTest(course)} style={{ backgroundColor: "#fe9e0d", color: "#fff", padding: "12px 20px", fontSize: "1rem", border: "none", borderRadius: "5px", cursor: "pointer", transition: "background-color 0.3s ease" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d47b09"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fe9e0d"}>
                <FaBook /> Book Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <div className="popup" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#fff", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)", width: "80%", maxWidth: "600px", zIndex: "1000", overflowY: "auto", boxSizing: "border-box", maxHeight: "80vh" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: "20px" }}>Select Subjects for {selectedCourse.name}</h2>
          <ul className="subject-list" style={{ listStyleType: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", justifyContent:"center" }}>
            {selectedCourse.subjects.map((subject) => (
              <li key={subject._id} style={{ backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center", transition: "transform 0.3s ease" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <label style={{ fontSize: "1rem", color: "#333", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" onChange={() => handleCheckboxChange(subject)} style={{ accentColor: "#fe9e0d", width: "20px", height: "20px" }} />
                  {subject.name}
                </label>
              </li>
            ))}
          </ul>
          {errorMessage && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "20px", textAlign: "center" }}>
              {errorMessage}
            </p>
          )}
          <div className="popup-footer" style={{ marginTop: "30px", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <p style={{ fontSize: "1.2rem", color: "#333", fontWeight: "bold", marginBottom: "20px" }}>Total Price: ${parseFloat(totalPrice).toFixed(2)}</p>
            <button className="popup-button" onClick={handlePayment} style={{ backgroundColor: "#fe9e0d", color: "#fff", padding: "12px 25px", fontSize: "1.2rem", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "10px", transition: "background-color 0.3s ease, transform 0.3s ease" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#d47b09"; e.currentTarget.style.transform = "scale(1.05)"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fe9e0d"; e.currentTarget.style.transform = "scale(1)"; }}>Book Test</button>
            <div style={{ position: "absolute", top: "15px", right: "15px", cursor: "pointer" }} onClick={() => { setSelectedCourse(null); setSubjects([]); setSelectedSubjects([]); setTotalPrice(0); }}>
              <FaTimes size={20} style={{ color: "#333" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookcourse;
