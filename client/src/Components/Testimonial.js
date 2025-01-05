import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const testimonials = [
  { name: "John D.", course: "CFA Level 1 Graduate", message: "I passed Level 1 on my first try! The mock tests were spot on with the real exam questions. Highly recommend this platform.", rating: 5 },
  { name: "Sarah L.", course: "CFA Level 2 Graduate", message: "The analytics tool helped me identify my weaknesses and target them effectively. I felt more confident than ever going into the exam!", rating: 5 },
  { name: "Michael R.", course: "CFA Level 1 Graduate", message: "The test-taking strategy I learned here was a game-changer. I felt fully prepared and scored better than I ever thought possible.", rating: 5 },
  { name: "Emma T.", course: "CFA Level 2 Graduate", message: "I appreciated the structured study approach and the challenging mock exams. It really helped me stay on track and build my confidence.", rating: 4 },
  { name: "James P.", course: "CFA Level 3 Graduate", message: "The detailed explanations after each mock exam were incredibly helpful in improving my understanding. I couldn't have passed without this platform.", rating: 5 },
  { name: "Linda H.", course: "CFA Level 1 Graduate", message: "The user-friendly interface made it so easy to navigate through the study material. I could focus on learning without being distracted.", rating: 4 },
  { name: "Daniel S.", course: "CFA Level 2 Graduate", message: "The variety of test options available gave me the ability to tailor my study sessions. It made my exam prep much more effective.", rating: 4 },
  { name: "Olivia M.", course: "CFA Level 3 Graduate", message: "Mock exams here helped me grasp the format of the actual test. This was critical in helping me build my time management skills.", rating: 5 }
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    if (currentIndex < testimonials.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevTestimonial = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div style={{ backgroundColor: "#f4f4f9", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p style={{ fontSize: '1.2rem', color: '#C80D18', fontWeight: 'bold' }}>Testimonial</p>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#100B5C", lineHeight: "1.3" }}>
          Real Success Stories from Our Students
        </h1>
      </div>

      <div style={{ position: "relative", display: "flex", overflow: "hidden" }}>
        <div
          style={{
            display: "flex", 
            transition: "transform 1s ease", 
            transform: `translateX(-${currentIndex * 330}px)`
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} style={{ backgroundColor: "#FFFFFF",  borderRadius: "10px",  padding: "20px",  width: "300px",  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",  textAlign: "center",  margin: "0 15px"}}>
              <p style={{ fontSize: "1rem", color: "#202021", marginBottom: "20px", fontStyle: "italic" }}>
                "{testimonial.message}"
              </p>
              <div style={{ color: "#FFDC5C", marginBottom: "20px" }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <AiFillStar key={i} style={{ fontSize: "1.5rem", marginRight: "5px" }} />
                ))}
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#100B5C" }}>{testimonial.name}</h2>
              <p style={{ fontSize: "1rem", color: "#999" }}>{testimonial.course}</p>
            </div>
          ))}
        </div>

        {/* Left Scroll Button */}
        {currentIndex > 0 && (
          <button onClick={prevTestimonial} style={{ position: "absolute", top: "50%", left: "10px", backgroundColor: "#C80D18", color: "#fff", 
            border: "none", padding: "10px", borderRadius: "50%", cursor: "pointer", transform: "translateY(-50%)"
          }}>
            <FiArrowLeft size={24} />
          </button>
        )}

        {/* Right Scroll Button */}
        {currentIndex < testimonials.length - 1 && (
          <button onClick={nextTestimonial} style={{
            position: "absolute", top: "50%", right: "10px", backgroundColor: "#C80D18", color: "#fff", 
            border: "none", padding: "10px", borderRadius: "50%", cursor: "pointer", transform: "translateY(-50%)"
          }}>
            <FiArrowRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Testimonial;