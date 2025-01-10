import React, { useState, useEffect } from 'react';

const StudentResult = ({ userId }) => { // Accept userId as a prop
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch completed tests when the component mounts
    const fetchCompletedTests = async () => {
      try {
        // Make sure to use the correct API URL (check your backend URL)
        const response = await fetch(`/api/scheduleTest/completedTests?userId=${userId}`);  // Pass userId as a query parameter

        if (!response.ok) {
          throw new Error('Failed to fetch completed tests');
        }

        const data = await response.json();
        setResults(data);
        setLoading(false);  // Update loading state once data is fetched
      } catch (err) {
        setError('Error fetching completed tests');
        setLoading(false);  // Stop loading on error
        console.error(err);
      }
    };

    fetchCompletedTests();  // Call fetch function
  }, [userId]); // Add userId to the dependency array

  if (loading) return <div>Loading...</div>;  // Display loading state
  if (error) return <div>{error}</div>;  // Display error message if fetch fails

  return (
    <div>
      <h3>Student Results</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Student Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Course</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Subject</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Test Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Test Time</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((result, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.userId.firstName} {result.userId.lastName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.selectedCourse.courseName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.selectedSubject.subjectName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(result.testDate).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.testTime}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '8px' }}>No results available</td>
 </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentResult;