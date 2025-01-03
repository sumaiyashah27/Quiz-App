import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faFlag  } from '@fortawesome/free-solid-svg-icons';
import 'jspdf-autotable';

const Test = () => {
  const location = useLocation();
  const { userId, userName, userEmail, selectedCourse, selectedSubject } = location.state || {};
  const [courseName, setCourseName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [questionSet, setQuestionSet] = useState(null);
  const [quizquestionSet, setQuizQuestionSet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsFetched, setQuestionsFetched] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Your test is loading... Please wait.");
  const navigate = useNavigate();
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [timer, setTimer] = useState(600);
  const savedCountdown = localStorage.getItem('countdownTime');
  const initialCountdown = savedCountdown ? parseInt(savedCountdown, 10) : 30;
  const savedExamStarted = localStorage.getItem('examStarted') === 'true';
  const [countdown, setCountdown] = useState(initialCountdown);
  const [examStarted, setExamStarted] = useState(savedExamStarted);
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
          const fetchedQuestionSet = response.data.questionSet;
          setQuestionSet(fetchedQuestionSet);
          //setQuestionSet(response.data.questionSet);
          fetchCourseName();
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
      axios.get(`/api/subjects/${selectedSubject}/questions`)
        .then((response) => {
          setQuizQuestionSet(response.data.slice(0, questionSet));
          setQuestionsFetched(true);
          const answers = {};
          response.data.forEach((question) => {
            answers[question._id] = question.correctAns;
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
  // Automatically start the exam once the data is ready
  useEffect(() => {
    fetchCourseName();
    fetchSubjectName();
    fetchQuestionSet();  // Fetch question set when the component mounts
  }, [fetchCourseName, fetchSubjectName, fetchQuestionSet]);

  // Handle page reload logic
  useEffect(() => {
    const savedStartTime = localStorage.getItem("startTime");
    if (savedStartTime) {
      const currentTime = Date.now();
      const elapsedTime = Math.floor((currentTime - savedStartTime) / 1000); // Time elapsed in seconds
      const remainingTime = savedCountdown - elapsedTime;
      if (remainingTime > 0) {
        setCountdown(remainingTime); // Set the remaining countdown time
      } else {
        setCountdown(0);
        setExamStarted(true); // Start the exam if countdown is over
        localStorage.setItem("examStarted", "true");
        fetchQuizQuestionSet();
      }
    } else {
      // Store the start time when countdown begins
      const currentTime = Date.now();
      localStorage.setItem("startTime", currentTime);
    }
  }, [savedCountdown]);
     
  // Countdown timer for 30 seconds
   useEffect(() => {
    if (countdown > 0) {
      const timerId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else {
      setExamStarted(true); // Start the exam when countdown reaches zero
      localStorage.setItem('examStarted', 'true');
      fetchQuizQuestionSet(); // Fetch quiz questions
      setLoadingMessage(null); // Hide loading message
      // Set timer based on course name
      if (courseName === "CFA LEVEL - 1") {
        setTimer(questionSet * 90); // 90 seconds per question
      } else {
        setTimer(questionSet * 180); // Default timer (180 seconds per question)
      }
    }
  }, [countdown, fetchQuizQuestionSet, courseName, questionSet]);

  useEffect(() => {
    // Save the countdown time in localStorage to persist across page reloads
    if (countdown > 0) {
      localStorage.setItem('countdownTime', countdown);
    }
  }, [countdown]);
 
  // Prevent page reload during the test
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const message = "Reloading the page is prohibited during the test!";
      e.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizquestionSet.length - 1) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Set A4 size
    doc.setFont("helvetica", "normal"); // Use Helvetica font
    doc.setFontSize(12);

    // Watermark properties
    const watermark = '/Assets/edumock logo.JPG'; // Replace with your watermark image path
    const watermarkWidth = 100; // Adjust the size of the watermark
    const watermarkHeight = 50;

    // Function to add watermark to the page
    const addWatermark = () => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const xPosition = (pageWidth - watermarkWidth) / 2; // Center horizontally
        const yPosition = (pageHeight - watermarkHeight) / 2; // Center vertically
        doc.addImage(watermark, 'JPEG', xPosition, yPosition, watermarkWidth, watermarkHeight, undefined, 'FAST');
    };addWatermark();
  
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
        addWatermark();
      }
  
      // Add Question Heading
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black color for headings
      doc.text(`Question ${index + 1}:`, 10, yPosition);
      yPosition += 10;
  
      // Question Text, Image, and Table
      const questionFields = [
        { text: question.questionText1, image: question.questionImage1, table: question.questionTable1 },
        { text: question.questionText2, image: question.questionImage2, table: question.questionTable2 },
        { text: question.questionText3, image: question.questionImage3, table: question.questionTable3 },
      ];
  
      questionFields.forEach(({ text, image, table }) => {
        if (text || image || table) {
          if (text) {
            doc.setFontSize(12);
            const words = text.split(' '); // Split the text into words
            let line = '';
            let yPositionIncrement = 10;
          
            for (let i = 0; i < words.length; i++) {
              line += words[i] + ' '; // Append the word to the current line
              if (line.split(' ').length > 5 || i === words.length - 1) {
                doc.text(line.trim(), 10, yPosition, { maxWidth: 180 });
                yPosition += yPositionIncrement; // Move to the next line
                line = ''; // Reset the line for the next chunk
              }
            }
          }
          if (image) {
            const imgWidth = 25;
            const imgHeight = 25;
            const imgX = (doc.internal.pageSize.width - imgWidth) / 2; // Center the image horizontally
            doc.addImage(image, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10; // Adjust yPosition after the image
          }
          if (table && table.data) {
            table.data.forEach((row) => {
              let xPosition = 10;
              row.forEach((cell) => {
                doc.rect(xPosition, yPosition, 30, 10); // Draw cell
                doc.text(String(cell), xPosition + 2, yPosition + 7); // Add text to cell
                xPosition += 30;
              });
              yPosition += 10;
            });
            yPosition += 5; // Add spacing after the table
          }
        }
      });
  
      // Options
      doc.setFontSize(14);
      doc.text("Options:", 10, yPosition);
      yPosition += 10;
  
      doc.setFontSize(12);
      Object.entries(question.options).forEach(([key, value]) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 10;
          addWatermark();
        }
        doc.text(`${key.toUpperCase()}: ${value}`, 10, yPosition);
        yPosition += 10;
      });
  
      // Selected and Correct Answers
      doc.setTextColor(0, 123, 0); // Green for selected answer
      doc.text(`Your Answer: ${selectedOptions[question._id] || 'None'}`, 10, yPosition);
      yPosition += 10;
  
      doc.setTextColor(255, 0, 0); // Red for correct answer
      doc.text(`Correct Answer: ${question.correctAns}`, 10, yPosition);
      yPosition += 10;
  
      // Explanation
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black color for heading
      doc.text("Answer Description:", 10, yPosition);
      yPosition += 10;
  
      const explanationFields = [
        { text: question.answerDescriptionText1, image: question.answerDescriptionImage1, table: question.answerDescriptionTable1 },
        { text: question.answerDescriptionText2, image: question.answerDescriptionImage2, table: question.answerDescriptionTable2 },
        { text: question.answerDescriptionText3, image: question.answerDescriptionImage3, table: question.answerDescriptionTable3 },
      ];
  
      explanationFields.forEach(({ text, image, table }) => {
        if (text || image || table) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 10;
            addWatermark();
          }
          if (text) {
            doc.setTextColor(0, 0, 0); // Default black color for explanation text
            const words = text.split(' '); // Split the text into words
            let line = '';
            let yPositionIncrement = 10;
          
            for (let i = 0; i < words.length; i++) {
              line += words[i] + ' '; // Append the word to the current line
              if (line.split(' ').length > 5 || i === words.length - 1) {
                doc.text(line.trim(), 10, yPosition, { maxWidth: 180 });
                yPosition += yPositionIncrement; // Move to the next line
                line = ''; // Reset the line for the next chunk
              }
            }
          }
          if (image) {
            const imgWidth = 25;
            const imgHeight = 25;
            const imgX = (doc.internal.pageSize.width - imgWidth) / 2;
            doc.addImage(image, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          }
          if (table && table.data) {
            table.data.forEach((row) => {
              let xPosition = 10;
              row.forEach((cell) => {
                doc.rect(xPosition, yPosition, 30, 10);
                doc.text(String(cell), xPosition + 2, yPosition + 7);
                xPosition += 30;
              });
              yPosition += 10;
            });
            yPosition += 5; // Add spacing after the table
          }
        }
      });
  
      // Add a separator line
      doc.setDrawColor(0, 0, 0);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
      yPosition += 10;
    });
  
    // Save the generated PDF
    const pdfBlob = doc.output('blob'); // Get PDF as Blob
    return pdfBlob;
    //doc.save('exam_results.pdf');
  }, [courseName, subjectName, quizquestionSet, selectedOptions]);

 // Submit quiz and calculate the score
 const handleSubmitQuiz = useCallback(() => {
  const pendingQuestions = quizquestionSet.reduce((acc, question, index) => {
    if (!selectedOptions[question._id]) {
      acc.push(index + 1); // Store question number (1-based index)
    }
    return acc;
  }, []);
  // If there are unanswered questions, show the popup
  if (pendingQuestions.length > 0) {
    setPendingQuestions(pendingQuestions);
    setShowPendingQuestionsPopup(true); // Show the popup for pending questions
    return; // Stop the submission process until the user answers pending questions
  }
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
  // Update test status to "Completed" and send the score
  axios.post('/api/scheduleTest/updateTestStatus', {userId,selectedCourse,selectedSubject,score,})
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
}, [selectedOptions, correctAnswers, generatePDF, userEmail, userId, selectedCourse, selectedSubject, navigate, visitedQuestions]);

