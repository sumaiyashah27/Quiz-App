import React, { useState } from "react";
import { Container, Row, Col, Button, Carousel, Badge, Modal } from "react-bootstrap";

const videos = [
  { id: 1, title: "CFA Level 1 2025 Fast Track Book", videoUrl: "https://www.youtube.com/embed/qRg6xGoIQrk?si=jUupkPL0SJWYq27X" },
  { id: 2, title: "CFA Level 2 Batch for May 2025", videoUrl: "https://www.youtube.com/embed/0GYt-WjrlL0?si=9h9lLiLxe5p_jm0l" },
  { id: 3, title: "Quantitative Methods R7", videoUrl: "https://www.youtube.com/embed/_fMRsQu14t0?si=zkr5ngyTKGC4fgFR" },
  { id: 4, title: "CFA Level 1 Results", videoUrl: "https://www.youtube.com/embed/qi8432vGy5Q?si=fJAm0NB1NL56k4fc" },
  { id: 5, title: "Top 10 Questions", videoUrl: "https://www.youtube.com/embed/pZk1OEh70E4?si=wBkr8YjqIIT4C6Ci" },
  { id: 6, title: "CFA Level 2 Batch for May 2025", videoUrl: "https://www.youtube.com/embed/kZtyUD8krKM?si=daQZM1h-G6aF4TkV" },
  { id: 7, title: "Financial Statement Analysis R3", videoUrl: "https://www.youtube.com/embed/ACoI95h5g_k?si=i1EXQXCl4mA3urLD" },
  { id: 8, title: "CFA Level 1 Fast Track Revision", videoUrl: "https://www.youtube.com/embed/ul7kbzDSUDc?si=DbCApdIFhIMelIwB" },
];

const VideoSection = () => {
  const [isAllVisible, setIsAllVisible] = useState(false); // State to toggle video visibility

  const toggleVideos = () => {
    setIsAllVisible(!isAllVisible);
  };

  return (
    <Container className="mt-4" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "3px" }}>
      {/* Video Section */}
      <h2 className="text-start fs-5" style={{ backgroundColor: "#100b5c", color: "#fff", padding: "20px" }}>
        VIDEO LIBRARY
      </h2>
      <div className="d-none d-md-block">
        {/* For Larger Screens */}
        <Row>
          {videos
            .slice(0, isAllVisible ? videos.length : 6)
            .map((video, index) => (
              <Col md={4} className="mb-4" key={video.id}>
                <div className="card h-100 shadow-md position-relative" style={{ border: "none" }}>
                  {index < 2 && (
                    <Badge
                      bg="danger"
                      className="position-absolute"
                      style={{
                        top: "10px",
                        right: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      Latest
                    </Badge>
                  )}
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "200px",
                      borderTopLeftRadius: "5px",
                      borderTopRightRadius: "5px",
                    }}
                  ></iframe>
                  <div className="card-body">
                    <h6 className="card-title">{video.title}</h6>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
        <div className="text-center">
          <Button variant="primary" onClick={toggleVideos}>
            {isAllVisible ? "Show Less" : "Load More"}
          </Button>
        </div>
      </div>
      <div className="d-block d-md-none">
        {/* For Smaller Screens */}
        <Carousel>
          {videos.map((video, index) => (
            <Carousel.Item key={video.id}>
              <iframe
                src={video.videoUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "200px",
                }}
              ></iframe>
              <Carousel.Caption>
                <h6 className="text-light bg-dark p-2">{video.title}</h6>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </Container>
  );
};

export default VideoSection;
