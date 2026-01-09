import { Container, Col } from "react-bootstrap";
import "./TestingTool.scss";
import CardComponent from "../components/CardComponent";
import { gradient, hd, playCircle } from "../assets/images";
import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";

const TestingTool = () => {
  return (
    <Container
      fluid
      className="tool-container min-vh-100 d-flex flex-column p-3"
    >
      <h1 className="tool-title">
        <FormattedMessage
          id="pages.TestingTool.title"
          defaultMessage="Testing Tools"
        />
      </h1>

      <div className="cards-wrapper">
        <Col>
          <NavLink to="/rgb-pattern-test-tool" className="nav-link">
            <CardComponent
              icon={gradient}
              title={
                <FormattedMessage
                  id="pages.TestingTool.rgbPattern"
                  defaultMessage="RGB pattern"
                />
              }
            />
          </NavLink>
        </Col>

        <Col>
          <NavLink to="/high-resolution-visuals" className="nav-link">
            <CardComponent
              icon={hd}
              title={
                <FormattedMessage
                  id="pages.TestingTool.highResolution"
                  defaultMessage="High-resolution visuals"
                />
              }
            />
          </NavLink>
        </Col>

        <Col>
          <NavLink to="/video-player" className="nav-link">
            <CardComponent
              icon={playCircle}
              title={
                <FormattedMessage
                  id="pages.TestingTool.videoPlayer"
                  defaultMessage="Video player"
                />
              }
            />
          </NavLink>
        </Col>
      </div>
    </Container>
  );
};

export default TestingTool;
