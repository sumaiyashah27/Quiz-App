import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [errorMessage, setErrorMessage] = useState('');


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
      toast.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error('Error fetching courses:', error);
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
      userId: selectedUser, // Use selectedUser from state
      selectedCourse: selectedCourse,
      selectedSubject: selectedSubjects,
      paymentStatus: paymentStatus,
      paymentId: paymentId,
      amount: amount,
      order_id: orderId,
    };

    try {
      await axios.post('/api/quizenroll', enrollmentData); // Backend URL
      toast.success('User successfully enrolled for the quiz!'); // Show success message
      setErrorMessage(''); // Clear any previous error message
      // Call email API
      await axios.post('/api/enrollmail/send-enrollemail', {
        userId: selectedUser,
        selectedCourse: selectedCourse,
        selectedSubject: selectedSubjects,
      });
      toast.success('Confirmation email sent to the user!');
      setModalOpen(false);
    } catch (error) {
      toast.error("Error adding user:", error);
      toast.error('Error enrolling user. Please try again later.'); // Show error message
      setSuccessMessage(''); // Clear any previous success message
    }
  };

  return (
    <div>
      <h2>Enroll in a Quiz</h2>
      <button onClick={() => setModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#C80D18', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'background-color 0.3s ease, transform 0.3s ease', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#FFDC5C'} onMouseLeave={(e) => e.target.style.backgroundColor = '#C80D18'} onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'}>Enroll User in Quiz</button>
      {/* Modal for enrollment */}
      {modalOpen && (
        <div>
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', marginTop: '20px' }}>
            {/* User Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="user-dropdown" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Select User:</label>
              <select id="user-dropdown" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }}>
                <option value="">-- Select user --</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="course-dropdown" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Select Course:</label>
              <select id="course-dropdown" onChange={handleCourseChange} value={selectedCourse} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }}>
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>

            {/* Subjects Checkboxes */}
            {selectedCourse && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Select Subjects:</label>
                {courses.find((course) => course._id === selectedCourse)?.subjects.map((subject) => (
                  <div key={subject._id} style={{ marginBottom: '10px' }}>
                    <input type="checkbox" value={subject._id} checked={selectedSubjects.includes(subject._id)} onChange={() => handleSubjectChange(subject._id)} style={{ marginRight: '10px' }} />
                    <label>{subject.name}</label>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Status */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="paymentStatus" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Payment Status:</label>
              <select id="paymentStatus" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }}>
                <option value="">Select Payment Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payment Details */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="paymentId" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Payment ID:</label>
              <input id="paymentId" type="text" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} required={paymentStatus === 'success'} style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="amount" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Amount:</label>
              <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="orderId" style={{ display: 'block', fontSize: '16px', color: '#333', marginBottom: '8px' }}>Order ID:</label>
              <input id="orderId" type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', transition: 'border-color 0.3s' }} />
            </div>

            {/* Submit Button */}
            <button type="submit" style={{ backgroundColor: '#c80d18', color: '#fff', padding: '12px 20px', fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', transition: 'background-color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffdc5c'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c80d18'}>
              Enroll
            </button>
          </form>
          {/* {successMessage && <div style={{ color: 'green', marginTop: '10px' }}>{successMessage}</div>}
          {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>} */}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default QuizEnroll;
