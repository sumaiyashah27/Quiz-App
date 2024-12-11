import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
// eslint-disable-next-line
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// eslint-disable-next-line
const stripePromise = loadStripe("pk_live_51OycdmERHQrnMM9imLJNMrKj0ce8aiM5Id3f3Fysv3blGmFeJukWIZ1yvf3j8VJ0WUCOaMgfyJyXcUkJyjDTesNn00y5Rdqcwh");

const Payment = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, selectedSubjects, totalPrice } = location.state || {};
  const [userData, setUserData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!courseId || !selectedSubjects) {
      alert("Invalid course or subjects data.");
      return;
    }
    // Fetch course details
    axios.get(`http://localhost:5000/api/courses/${courseId}`) // Correct API URL for course
    .then((response) => {
      setSelectedCourse(response.data);
    })
      .catch((error) => console.error("Error fetching course:", error));

    // Fetch user data
    const userId = localStorage.getItem("userId");
    if (userId) {
      axios.get(`http://localhost:5000/api/users/${userId}`) // Correct API URL for user
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data.");
      });

    } else {
      alert("User not logged in.");
      navigate("/signin");
    }
  }, [courseId, selectedSubjects, navigate]);

  // const handlePayment = async (event) => {
  //   event.preventDefault();
  
  //   // Skip Stripe call and use dummy success response
  //   const result = {
  //     paymentIntent: {
  //       status: "succeeded", // Fake success status
  //       id: "dummy_payment_intent_123", // Dummy payment ID
  //     },
  //   };
  
  //   try {
  //     // Directly proceed to save the data in the backend
  //     await axios.post("/api/quizenroll", {
  //       userId: userData._id,
  //       selectedCourse: courseId,
  //       selectedSubject: selectedSubjects.map(subject => subject._id),
  //       paymentStatus: "success",
  //       paymentId: result.paymentIntent.id,
  //       amount: totalPrice,
  //       order_id: result.paymentIntent.id, // Use dummy payment ID
  //     });
  
  //     setPaymentStatus("success");
  //     alert("Dummy payment successful! Data saved.");
  //     navigate("/user-panel", { state: { userId: userData._id, firstName: userData.firstName } });
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     alert("Error saving data: " + error.message);
  //   }
  // };
  

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    try {
      // Step 1: Create payment intent on the backend
      const { data } = await axios.post("/api/payment/create-payment-intent", { // Correct URL for payment intent
        amount: totalPrice * 100, // amount in cents
      });
      const { clientSecret } = data;
      // Step 2: Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      // Step 3: Handle result
      if (result.error) {
        console.error(result.error.message);
        setPaymentStatus("failed");
        alert("Payment failed: " + result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          // Payment successful, update the backend and enroll user
          await axios.post("/api/quizenroll", {
            userId: userData._id,
            selectedCourse: courseId,  // Course ID
            selectedSubject: selectedSubjects.map(subject => subject._id),  // Subject IDs only
            paymentStatus: "success",
            paymentId: result.paymentIntent.id,
            amount: totalPrice,
            order_id: result.paymentIntent.id  // Payment Intent ID as the order ID
          });
          setPaymentStatus("success");
          alert("Payment successful. You are enrolled!");
          // Navigate to Userpanel with user data
          navigate("/user-panel", { state: { userId: userData._id, firstName: userData.firstName } });
        }
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("failed");
      alert("Payment failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px", backgroundColor: "#f3f4f6", borderRadius: "12px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)", fontFamily: "'Roboto', sans-serif", color: "#333" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ textAlign: "center", color: "#333", fontSize: "32px", fontWeight: "600", marginBottom: "30px", letterSpacing: "-0.5px" }}>Course Payment</h2>
        {/* User Details */}
        <div style={{ marginBottom: "30px", fontSize: "16px", color: "#555", padding: "10px 0", borderBottom: "1px solid #ddd" }}>
          <p><strong>User ID:</strong> {localStorage.getItem("userId")}</p>
          {userData ? (
            <>
              {/* <p><strong>User MongoDB _id:</strong> {userData._id}</p> */}
              <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
            </>
          ) : (
            <p>Loading user details...</p>
          )}
        </div>
        {/* Course and Payment Details in a Row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "30px", marginBottom: "30px" }}>
          {/* Course Details */}
          <div style={{ backgroundColor: "#eef6ff", padding: "20px", borderRadius: "10px", flex: "1", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            {selectedCourse ? (
              <>
                <p><strong>Course Name:</strong> {selectedCourse.name}</p>
                {/* <p><strong>Course ID:</strong> {selectedCourse._id}</p> */}
              </>
            ) : (
              <p>Loading course details...</p>
            )}
            {/* Selected Subjects */}
            <div style={{ backgroundColor: "#f0fff4", padding: "15px", borderRadius: "8px", marginTop: "20px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)" }}>
              <h3 style={{ color: "#555", fontSize: "22px", fontWeight: "500", marginBottom: "15px" }}>
                Selected Subjects
              </h3>
              <ul style={{ paddingLeft: "20px", listStyleType: "none", marginBottom: "15px", fontSize: "18px", color: "#333" }}>
                {selectedSubjects.map((subject) => (
                  <li key={subject._id}>{subject.name} : ${subject.price}</li>
                ))}
              </ul>
              <p><strong>Total Price:</strong> ${totalPrice}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", flex: "1" }}>
            <h3 style={{ color: "#555", fontSize: "22px", fontWeight: "500", marginBottom: "20px" }}>Payment Details</h3>
            <CardElement options={{style: {base: { fontSize: "16px", color: "#333", padding: "12px", borderRadius: "5px", border: "1px solid #ddd",marginBottom: "20px"} }}} />
            <button onClick={handlePayment}disabled={isProcessing} style={{ width: "100%", padding: "15px", backgroundColor: isProcessing ? "#cccccc" : "#4CAF50", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: isProcessing ? "not-allowed" : "pointer", transition: "background-color 0.3s ease", marginTop: "20px", fontWeight: "600"}}>
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </button>

            {paymentStatus === "success" && (
              <p style={{ color: "#4CAF50", fontSize: "16px", textAlign: "center", marginTop: "20px", fontWeight: "600" }}>
                Payment Successful! Enrollment Complete.
              </p>
            )}
            {paymentStatus === "failed" && (
              <p style={{ color: "#F44336", fontSize: "16px", textAlign: "center", marginTop: "20px", fontWeight: "600" }}>
                Payment Failed. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