// Countdown timer
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

// Function to format time in hours, minutes, and seconds
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

const handleGoToQuestion = (questionIndex) => {
  setCurrentQuestionIndex(questionIndex - 1); // Convert to 0-based index
  setShowPopup(false);
};

const handleClosePopup = () => {
  setShowPopup(false);
};

// Popup Component
const UnansweredQuestionsPopup = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%', position: 'relative' }}>
      <h2 style={{ textAlign: 'center' }}>Not Visited Questions</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {unansweredQuestions.map((questionNumber) => (
          <button key={questionNumber} onClick={() => handleGoToQuestion(questionNumber)} style={{ backgroundColor: '#8CC63E', color: 'white', border: 'none', padding: '5px', fontSize: '14px', borderRadius: '5px', cursor: 'pointer', flex: '0 0 20%', display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
            Q {questionNumber}
          </button>
        ))}
      </div>
      <button onClick={handleClosePopup} style={{ backgroundColor: 'transparent', color: '#000', border: 'none', padding: '8px 16px', fontSize: '20px', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </div>
);
// Function to handle flagging the current question
const handleFlagQuestion = () => {
  const unansweredQuestions = quizquestionSet.reduce((acc, question, index) => {
    if (!selectedOptions[question._id] && !visitedQuestions.has(index)) {
      acc.push(index + 1); // Store question number (1-based index)
    }
    return acc;
  }, []);

  if (unansweredQuestions.length > 0) {
    // Show popup with unanswered questions
    setUnansweredQuestions(unansweredQuestions);
    setShowPopup(true);
    return; // Exit the function
  }
};
// Function to navigate to the selected question
const handleQuestionSelect = (index) => {
  setCurrentQuestionIndex(index - 1); // Set the index based on the selected question number (1-based index)
  setShowPendingQuestionsPopup(false); // Close the popup when a question is selected
};
const [pendingQuestions, setPendingQuestions] = useState([]);
const [showPendingQuestionsPopup, setShowPendingQuestionsPopup] = useState(false);
const [isSubmitClicked, setIsSubmitClicked] = useState(false);
// Popup to display unanswered questions
const PendingQuestionsPopup = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%', position: 'relative' }}>
      <h2 style={{ textAlign: 'center' }}>Unanswered Questions</h2>
       {/* Show error message if unanswered questions exist */}
       {pendingQuestions.length > 0 ? (
        <p style={{ color: 'red', textAlign: 'center' }}>
          You must answer all questions before submitting the test.
        </p>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {pendingQuestions.map((questionNumber) => (
          <button key={questionNumber} onClick={() => handleQuestionSelect(questionNumber)} style={{ backgroundColor: '#8CC63E', color: 'white', border: 'none', padding: '5px', fontSize: '14px', borderRadius: '5px', cursor: 'pointer', flex: '0 0 20%', display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
            Q {questionNumber}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {/* Button to attend questions */}
        <button onClick={() => {handleQuestionSelect(pendingQuestions[0]);setShowPendingQuestionsPopup(false);}}
          style={{ backgroundColor: '#8CC63E', color: 'white', padding: '10px', fontSize: '14px', borderRadius: '5px', cursor: 'pointer', width: '48%' }}
        >Attend Questions
        </button>
        {/* Button to submit test */}
        <button
          onClick={() => {setIsSubmitClicked(true); handleSubmitQuiz();}}
          style={{ backgroundColor: '#f44336', color: 'white', padding: '10px', fontSize: '14px', borderRadius: '5px', cursor: 'pointer', width: '48%' }}
        >Submit Test
        </button>
      </div>
      <button onClick={() => setShowPendingQuestionsPopup(false)} style={{ backgroundColor: 'transparent', color: '#000', border: 'none', padding: '8px 16px', fontSize: '20px', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </div>
);
// Handle beforeunload event
useEffect(() => {
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // Show confirmation dialog
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);


  return (
    <div className="quiz-container" style={{ margin: '0 auto', maxWidth: '900px', padding: '20px' }}>
      {/* <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px' }} >Quiz Test</h1> */}
      {!examStarted ? (
        <div>
          {/* <p>User ID: {userId}</p>
          <p>User Name: {userName}</p>
          <p>User Email: {userEmail}</p>
          <p>Course: {courseName || 'Loading...'}</p>
          <p>Subject: {subjectName || 'Loading...'}</p>
          <p>QuestionSet: {questionSet}</p> */}
          {loadingMessage && <p style={{ color: 'blue', textAlign: 'center' }}>{loadingMessage}</p>}
          {countdown > 0 && <p style={{ color: 'orange', textAlign: 'center' }}>Starting in {countdown} seconds...</p>}
        </div>
      ) : (
        <>
          {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
          {loading && <p>Loading questions...</p>}
          {questionsFetched && !quizSubmitted && (
            <div  style={{ display: 'flex', gap: '5px', width: '100%', height: '80vh', margin: 'auto', padding: '10px', flexDirection: 'column', backgroundColor: '#4c4c4c' , boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' , overflow: 'hidden',}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '10px', textAlign: 'left', color: '#fff', fontSize: '20px' }}>{`Question ${currentQuestionIndex + 1}`}</h3>
                <p style={{ marginBottom: '10px', textAlign: 'center', color: '#fff', fontSize: '16px' }}>Time Left: {formatTime(timer)}</p>
                <button onClick={handleSubmitQuiz} style={{ padding: '10px 20px', backgroundColor: '#fff8dd', color: '#333', border: 'none', cursor: 'pointer', borderRadius: '5px' ,fontSize: '16px' }} >
                  Finish Test
                </button>
              </div>
              {/* Combined Box for Left and Right Side Panels */}
              <div className="quiz-container" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden'}}>
                {/* Left Side Panel with Question Numbers */}
                <div className="question-list" style={{ backgroundColor: '#fff', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', maxHeight: '800px', overflowY: 'auto' , fontSize: '16px' }}>
                  {quizquestionSet.map((_, index) => (
                    <button key={index} onClick={() => setCurrentQuestionIndex(index)} className={currentQuestionIndex === index ? 'active' : ''}style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '5px', border: 'none', backgroundColor:'#8CC63E', color:'#fff', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', position: 'relative', }}>
                      {`Q${index + 1}`}
                      {currentQuestionIndex === index && (
                        <span style={{ position: 'absolute', top: '50%', right: '-10px', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '10px solid #8CC63E', fontSize: '16px'}}></span>
                      )}
                    </button>
                  ))}
                </div>
                {/* Right Side Panel with Current Question */}
                <div className="question-panel" style={{ flex: '3', backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',height: '100%',overflowY: 'auto' , fontSize: '16px' }}>
                  {/* Question Text */}
                  {quizquestionSet[currentQuestionIndex].questionText1 && (
                    <h5 style={{ color: '#333' , fontSize: '16px' }}>{`Q${currentQuestionIndex + 1} : ${quizquestionSet[currentQuestionIndex].questionText1}`}</h5>
                  )}
                  {/* Question Image */}
                  {quizquestionSet[currentQuestionIndex].questionImage1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <img src={quizquestionSet[currentQuestionIndex].questionImage1} alt={`Question ${currentQuestionIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}/>
                    </div>
                  )}
                  {/* Question Table */}
                  {quizquestionSet[currentQuestionIndex].questionTable1 && Array.isArray(quizquestionSet[currentQuestionIndex].questionTable1.data) && quizquestionSet[currentQuestionIndex].questionTable1.data.length > 0 && (
                    <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                      <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: '14px', margin: '0 auto' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                            {quizquestionSet[currentQuestionIndex].questionTable1.data[0].map((header, index) => (
                              <th key={index} style={{ padding: '6px 10px', border: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {quizquestionSet[currentQuestionIndex].questionTable1.data.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '14px' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Second Set: Text, Image, Table */}
                  {quizquestionSet[currentQuestionIndex].questionText2 && (
                    <h5 style={{ color: '#333', fontSize: '16px' }}>{`${quizquestionSet[currentQuestionIndex].questionText2}`}</h5>
                  )}
                  
                  {quizquestionSet[currentQuestionIndex].questionImage2 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <img src={quizquestionSet[currentQuestionIndex].questionImage2} alt={`Question ${currentQuestionIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}/>
                    </div>
                  )}

                  {quizquestionSet[currentQuestionIndex].questionTable2 && Array.isArray(quizquestionSet[currentQuestionIndex].questionTable2.data) && quizquestionSet[currentQuestionIndex].questionTable2.data.length > 0 && (
                    <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                      <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: '14px', margin: '0 auto' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                            {quizquestionSet[currentQuestionIndex].questionTable2.data[0].map((header, index) => (
                              <th key={index} style={{ padding: '6px 10px', border: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {quizquestionSet[currentQuestionIndex].questionTable2.data.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '14px' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Third Set: Text, Image, Table */}
                  {quizquestionSet[currentQuestionIndex].questionText3 && (
                    <h5 style={{ color: '#333' , fontSize: '16px'}}>{`${quizquestionSet[currentQuestionIndex].questionText3}`}</h5>
                  )}
                  
                  {quizquestionSet[currentQuestionIndex].questionImage3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <img src={quizquestionSet[currentQuestionIndex].questionImage3} alt={`Question ${currentQuestionIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}/>
                    </div>
                  )}

                  {quizquestionSet[currentQuestionIndex].questionTable3 && Array.isArray(quizquestionSet[currentQuestionIndex].questionTable3.data) && quizquestionSet[currentQuestionIndex].questionTable3.data.length > 0 && (
                    <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                      <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: '14px', margin: '0 auto' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                            {quizquestionSet[currentQuestionIndex].questionTable3.data[0].map((header, index) => (
                              <th key={index} style={{ padding: '6px 10px', border: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {quizquestionSet[currentQuestionIndex].questionTable3.data.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '14px' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="options" style={{ marginTop: '20px' }}>
                    {Object.keys(quizquestionSet[currentQuestionIndex].options).map((key, index) => {
                      // Only render the option if it has a value
                      if (quizquestionSet[currentQuestionIndex].options[key]) {
                        return (
                          <label key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer', marginRight: '10px' , fontSize: '16px'}}>
                            <input  type="radio"  name={`question-${currentQuestionIndex}`}  value={key}  style={{ display: 'none', fontSize: '16px' }} 
                              checked={selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key}
                              onChange={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [quizquestionSet[currentQuestionIndex]._id]: key,
                                }))
                              }
                            />
                            {/* Display the label (A:, B:, etc.) outside the square box */}
                            <span style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '16px' }}>
                              {String.fromCharCode(65 + index)} 
                            </span>
                            {/* Display the option text inside a square box with a fixed width */}
                            <span style={{ display: 'inline-block', padding: '10px 20px', width: '500px', border: `2px solid ${selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key ? '#4CAF50' : '#ccc'}`,  backgroundColor: '#fff', color: '#333', textAlign: 'left', fontWeight: 'bold',wordWrap: 'break-word',whiteSpace: 'normal', fontSize: '16px',
                                ...(selectedOptions[quizquestionSet[currentQuestionIndex]._id] === key && {borderWidth: '4px',
                                }),
                              }}
                            >
                              {quizquestionSet[currentQuestionIndex].options[key]} {/* Display only the option data */}
                            </span>

                          </label>
                        );
                      }
                      return null; // If the option has no data, do not render it
                    })}
                  </div>
                </div>
              </div>
              {showPopup && <UnansweredQuestionsPopup />}
              {showPendingQuestionsPopup && <PendingQuestionsPopup />}
              <div className="navigation-buttons" style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {currentQuestionIndex === quizquestionSet.length - 1 && (
                  <button onClick={handleSubmitQuiz} style={{  padding: '10px 20px', backgroundColor: '#fff8dd', color: '#333', border: 'none', cursor: 'pointer', borderRadius: '5px', fontSize: '16px' }}>
                    Submit Quiz
                  </button>
                )}
                {/* Flag Button */}
                {!quizquestionSet.every((_, index) => visitedQuestions.has(index)) && (
                  <button onClick={handleFlagQuestion} style={{ color: '#fff', background: '#8cc63e', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faFlag} style={{ fontSize: '20px', marginRight: '8px' }} />
                  </button>
                )}
                {currentQuestionIndex > 0 && (
                  <button onClick={handlePrevQuestion} style={{ color:'#fff', background: '#8cc63e', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center'  }} disabled={currentQuestionIndex === 0}> <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '20px', marginRight: '8px' }} /> Back</button>
                )}
                {currentQuestionIndex < quizquestionSet.length - 1 && (
                  <button onClick={handleNextQuestion} style={{ color:'#fff', background: '#8cc63e', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }} disabled={currentQuestionIndex === quizquestionSet.length - 1}> Next <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '20px', marginLeft: '8px' }} /></button>
                )}
              </div>
            </div>
          )}
        </>
      )};
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