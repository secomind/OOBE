import { Container, Row, Col } from "react-bootstrap";
import video from "../assets/videos/SECOCompanyMovie2025.webm";

const LocalVideoPlayer: React.FC = () => {
  return (
    <Container
      fluid
      className="bg-black vh-100 d-flex align-items-center justify-content-center p-0"
    >
      <Row className="w-100 m-0">
        <Col xs={12} md={11} lg={10} className="mx-auto">
          <div className="ratio ratio-16x9 shadow-lg border border-secondary border-opacity-25 rounded">
            <video
              controls
              loop
              preload="metadata"
              className="w-100 h-100 rounded"
            >
              <source src={video} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LocalVideoPlayer;
