import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Nav,
  Container,
  Row,
  Col,
  Button,
  Image,
  Collapse,
} from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./Sidebar.scss";
import { logo } from "../assets/images";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>

      <div className={`sidebar-menu ${open ? "open" : ""}`}>
        <Collapse in={open}>
          <div className="sidebar-content">
            <Container className="text-center mb-5">
              <Row>
                <Col>
                  <Image src={logo} alt="Logo" fluid className="sidebar-logo" />
                </Col>
              </Row>
            </Container>

            <Nav className="sidebar-nav flex-column mt-5">
              <NavLink
                to="/dashboard"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <FormattedMessage
                  id="components.Sidebar.dashboard"
                  defaultMessage="Dashboard"
                />
              </NavLink>
              <NavLink
                to="/demo"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <FormattedMessage
                  id="components.Sidebar.demo"
                  defaultMessage="Demo app"
                />
              </NavLink>
              <NavLink
                to="/tool"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <FormattedMessage
                  id="components.Sidebar.tool"
                  defaultMessage="Testing tool"
                />
              </NavLink>
            </Nav>

            <Container fluid className="sidebar-bottom mt-4">
              <Row className="mb-1">
                <hr className="text-light" />
              </Row>
              <Row className="w-100">
                <Col>
                  <Button
                    variant="light"
                    className="px-3 mx-1 w-100"
                    onClick={() => {
                      navigate("/hub");
                      setOpen(false);
                    }}
                  >
                    App Hub
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="outline-light"
                    className="px-2 mx-1 w-100"
                    onClick={() => {
                      navigate("/developer");
                      setOpen(false);
                    }}
                  >
                    Dev Center
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        </Collapse>
      </div>
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
