import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const location = useLocation();
  const { userId, userName, userEmail, selectedCourse, selectedSubject } = location.state || {};
  const [courseName, setCourseName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [questionSet, setQuestionSet] = useState(null);  // For test schedule questions
  const [quizquestionSet, setQuizQuestionSet] = useState([]);  // For quiz questions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsFetched, setQuestionsFetched] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // To track current question
  const [selectedOptions, setSelectedOptions] = useState({}); // To store selected answers
  const [timer, setTimer] = useState(600);  // 10 minutes timer (in seconds)
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);  // Store the score after submission
  const [correctAnswers, setCorrectAnswers] = useState({});  // Store the correct answers
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const navigate = useNavigate(); 

  // Fetch course name
  const fetchCourseName = useCallback(() => {
    if (selectedCourse) {
      axios.get(`/api/courses/${selectedCourse}`)
        .then((response) => {
          setCourseName(response.data.name);
        })
        .catch((error) => {
          console.error('Error fetching course:', error);
          setError('Failed to load course');
        });
    }
  }, [selectedCourse]);

  // Fetch subject name
  const fetchSubjectName = useCallback(() => {
    if (selectedSubject) {
      axios.get(`/api/subjects/${selectedSubject}`)
        .then((response) => {
          setSubjectName(response.data.name);
        })
        .catch((error) => {
          console.error('Error fetching subject:', error);
          setError('Failed to load subject');
        });
    }
  }, [selectedSubject]);

  // Fetch question set for the test (used when the page loads)
  const fetchQuestionSet = useCallback(() => {
    if (userId && selectedCourse && selectedSubject) {
      setLoading(true);
      axios.get(`/api/scheduleTest?userId=${userId}&selectedCourse=${selectedCourse}&selectedSubject=${selectedSubject}`)
        .then((response) => {
          setQuestionSet(response.data.questionSet);  // Store the question set for the test
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching question set:', error);
          setLoading(false);
          setError('Failed to load question set');
        });
    }
  }, [userId, selectedCourse, selectedSubject]);

  // Fetch quiz question set for the selected subject (triggered when entering the room)
  const fetchQuizQuestionSet = useCallback(() => {
    if (selectedSubject) {
      setLoading(true);
      axios.get(`/api/subjects/${selectedSubject}/questions`)  // Endpoint to get questions for the selected subject
        .then((response) => {
          setQuizQuestionSet(response.data.slice(0, questionSet));  // Limit quiz questions to match questionSet length
          setQuestionsFetched(true);

          // Set the correct answers (assuming response has a correctAnswer property)
          const answers = {};
          response.data.forEach((question) => {
            answers[question._id] = question.correctAns; // Assuming correctAnswer contains the correct option key
          });
          setCorrectAnswers(answers);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching quiz questions:', error);
          setLoading(false);
          setError('Failed to load quiz questions');
        });
    }
  }, [selectedSubject, questionSet]);

  // Generate PDF of quiz results including questions, options, selected answers, and explanations
  const generatePDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Set A4 size
    doc.setFont("helvetica", "normal"); // Use Helvetica font
    doc.setFontSize(12);

    // Title section
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255); // Blue for title
    doc.text('Test Results', 105, 20, { align: 'center' }); // Title at the top center
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset text color to black

    // Basic Info Section
    doc.text(`Course: ${courseName}`, 10, 40);
    doc.text(`Subject: ${subjectName}`, 10, 50);

    let yPosition = 60;

    // Loop through all questions and add them to the PDF
    quizquestionSet.forEach((question, index) => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 10;
        }

        // Add Question Number and Question Text (with wrapping for long text)
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black color for question text
        doc.text(`Q${index + 1}: ${question.question}`, 10, yPosition, { maxWidth: 180 });
        yPosition += 10;

        // Add question image if it exists, center it
        if (question.questionImage) {
            const imgWidth = 25;
            const imgHeight = 25;
            const imgX = (doc.internal.pageSize.width - imgWidth) / 2; // Center the image horizontally
            doc.addImage(question.questionImage, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10; // Adjust yPosition after the image
        }

        // Add Options
        doc.setFontSize(12);
        Object.entries(question.options).forEach(([key, value]) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 10;
            }
            doc.text(`${key.toUpperCase()}: ${value}`, 10, yPosition);
            yPosition += 10;
        });

        // Add Your Answer
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 10;
        }
        doc.setTextColor(0, 123, 0); // Green for selected answer
        doc.text(`Your Answer: ${selectedOptions[question._id] || 'None'}`, 10, yPosition);
        yPosition += 10;

        // Add Correct Answer
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 10;
        }
        doc.setTextColor(255, 0, 0); // Red for correct answer
        doc.text(`Correct Answer: ${correctAnswers[question._id]}`, 10, yPosition);
        yPosition += 10;

        // Add Explanation if available
        if (question.answerDescription) {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 10;
            }
            doc.setTextColor(0, 0, 0); // Default black color for explanation
            doc.text(`Explanation: ${question.answerDescription}`, 10, yPosition, { maxWidth: 180 });
            yPosition += 10;
        }

        // Add a line to separate questions
        doc.setDrawColor(0, 0, 0); // Black color for line
        doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition); // Draw line across the page
        yPosition += 10; // Adjust position after line
    });

    // Save the generated PDF
    const pdfBlob = doc.output('blob'); // Get PDF as Blob
    return pdfBlob;
}, [courseName, subjectName, quizquestionSet, selectedOptions, correctAnswers]);  

  const handleEnterRoom = () => {
    setExamStarted(true); 
    fetchQuizQuestionSet();  // Fetch quiz questions when entering the room
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizquestionSet.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

   // Submit quiz and calculate the score
   const handleSubmitQuiz = useCallback(() => {
    setQuizSubmitted(true);

    // Calculate the score by comparing selected options to correct answers
    let score = 0;
    Object.keys(selectedOptions).forEach((questionId) => {
      if (selectedOptions[questionId] === correctAnswers[questionId]) {
        score += 1;
      }
    });
    setScore(score);
    setShowResults(true);
    // Generate PDF for the results
    const pdfBlob = generatePDF();
    // Send the generated PDF to the user's email after quiz submission
    const formData = new FormData();
    formData.append('userEmail', userEmail);
    formData.append('pdf', pdfBlob); // Assuming you have the PDF as a blob

    // Send the email with the PDF attachment
    axios.post('/api/quizResults/sendQuizResults', formData)
      .then((response) => {
        console.log('Email sent successfully:', response);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });

      // Update test status to "Completed"
    // Update test status to "Completed" and send the score
    axios.post('/api/scheduleTest/updateTestStatus', {
      userId,
      selectedCourse,
      selectedSubject,
      score, // Send the score to update in the database
    })
      .then((response) => {
        console.log('Test status and score updated successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error updating test status and score:', error);
      });

    // Update the test score in the database
    axios.post('/api/scheduleTest/updateTestScore', {
      userId,
      selectedCourse,
      selectedSubject,
      score,
    })
      .then((response) => {
        console.log('Test score updated successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error updating test score:', error);
      });
    navigate('/user-panel'); 
  }, [selectedOptions, correctAnswers, generatePDF, userEmail]);

  // Countdown timer// Timer functionality: Countdown and submit quiz when timer runs out
 useEffect(() => {
  if (timer > 0 && !quizSubmitted) {
    const interval = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(interval);
  }
  if (timer <= 0) {
    handleSubmitQuiz();
  }
}, [timer, quizSubmitted, handleSubmitQuiz]);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourseName();
    fetchSubjectName();
    fetchQuestionSet();  // Fetch question set when the component mounts
  }, [fetchCourseName, fetchSubjectName, fetchQuestionSet]);

  const handleRefreshWarning = (e) => {
    e.preventDefault();
    e.returnValue = "If you refresh the page, you will lose this exam session.";
  };

  const handleTabSwitchWarning = () => {
    alert("Switching tabs is considered cheating!");
    // Optionally, you could send this data to a server to track cheating
  };
   // Start the countdown timer
   useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime === 0) {
          clearInterval(countdown);
          handleSubmitQuiz();
          return prevTime;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  // Handle page refresh or tab switch
  useEffect(() => {
    window.addEventListener("beforeunload", handleRefreshWarning);
    window.addEventListener("focus", () => {});
    window.addEventListener("blur", handleTabSwitchWarning);

    return () => {
      window.removeEventListener("beforeunload", handleRefreshWarning);
      window.removeEventListener("blur", handleTabSwitchWarning);
    };
  }, []);

  // Redirect to user-panel if no action within 30 minutes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!examStarted) {
        navigate('/user-panel');
      }
    }, 1800000);  // 30 minutes in ms

    return () => clearTimeout(timeoutId);
  }, [examStarted, navigate]);


  return (
    <div className="quiz-container" style={{ fontFamily: 'Arial, sans-serif', margin: '0 auto', maxWidth: '900px', padding: '20px' }}>
      {/* <h1 style={{ textAlign: 'center', color: '#4CAF50', fontSize: '2rem', marginBottom: '20px' }} >Test Page</h1>
      <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '20px', marginBottom: '20px', }} >
        <p>User ID: {userId}</p>
        <p>User Name: {userName}</p>
        <p>User Email: {userEmail}</p>
        <p>Course: {courseName || 'Loading...'}</p>
        <p>Subject: {subjectName || 'Loading...'}</p>
        <p>QuestionSet: {questionSet}</p>
      </div> */}

      {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
      
      {!examStarted && (
        <div>
          <h3>Time Left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</h3>

          <button onClick={handleEnterRoom} style={{ display: 'block', margin: '0 auto 20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', }}>
            Start Exam
          </button>
        </div>
      )}
        
      {loading && <p>Loading questions...</p>}

      {questionsFetched && !quizSubmitted && (
        <div className="quiz-content" style={{ display: 'flex', gap: '20px', width: 'auto', height: 'auto', margin: 'auto', padding: '20px', flexDirection: 'column', backgroundColor: '#4c4c4c' , boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '10px', textAlign: 'left', color: '#fff' }}>{`Question ${currentQuestionIndex + 1}`}</h3>
            <p style={{ marginBottom: '10px', textAlign: 'center', color: '#fff' }}>Time Left: {timer} seconds</p>
            <button onClick={handleSubmitQuiz} style={{ padding: '10px 20px', backgroundColor: '#fff8dd', color: '#333', border: 'none', cursor: 'pointer', }} >
              Submit Quiz
            </button>
          </div>
          {/* Combined Box for Left and Right Side Panels */}
          <div className="quiz-container" style={{ display: 'flex', width: '100%', height: 'auto',}}>
            {/* Left Side Panel with Question Numbers */}
            <div className="question-list" style={{ backgroundColor: '#fff', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', maxHeight: '500px', overflowY: 'auto' }}>
              {quizquestionSet.map((_, index) => (
                <button key={index} onClick={() => setCurrentQuestionIndex(index)} className={currentQuestionIndex === index ? 'active' : ''}style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '5px', border: 'none', backgroundColor: currentQuestionIndex === index ? '#4CAF50' : '#fff', color: currentQuestionIndex === index ? '#fff' : '#333', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', position: 'relative', }}>
                  {`Q${index + 1}`}
                  {currentQuestionIndex === index && (
                    <span style={{ position: 'absolute', top: '50%', right: '-10px', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '10px solid #4CAF50',}}></span>
                  )}
                </button>
              ))}
            </div>
            {/* Right Side Panel with Current Question */}
            <div className="question-panel" style={{ flex: '3', backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <h5 style={{ color: '#333' }}>{`Q${currentQuestionIndex + 1} : ${quizquestionSet[currentQuestionIndex].question}`}</h5>
              {/* Display question image if it exists */}
              {quizquestionSet[currentQuestionIndex].questionImage && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <img src={quizquestionSet[currentQuestionIndex].questionImage} alt={`Question ${currentQuestionIndex + 1}`} style={{ maxWidth: '25%', maxHeight: '300px', objectFit: 'contain' }}/>
                </div>
              )}

              <div className="options" style={{ marginTop: '20px' }}>
                {Object.keys(quizquestionSet[currentQuestionIndex].options).map((key, index) => (
                  <label  key={key}  style={{ display: 'flex',  alignItems: 'center',  marginBottom: '10px',  cursor: 'pointer',  marginRight: '10px',}}>
                    <input type="radio" name={`question-${currentQuestionIndex}`} value={key} style={{ display: 'none' }} // Hide the default radio button checked={selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key}
                      onChange={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [quizquestionSet[currentQuestionIndex]._id]: key,
                        }))
                      }
                    />
                    {/* Display the label (A:, B:, etc.) outside the square box */}
                    <span style={{marginRight: '10px', fontWeight: 'bold',}}>
                      {String.fromCharCode(65 + index)}:
                    </span>
                    {/* Display the option text inside a square box with a fixed width */}
                    <span style={{ display: 'inline-block', padding: '10px 20px', width: '500px',  border: `2px solid ${selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key ? '#4CAF50' : '#ccc'}`,  backgroundColor: '#fff', color: '#333', textAlign: 'left', fontWeight: 'bold', wordWrap: 'break-word',  whiteSpace: 'normal',  }}>
                      {quizquestionSet[currentQuestionIndex].options[key]} {/* Display only the option data */}
                    </span>
                  </label>
                ))}
              </div>

              <div className="navigation-buttons" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>Back</button>
                <button onClick={handleNextQuestion} disabled={currentQuestionIndex === quizquestionSet.length - 1}>Next</button>
              </div>

              {currentQuestionIndex === quizquestionSet.length - 1 && (
                <button onClick={handleSubmitQuiz} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Display quiz results and allow PDF download */}
      {showResults && (
        <div>
          <h2>Your Score: {score}/{quizquestionSet.length}</h2>
          <button onClick={generatePDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
};

export default Test;