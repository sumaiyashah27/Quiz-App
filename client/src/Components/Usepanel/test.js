import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faFlag  } from '@fortawesome/free-solid-svg-icons';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Test = () => {
  const location = useLocation();
  const { userId, userName, userEmail, selectedCourse, selectedSubject } = location.state || {};
  const [courseName, setCourseName] = useState('');
  const [modalOpen, setModalOpen] = useState(false); // Modal state
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
  const navigate = useNavigate();
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [timer, setTimer] = useState(600);
  const [showButton, setShowButton] = useState(true); // State to control button visibility
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Start a 30-second timer to hide the button
    const timer = setTimeout(() => {
      setShowButton(false);
      setTimeoutReached(true); // Set timeoutReached to true after 30 seconds
    }, 30000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);
   
  // Fetch course name
  const fetchCourseName = useCallback(() => {
    if (selectedCourse) {
      axios.get(`/api/courses/${selectedCourse}`)
        .then((response) => {
          setCourseName(response.data.name);
        })
        .catch((error) => {
          console.error('Error fetching course:', error);
          console.error('Failed to load course');
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
          toast.error('Error fetching subject:', error);
          toast.error('Failed to load subject');
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
          toast.error('Error fetching question set:', error);
          setLoading(false);
          toast.error('Failed to load question set');
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
          toast.error('Error fetching quiz questions:', error);
          setLoading(false);
          toast.error('Failed to load quiz questions');
        });
    }
  }, [selectedSubject, questionSet]);
  // Automatically start the exam once the data is ready
  useEffect(() => {
    fetchCourseName();
    fetchSubjectName();
    fetchQuestionSet();  // Fetch question set when the component mounts
  }, [fetchCourseName, fetchSubjectName, fetchQuestionSet]);
  
   // Handle opening the popup and fetch chapters
   const handleEnterRoom = () => {
    setIsEnterRoomClicked(true); 
    setQuizStarted(true);
    setModalOpen(true);
    if (selectedSubject) {
      // Set the timer based on the course name
      if (courseName === "CFA LEVEL - 1") {
        setTimer(questionSet * 90); // 90 seconds per question
      } else if (courseName) {
        setTimer(questionSet * 180); // Default timer (180 seconds per question)
      }
      fetchQuizQuestionSet();  // Fetch chapters after opening the modal
    }
  };
 
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
  //sign the selected option to the question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizquestionSet.length - 1) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
// Function to handle the previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const watermarkLogoPath = 'https://edumocks.com/edulog-2.png';
    const logoWidth = 40;
    const logoHeight = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const addPageContent = (isFirstPage = false) => {
        // Draw page border
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        if (isFirstPage) {
            // Add header logo
            const logoPath = 'https://edumocks.com/edulog-2.png';
            doc.addImage(logoPath, 'PNG', 10, 10, logoWidth, logoHeight);

            // Add title
            doc.setFontSize(16);
            doc.setTextColor(0, 123, 255);
            doc.text('Test Results', pageWidth / 2, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
        }

        // Add watermark
        if (doc.setGState) {
            doc.setGState(new doc.GState({ opacity: 0.1 }));
            doc.addImage(watermarkLogoPath, 'PNG', pageWidth / 4, pageHeight / 4, logoWidth * 2, logoHeight * 2);
            doc.setGState(new doc.GState({ opacity: 1 }));
        } else {
            doc.addImage(watermarkLogoPath, 'PNG', pageWidth / 4, pageHeight / 4, logoWidth * 2, logoHeight * 2);
        }
    };

    addPageContent(true);

    let yPosition = 40;

    // Add course and subject info
    if (courseName) doc.text(`Course: ${courseName}`, 10, yPosition);
    if (subjectName) doc.text(`Subject: ${subjectName}`, 10, yPosition + 10);
    yPosition += 20;

    quizquestionSet.forEach((question, index) => {
        if (yPosition > 270) {
            doc.addPage();
            addPageContent();
            yPosition = 10;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Question ${index + 1}:`, 10, yPosition);
        yPosition += 10;

        const questionFields = [
            { text: question.questionText1, image: question.questionImage1, table: question.questionTable1 },
            { text: question.questionText2, image: question.questionImage2, table: question.questionTable2 },
            { text: question.questionText3, image: question.questionImage3, table: question.questionTable3 },
        ];

        questionFields.forEach(({ text, image, table }) => {
            if (text) {
                const words = text.split(' ');
                let line = '';
                const maxWidth = pageWidth - 20;

                words.forEach((word, i) => {
                    line += `${word} `;
                    if (doc.getTextWidth(line) > maxWidth || i === words.length - 1) {
                        doc.text(line.trim(), 10, yPosition);
                        yPosition += 10;
                        line = '';
                    }
                });
            }

            if (image) {
                const imgWidth = 25;
                const imgHeight = 25;
                const imgX = (pageWidth - imgWidth) / 2;
                doc.addImage(image, 'PNG', imgX, yPosition, imgWidth, imgHeight);
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
                yPosition += 5;
            }
        });

        if (question.options) {
            doc.setFontSize(12);
            doc.text('Options:', 10, yPosition);
            yPosition += 10;

            Object.entries(question.options).forEach(([key, value]) => {
                if (yPosition > 270) {
                    doc.addPage();
                    addPageContent();
                    yPosition = 10;
                }
                doc.text(`${key.toUpperCase()}: ${value}`, 10, yPosition);
                yPosition += 10;
            });
        }

        if (selectedOptions[question._id]) {
            doc.setTextColor(0, 123, 0);
            doc.text(`Your Answer: ${selectedOptions[question._id]}`, 10, yPosition);
            yPosition += 10;
        }

        if (question.correctAns) {
            doc.setTextColor(255, 0, 0);
            doc.text(`Correct Answer: ${question.correctAns}`, 10, yPosition);
            yPosition += 10;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Answer Description:', 10, yPosition);
        yPosition += 10;

        const explanationFields = [
            { text: question.answerDescriptionText1, image: question.answerDescriptionImage1, table: question.answerDescriptionTable1 },
            { text: question.answerDescriptionText2, image: question.answerDescriptionImage2, table: question.answerDescriptionTable2 },
            { text: question.answerDescriptionText3, image: question.answerDescriptionImage3, table: question.answerDescriptionTable3 },
        ];

        explanationFields.forEach(({ text, image, table }) => {
            if (text) {
                const words = text.split(' ');
                let line = '';
                const maxWidth = pageWidth - 20;

                words.forEach((word, i) => {
                    line += `${word} `;
                    if (doc.getTextWidth(line) > maxWidth || i === words.length - 1) {
                        doc.text(line.trim(), 10, yPosition);
                        yPosition += 10;
                        line = '';
                    }
                });
            }

            if (image) {
                const imgWidth = 25;
                const imgHeight = 25;
                const imgX = (pageWidth - imgWidth) / 2;
                doc.addImage(image, 'PNG', imgX, yPosition, imgWidth, imgHeight);
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
                yPosition += 5;
            }
        });

        // Separator
        doc.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 10;
    });

    const pdfBlob = doc.output('blob');
    return pdfBlob;
}, [courseName, subjectName, quizquestionSet, selectedOptions]);


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
  const formData = new FormData();
  formData.append('userEmail', userEmail);
  formData.append('pdf', pdfBlob); // Assuming you have the PDF as a blob

  // Send the email with the PDF attachment
  axios.post('/api/quizResults/sendQuizResults', formData)
    .then((response) => {
      toast.success('Email sent successfully:', response);
    })
    .catch((error) => {
      toast.error('Error sending email:', error);
    });

  // Update test status and score in the database
  axios.post('/api/scheduleTest/updateTestStatus', {
    userId,
    selectedCourse,
    selectedSubject,
    score, 
    status: "Completed",  // Assuming 'Completed' is the status after submission
  })
  .then((response) => {
    toast.success('Test updated successfully:', response.data);
  })
  .catch((error) => {
    toast.error('Error updating test:', error);
  });

  navigate('/user-panel');
}, [selectedOptions, correctAnswers, generatePDF, userEmail, userId, selectedCourse, selectedSubject, navigate]);

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
          onClick={() => {handleSubmitQuiz();}}
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
const handleFinishTest = () => {
  const unansweredQuestions = quizquestionSet.reduce((acc, question, index) => {
    if (!selectedOptions[question._id] && !visitedQuestions.has(index)) {
      acc.push(index + 1); // Store question number (1-based index)
    }
    return acc;
  }, []);

  if (unansweredQuestions.length > 0) {
    setPendingQuestions(unansweredQuestions);
    setShowPendingQuestionsPopup(true); // Show popup
  } else {
    setIsSubmitClicked(true);
    handleSubmitQuiz();
  }
};
// Handle beforeunload event
useEffect(() => {
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = 'your time is not resert '; // Show confirmation dialog
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);
const [isEnterRoomClicked, setIsEnterRoomClicked] = useState(false);
const isQuestionAnswered = (index) => {
  return !!selectedOptions[quizquestionSet[index]._id];
};
const [quizStarted, setQuizStarted] = useState(false);
useEffect(() => {
  // Retrieve the timer value from localStorage (if available)
  const savedTimer = localStorage.getItem('quizTimer');
  if (savedTimer) {
    setTimer(parseInt(savedTimer, 10)); // Set the timer to the saved value
  }

  // Only set up the interval when the quiz is started
  if (quizStarted) {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTime = prevTimer - 1;
        localStorage.setItem('quizTimer', newTime); // Save the updated timer to localStorage
        return newTime;
      });
    }, 1000);

    // Cleanup interval on component unmount or when the quiz ends
    return () => clearInterval(interval);
  }
}, [quizStarted]);

  return (
    <div className="quiz-container" style={{ margin: '0 auto', maxWidth: '900px', padding: '20px' }}>
      <ToastContainer />
      {/* <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px' }} >Quiz Test</h1> */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', marginBottom: '50px' }}>
          {/* <p>User ID: {userId}</p>
          <p>User Name: {userName}</p>
          <p>User Email: {userEmail}</p>
          <p>Course: {courseName || 'Loading...'}</p>
          <p>Subject: {subjectName || 'Loading...'}</p>
          <p>QuestionSet: {questionSet}</p> */}
          {/* <button onClick={handleEnterRoom}>Enter Room</button> */}
          {!isEnterRoomClicked && (
            <button  onClick={handleEnterRoom} style={{ padding: '10px 20px',  backgroundColor: '#8CC63E',  color: '#fff',  border: 'none',  cursor: 'pointer',  borderRadius: '5px',  fontSize: '16px', }}>
              Enter Room
            </button>
          )}
          {/* {loadingMessage && <p style={{ color: 'blue', textAlign: 'center' }}>{loadingMessage}</p>}
          {countdown > 0 && <p style={{ color: 'orange', textAlign: 'center' }}>Starting in {countdown} seconds...</p>} */}
        </div>
      
        <>
          {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
          {/* {loadingMessage && <p style={{ color: 'blue', textAlign: 'center' }}>{loadingMessage}</p>}
          {countdown > 0 && <p style={{ color: 'orange', textAlign: 'center' }}>Starting in {countdown} seconds...</p>} */}
          {modalOpen && questionsFetched && !quizSubmitted && (
            <div  style={{ display: 'flex', gap: '5px', width: '100%', height: '100vh', margin: 'auto', padding: '10px', flexDirection: 'column', backgroundColor: '#4c4c4c' , boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' , overflow: 'hidden',}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '10px', textAlign: 'left', color: '#fff', fontSize: '20px' }}>{`Question ${currentQuestionIndex + 1}`}</h3>
                <p style={{ marginBottom: '10px', textAlign: 'center', color: '#fff', fontSize: '16px' }}>Time Left: {formatTime(timer)}</p>
                <button onClick={handleFinishTest} style={{ padding: '10px 20px', backgroundColor: '#fff8dd', color: '#333', border: 'none', cursor: 'pointer', borderRadius: '5px' ,fontSize: '16px' }} >
                  Finish Test
                </button>
              </div>
              {/* Combined Box for Left and Right Side Panels */}
              <div className="quiz-container" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden'}}>
                {/* Left Side Panel with Question Numbers */}
                <div className="question-list" style={{ backgroundColor: '#fff', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', maxHeight: '800px', overflowY: 'auto' , fontSize: '16px' }}>
                  {quizquestionSet.map((_, index) => (
                    <button key={index} onClick={() => setCurrentQuestionIndex(index)} className={currentQuestionIndex === index ? 'active' : ''}style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '5px', border: 'none', backgroundColor: isQuestionAnswered(index) ? '#ccc' : '#8CC63E', color:'#fff', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', position: 'relative', }}>
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
              {showPendingQuestionsPopup && (
                <PendingQuestionsPopup 
                  pendingQuestions={pendingQuestions} 
                  onClose={() => setShowPendingQuestionsPopup(false)} 
                />
              )}
              {/* {showPendingQuestionsPopup && <PendingQuestionsPopup />} */}
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