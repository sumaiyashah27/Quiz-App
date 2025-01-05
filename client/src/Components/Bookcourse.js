import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const Bookcourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    axios.get("/api/courses")
      .then((response) => setCourses(response.data))
      .catch((error) => console.error("Error fetching courses:", error));

    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
      axios.get(`/api/users/${userId}`)
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user data:", error));
    }

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBookTest = (course) => {
    setSelectedCourse(course);
    axios.get(`/api/subjects?courseId=${course._id}`)
      .then((response) => setSubjects(response.data))
      .catch((error) => console.error("Error fetching subjects:", error));
  };

  const handleCheckboxChange = (subject) => {
    const isSelected = selectedSubjects.find((s) => s._id === subject._id);
    if (isSelected) {
      setSelectedSubjects(selectedSubjects.filter((s) => s._id !== subject._id));
      setTotalPrice((prevPrice) => parseFloat((prevPrice - subject.price).toFixed(2)));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
      setTotalPrice((prevPrice) => parseFloat((prevPrice + subject.price).toFixed(2)));
    }
  };

  const handlePayment = async () => {
    if (selectedSubjects.length === 0) {
      setErrorMessage("Please select at least one subject.");
      return;
    } else {
      setErrorMessage("");
    }
    if (!isLoggedIn) {
      navigate("/sign-in", { state: { from: "/payment", courseId: selectedCourse._id, selectedSubjects: selectedSubjects, totalPrice: totalPrice } });
    } else {
      navigate("/payment", { state: { courseId: selectedCourse._id, selectedSubjects: selectedSubjects, totalPrice: totalPrice } });
    }
  };

  const getCardContainerStyle = () => {
    if (screenWidth > 1000) return { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", alignItems: "center" };
    if (screenWidth > 800) return { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", alignItems: "center" };
    if (screenWidth > 600) return { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", alignItems: "center" };
    return { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", alignItems: "center" };
  };

  const getCardStyle = () => {
    if (screenWidth > 1000) return { flex: "1 1 calc(25% - 20px)", marginBottom: "20px", textAlign: "center" };
    if (screenWidth > 800) return { flex: "1 1 calc(33% - 20px)", marginBottom: "20px", textAlign: "center" };
    if (screenWidth > 600) return { flex: "1 1 calc(50% - 20px)", marginBottom: "20px", textAlign: "center" };
    return { flex: "1 1 100%", marginBottom: "20px", textAlign: "center" };
  };

  return (
    <div className="work-section-wrapper" style={{ padding: "20px", backgroundColor: "#f4f4f9", fontFamily: "Arial, sans-serif", marginBottom: '30px' }}>
      <div className="work-section-top" style={{ textAlign: "center" }}>
        <p className="primary-subheading" style={{ fontSize: '1.2rem', color: '#C80D18', fontWeight: 'bold' }}>Courses</p>
        <h1 className="primary-heading" style={{ fontSize: "2rem", fontWeight: "bold", color: "#100B5C" }}>Book Your Test</h1>
        <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>Find your course, pick the subjects you need, and book your test easily. No hassle, just learning made simple!</p>
      </div>

      <div className="courses-section-wrapper" style={getCardContainerStyle()}>
        <div className="courses-container" style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {courses.map((course) => (
            <div key={course._id} className="course-card" style={getCardStyle()}>
              <h3 className="course-name" style={{ fontSize: "1.5rem", color: "#202021", marginBottom: "10px" }}>{course.name}</h3>
              <button className="book-test-button" onClick={() => handleBookTest(course)} style={{ backgroundColor: "#C80D18", color: "#fff", padding: "12px 20px", fontSize: "1rem", border: "none", borderRadius: "5px", cursor: "pointer", transition: "background-color 0.3s ease" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d47b09"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#C80D18"}>
                <FaBook /> Book Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <div className="popup" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)", width: "80%", maxWidth: "600px", zIndex: "1000", overflowY: "auto", boxSizing: "border-box", maxHeight: "80vh" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#100B5C", textAlign: "center", marginBottom: "20px" }}>Select Subjects for {selectedCourse.name}</h2>
          <ul className="subject-list" style={{ listStyleType: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", justifyContent: "center" }}>
            {selectedCourse.subjects.map((subject) => (
              <li key={subject._id} style={{ backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center", transition: "transform 0.3s ease" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <label style={{ fontSize: "1rem", color: "#202021", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" onChange={() => handleCheckboxChange(subject)} style={{ accentColor: "#C80D18", width: "20px", height: "20px" }} />
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
            <p style={{ fontSize: "1.2rem", color: "#202021", fontWeight: "bold", marginBottom: "20px" }}>Total Price: ${parseFloat(totalPrice).toFixed(2)}</p>
            <button className="popup-button" onClick={handlePayment} style={{ backgroundColor: "#C80D18", color: "#fff", padding: "12px 25px", fontSize: "1.2rem", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "10px", transition: "background-color 0.3s ease, transform 0.3s ease" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#d47b09"; e.currentTarget.style.transform = "scale(1.05)"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#C80D18"; e.currentTarget.style.transform = "scale(1)"; }}>Book Test</button>
            <div style={{ position: "absolute", top: "15px", right: "15px", cursor: "pointer" }} onClick={() => { setSelectedCourse(null); setSubjects([]); setSelectedSubjects([]); setTotalPrice(0); }}>
              <FaTimes size={20} style={{ color: "#100B5C" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookcourse;
