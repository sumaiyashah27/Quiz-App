// import React, { useState, useEffect, useCallback } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import jsPDF from 'jspdf';

// const StartExam = () => {
//     const location = useLocation();
//     const { userId, userName, userEmail, selectedCourse, selectedSubject, quizquestionSet = [] } = location.state || {};  // Get quiz question set from state
//     const [questions, setQuestions] = useState(quizquestionSet);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
  
//     // Fetch quiz question set if not passed as state
//     const fetchQuizQuestionSet = useCallback(() => {
//         if (selectedSubject) {
//             setLoading(true);
//             axios.get(`/api/subjects/${selectedSubject}/questions`)
//                 .then((response) => {
//                     setQuestions(response.data);
//                     setLoading(false);
//                 })
//                 .catch((error) => {
//                     console.error('Error fetching quiz questions:', error);
//                     setLoading(false);
//                     setError('Failed to load quiz questions');
//                 });
//         }
//     }, [selectedSubject]);

//     // Use effect to fetch data if quizquestionSet is not passed
//     useEffect(() => {
//         if (quizquestionSet.length === 0) {
//             fetchQuizQuestionSet();
//         }
//     }, [quizquestionSet, fetchQuizQuestionSet]);

//     return (
//         <div className="quiz-container" style={{ fontFamily: 'Arial, sans-serif', margin: '0 auto', maxWidth: '900px', padding: '20px' }}>
//             {/* <h1 style={{ textAlign: 'center', color: '#4CAF50', fontSize: '2rem', marginBottom: '20px' }}>Start Exam</h1>
//             <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '20px', marginBottom: '20px' }}>
//                 <p>User ID: {userId}</p>
//                 <p>User Name: {userName}</p>
//                 <p>User Email: {userEmail}</p>
//                 <p>Course: {selectedCourse}</p>
//                 <p>Subject: {selectedSubject}</p>
//             </div> */}

//             {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}

//             {loading ? <p>Loading questions...</p> : (
//                 <div>
//                     {/* Render your quiz questions here */}
//                     { questionsFetched && !quizSubmitted && (
//           <div className="quiz-content" style={{ display: 'flex', gap: '20px', maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
//             {/* Left Side Panel with Question Numbers */}
//             <div className="question-list" style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', maxHeight: '500px', overflowY: 'auto' }}>
//               <h2 style={{ marginBottom: '10px', textAlign: 'center', color: '#333' }}>Questions</h2>
//               <p>Time Left: {timer} seconds</p>
//               {quizquestionSet.map((_, index) => (
//                 <button key={index} onClick={() => setCurrentQuestionIndex(index)} className={currentQuestionIndex === index ? 'active' : ''} style={{ display: 'block', width: '100%', padding: '8px 10px', marginBottom: '5px', border: 'none', backgroundColor: currentQuestionIndex === index ? '#4CAF50' : '#fff', color: currentQuestionIndex === index ? '#fff' : '#333', cursor: 'pointer', borderRadius: '4px', textAlign: 'center' }}>
//                   {`Q${index + 1}`}
//                 </button>
//               ))}
//             </div>
  
//             {/* Right Side Panel with Current Question */}
//             <div className="question-panel" style={{ flex: '3', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }} >
//               <h5 style={{ color: '#333' }} >{`Q${currentQuestionIndex + 1}: ${quizquestionSet[currentQuestionIndex].question}`}</h5>
//               {/* Display question image if it exists */}
//               {quizquestionSet[currentQuestionIndex].questionImage && (
//                 <img src={quizquestionSet[currentQuestionIndex].questionImage}
//                   alt={`Question ${currentQuestionIndex + 1}`} style={{ maxWidth: '100%', marginTop: '10px' }}
//                 />
//               )}
//               <div className="options" style={{ marginTop: '20px' }}>
//                 {Object.keys(quizquestionSet[currentQuestionIndex].options).map((key) => (
//                   <label key={key} style={{ display: 'block', marginBottom: '10px' }}>
//                     <input type="radio" name={`question-${currentQuestionIndex}`} value={key} style={{ marginRight: '10px' }}
//                       checked={selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key}
//                       onChange={() =>
//                         setSelectedOptions((prev) => ({
//                           ...prev,
//                           [quizquestionSet[currentQuestionIndex]._id]: key,
//                         }))
//                       }
//                     />
//                     {key}: {quizquestionSet[currentQuestionIndex].options[key]}
//                   </label>
//                 ))}
//               </div>
  
//               <div className="navigation-buttons" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
//                 <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>Back</button>
//                 <button onClick={handleNextQuestion} disabled={currentQuestionIndex === quizquestionSet.length - 1}>Next</button>
//               </div>
  
//               {currentQuestionIndex === quizquestionSet.length - 1 && (
//                 <button onClick={handleSubmitQuiz} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Submit Quiz</button>
//               )}
//             </div>
//           </div>
//         )}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default StartExam;
