import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserFriends, faFileAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [totalDelayedQuizzes, setTotalDelayedQuizzes] = useState(0);
  const [userIcon, setUserIcon] = useState(faUsers); // Default to a single user icon

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userResponse = await axios.get('/api/users/admin/total-users');
        setTotalUsers(userResponse.data.totalUsers);

        const enrollmentResponse = await axios.get('/api/quizenroll/admin/total-enrollments');
        setTotalEnrollments(enrollmentResponse.data.totalEnrollments);

        const delayedQuizResponse = await axios.get(''); // Add correct API
        setTotalDelayedQuizzes(delayedQuizResponse.data.totalDelayedQuizzes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();

    // Change the user icon every 2 seconds with rotation effect
    const interval = setInterval(() => {
      setUserIcon(prevIcon => (prevIcon === faUsers ? faUserFriends : faUsers)); // Toggle between 1 and 2 users
    }, 2000);

    return () => clearInterval(interval); // Clear interval when component unmounts
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '40px' }}>Dashboard</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', flexWrap: 'wrap', overflowY: 'hidden' }}>
        {/* Students */}
        <div style={{ background: 'linear-gradient(145deg, #6a1b9a, #9c27b0)', color: 'white', padding: '25px', borderRadius: '15px', textAlign: 'center', width: '220px', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', margin: '10px', cursor: 'pointer', flex: '1 1 250px' }}>
          <FontAwesomeIcon icon={userIcon} style={{ fontSize: '40px', marginBottom: '10px', animation: 'rotateIcon 2s ease-in-out infinite' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Students</h3>
          <p style={{ fontSize: '26px', fontWeight: 'bold' }}>{totalUsers}</p>
        </div>

        {/* Quiz Enrollments */}
        <div style={{ background: 'linear-gradient(145deg, #0288d1, #03a9f4)', color: 'white', padding: '25px', borderRadius: '15px', textAlign: 'center', width: '220px', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', margin: '10px', cursor: 'pointer', flex: '1 1 250px' }}>
          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '40px', marginBottom: '10px', animation: 'moveLine 1s linear infinite, bounce 1s ease-in-out infinite' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Quiz Enrollments</h3>
          <p style={{ fontSize: '26px', fontWeight: 'bold' }}>{totalEnrollments}</p>
        </div>

        {/* Delayed Quizzes */}
        <div style={{ background: 'linear-gradient(145deg, #f57c00, #ff9800)', color: 'white', padding: '25px', borderRadius: '15px', textAlign: 'center', width: '220px', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', margin: '10px', cursor: 'pointer', flex: '1 1 250px' }}>
          <FontAwesomeIcon icon={faClock} style={{ fontSize: '40px', marginBottom: '10px', animation: 'rotate 1s linear infinite' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Delayed Quizzes</h3>
          <p style={{ fontSize: '26px', fontWeight: 'bold' }}>{totalDelayedQuizzes}</p>
        </div>
      </div>

      <style>{`

        /* Icon Animations */
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        @keyframes bounce {
          0% { transform: translateY(0); }
          25% { transform: translateY(-5px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes moveLine {
          0% { content: " "; }
          25% { content: "|"; }
          50% { content: "||"; }
          75% { content: "|||"; }
          100% { content: "|"; }
        }

        /* Back to front effect */
        @keyframes rotateIcon {
          0% { transform: rotateY(-180deg); }
          100% { transform: rotateY(180deg); } /* Flipping the icon */
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
