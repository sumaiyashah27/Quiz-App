import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const StudentResult = () => {
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [testSchedules, setTestSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPercentage = (score, questionSet) => {
    if (!questionSet) return 0;
    return ((score / questionSet) * 100).toFixed(2);
  };

  const getGradeStatus = (percentage) => {
    if (percentage > 90) {
      return 'AAA: Exceptional Performance';
    } else if (percentage >= 80) {
      return 'AA: Outstanding Effort';
    } else if (percentage >= 70) {
      return 'BBB: Passed with Confidence';
    } else if (percentage >= 60) {
      return 'BB: Borderline Safe';
    } else if (percentage >= 50) {
      return 'C: Needs Improvement';
    } else {
      return 'D: Reassess and Rebuild';
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />;
      case 'Scheduled':
        return <FontAwesomeIcon icon={faClock} style={{ color: 'orange' }} />;
      case 'Delayed':
        return <FontAwesomeIcon icon={faExclamationCircle} style={{ color: 'red' }} />;
      default:
        return null;
    }
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUsers();
  }, []);

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
  };

  const fetchTestSchedules = async () => {
    if (!userId) {
      setError('Please select a valid user');
      return;
    }

    setTestSchedules([]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scheduleTest/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test schedules');
      }
      const data = await response.json();

      if (data.length === 0) {
        setError('No test schedules found for this student.');
      } else {
        setTestSchedules(data);
      }
    } catch (error) {
      setError('No test schedules found for this student.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
        Select User to View Test Schedules
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <select
          style={{
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '1px solid #ddd',
            width: '250px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }}
          value={userId}
          onChange={handleUserIdChange}
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        <button
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#C80D18',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }}
          onClick={fetchTestSchedules}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#100B5C')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#C80D18')}
        >
          See Result
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', fontSize: '1rem', color: '#C80D18', marginTop: '20px' }}>Loading...</div>}
      {error && <div style={{ textAlign: 'center', fontSize: '1rem', color: '#C80D18', marginTop: '20px' }}>{error}</div>}

      {testSchedules.length === 0 && !loading && !error && (
        <div style={{ textAlign: 'center', fontSize: '1rem', color: '#C80D18', marginTop: '20px' }}>
          No test schedules found for this student.
        </div>
      )}

      {testSchedules.length > 0 && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            textAlign: 'center',
            border: '1px solid #4CAF50', // Green color for borders
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#100B5C', color: '#fff', borderBottom: '2px solid #4CAF50' }}>
              <th style={{ borderRight: '1px solid #4CAF50' }}>Course</th>
              <th style={{ borderRight: '1px solid #4CAF50' }}>Subject</th>
              <th style={{ borderRight: '1px solid #4CAF50' }}>Date</th>
              <th style={{ borderRight: '1px solid #4CAF50' }}>Time</th>
              <th style={{ borderRight: '1px solid #4CAF50' }}>Status</th>
              {/** Conditionally render the columns if the status is not "Scheduled" */}
              {testSchedules[0]?.testStatus !== 'Scheduled' && (
                <>
                  <th style={{ borderRight: '1px solid #4CAF50' }}>Score</th>
                  <th style={{ borderRight: '1px solid #4CAF50' }}>%</th>
                  <th>Grade</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {testSchedules.map((schedule) => {
              const percentage = getPercentage(schedule.score, schedule.questionSet);
              const isScheduled = schedule.testStatus === 'Scheduled';
              return (
                <tr key={schedule._id} style={{ backgroundColor: '#f4f4f4', borderBottom: '1px solid #4CAF50' }}>
                  <td style={{ borderRight: '1px solid #4CAF50', fontSize: '0.9rem' }}>
                    {schedule.selectedCourse?.name}
                  </td>
                  <td style={{ borderRight: '1px solid #4CAF50', fontSize: '0.9rem' }}>
                    {schedule.selectedSubject?.name}
                  </td>
                  <td style={{ borderRight: '1px solid #4CAF50' }}>{formatDate(schedule.testDate)}</td>
                  <td style={{ borderRight: '1px solid #4CAF50' }}>{schedule.testTime}</td>
                  <td>{renderStatusIcon(schedule.testStatus)}</td>
                  {/* <td style={{ borderRight: '1px solid #4CAF50' }}>{schedule.testStatus}</td> */}
                  {!isScheduled && (
                    <>
                      <td style={{ borderRight: '1px solid #4CAF50' }}>
                        {schedule.score}/{schedule.questionSet}
                      </td>
                      <td style={{ borderRight: '1px solid #4CAF50' }}>{percentage}%</td>
                      <td>{getGradeStatus(percentage)}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentResult;
