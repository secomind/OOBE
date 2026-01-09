import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Nav, Container, Row, Col, Image, Collapse } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./Sidebar.scss";
import { logo } from "../assets/images";

const Sidebar = () => {
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
