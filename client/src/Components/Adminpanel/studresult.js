import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentResult = () => {
  const [scheduleTests, setScheduleTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchScheduleTests = async () => {
      try {
        const response = await axios.get('/api/scheduletests'); // Adjust the URL if needed
        console.log(response.data); // Log the data to check if it's an array
        setScheduleTests(response.data);
      } catch (err) {
        setError('Failed to fetch schedule test data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchScheduleTests();
  }, []);
  
  // Render the data
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Schedule Test List</h1>
      {scheduleTests.length === 0 ? (
        <p>No tests scheduled.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Course</th>
              <th>Subject</th>
              <th>Test Date</th>
              <th>Test Time</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(scheduleTests) && scheduleTests.map((test) => (
            <tr key={test._id}>
              <td>{test.userId?.email || 'N/A'}</td>
              <td>{test.selectedCourse}</td>
              <td>{test.selectedSubject}</td>
              <td>{new Date(test.testDate).toLocaleDateString()}</td>
              <td>{test.testTime}</td>
              <td>{test.testStatus}</td>
              <td>{test.score}</td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentResult;
