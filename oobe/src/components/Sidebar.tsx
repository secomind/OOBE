import { NavLink } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Button,
  Image,
} from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./Sidebar.scss";
import { logo } from "../assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  return (
    <Navbar variant="dark" className="d-flex flex-column sidebar-menu">
      <Container className="mb-4 text-center">
        <Row>
          <Col>
            <Image src={logo} alt="SECO Logo" fluid className="sidebar-logo" />
          </Col>
        </Row>
      </Container>

      <Nav className="sidebar-nav flex-column flex-grow-1 w-100 ps-3 pe-3">
        <NavLink to="/dashboard" className="nav-link">
          <FormattedMessage
            id="components.Sidebar.dashboard"
            defaultMessage="Dashboard"
          />
        </NavLink>
        <NavLink to="/hub" className="nav-link">
          <FormattedMessage
            id="components.Sidebar.applicationHub"
            defaultMessage="Application Hub"
          />
        </NavLink>
        <NavLink to="/developer" className="nav-link">
          <FormattedMessage
            id="components.Sidebar.developerCenter"
            defaultMessage="Developer Center"
          />
        </NavLink>
      </Nav>
      <hr className="border-top border-secondary w-100" />
      <Container fluid className="sidebar-bottom px-3 py-2">
        <Row className="w-100">
          <Col xs="auto">
            <Nav.Link
              as={NavLink}
              to="/logout"
              className="d-flex align-items-center exit-icon-button"
            >
              <FormattedMessage
                id="components.Sidebar.exit"
                defaultMessage="Exit"
              />
            </Nav.Link>
          </Col>
          <Col className="text-end ps-0">
            <Button className="exit-icon-button text-white btn-dark">
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="text-white"
              />
            </Button>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

export default Sidebar;
