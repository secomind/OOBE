import { resolutionVisuals, logo } from "../assets/images";
import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import "./HighResolutionVisuals.scss";

const HighResolutionVisuals = () => {
  return (
    <Container
      fluid
      className="high-resolution-visuals-container min-vh-100 d-flex p-0"
    >
      <Row className="justify-content-center">
        <Col
          xs={2}
          sm={6}
          md="auto"
          className="d-flex flex-column align-items-center justify-content-center h-100 p-3"
        >
          <NavLink to="/tool" className="nav-link">
            <Button className="close-icon-button text-white btn-dark">
              <FontAwesomeIcon icon={faX} className="text-white" />
            </Button>
          </NavLink>
        </Col>
        <Col>
          <Image src={logo} alt="SECO Logo" fluid className="logo" />
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col className="text-center">
          <img src={resolutionVisuals} alt="icon" className="vh-100 vw-100" />
        </Col>
      </Row>
    </Container>
  );
};

export default HighResolutionVisuals;
