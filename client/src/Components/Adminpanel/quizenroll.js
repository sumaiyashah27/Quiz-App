import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Modal Component for Quiz Enrollment
const QuizEnroll = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');


  // Fetch users and courses
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSelectedSubjects([]); // Reset selected subjects when course changes
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Collecting form data from state variables
    const enrollmentData = {
      userId: selectedUser,  // Use selectedUser from state
      selectedCourse: selectedCourse,
      selectedSubject: selectedSubjects,
      paymentStatus: paymentStatus,
      paymentId: paymentId,
      amount: amount,
      order_id: orderId,
    };
  
    try {
      await axios.post('/api/quizenroll', enrollmentData); // Backend URL
      alert("User for quizenroll added successfully");
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Error adding user");
    }
  };
  
  

  return (
    <div>
      <h2>Enroll in a Quiz</h2>
      <button onClick={() => setModalOpen(true)}>Enroll User in Quiz</button>

      {/* Modal for enrollment */}
      {modalOpen && (
        <div>
          <h3>Enroll User</h3>
          <form onSubmit={handleSubmit}>
            {/* User Dropdown */}
            <div>
              <label htmlFor="user-dropdown">Select User:</label>
              <select
                id="user-dropdown"
                value={selectedUser}  // Bind to selectedUser state
                onChange={(e) => setSelectedUser(e.target.value)}  // Update state on change
                required
              >
                 <option value="">-- Select user --</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div>
              <label htmlFor="course-dropdown">Select Course:</label>
              <select
                id="course-dropdown"
                onChange={handleCourseChange}
                value={selectedCourse}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subjects Checkboxes */}
            {selectedCourse && (
              <div>
                <label>Select Subjects</label>
                {courses
                  .find((course) => course._id === selectedCourse)
                  ?.subjects.map((subject) => (
                    <div key={subject._id}>
                      <input
                        type="checkbox"
                        value={subject._id}
                        checked={selectedSubjects.includes(subject._id)}
                        onChange={() => handleSubjectChange(subject._id)}
                      />
                      <label>{subject.name}</label>
                    </div>
                  ))}
              </div>
            )}

            {/* Payment Status */}
            <div>
              <label htmlFor="paymentStatus">Payment Status:</label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                required
              >
                <option value="">Select Payment Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payment Details */}
            <div>
              <label htmlFor="paymentId">Payment ID:</label>
              <input
                id="paymentId"
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                required={paymentStatus === 'success'}
              />
            </div>
            <div>
              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="orderId">Order ID:</label>
              <input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit">Enroll</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuizEnroll;
