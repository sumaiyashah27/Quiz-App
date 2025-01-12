import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentResult = () => {
  const [scheduleTests, setScheduleTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all test data
  useEffect(() => {
    const fetchScheduleTests = async () => {
      try {
        const response = await axios.get('/api/scheduleTest');
        console.log('API Response:', response.data); // Log the data here
        setScheduleTests(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch schedule test data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchScheduleTests();
  }, []);
  

  // Render loading or error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>All Users Test Results</h1>
      {scheduleTests.length === 0 ? (
        <p>No test results available.</p>
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
            {Array.isArray(scheduleTests) &&
              scheduleTests.map((test) => (
                <tr key={test._id}>
                  <td>{test.userId?.email || 'N/A'}</td>
                  <td>{test.selectedCourse || 'N/A'}</td>
                  <td>{test.selectedSubject || 'N/A'}</td>
                  <td>
                    {test.testDate
                      ? new Date(test.testDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{test.testTime || 'N/A'}</td>
                  <td>{test.testStatus || 'N/A'}</td>
                  <td>{test.score || 'N/A'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentResult;
