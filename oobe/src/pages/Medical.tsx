import { Container, Image, Col, Button, Nav } from "react-bootstrap";
import "./Medical.scss";
import CardComponent from "../components/CardComponent";
import { cardiology, logo, settingsEthernet, warning } from "../assets/images";
import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FaceRecognitionModal from "../components/FaceRecognitionModal";
import { useState } from "react";
import type { APIClient } from "../api/APIClient";

interface MedicalProps {
  apiClient: APIClient;
}

const Medical = ({ apiClient }: MedicalProps) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <Container fluid className="medical-container p-3">
      <Col xs={2} sm={6} md="auto" className="back-button-medical">
        <NavLink to="/demo" className="nav-link">
          <Button className="close-icon-button text-white btn-dark">
            <FontAwesomeIcon icon={faAngleLeft} className="text-white" />
          </Button>
        </NavLink>
      </Col>
      <Image src={logo} alt="SECO Logo" fluid className="medical-logo" />

      <div>
        <h1 className="medical-title">
          <FormattedMessage
            id="pages.general.title"
            defaultMessage="What would you like to do?"
          />
        </h1>

        <h3 className="medical-desc">
          <FormattedMessage
            id="pages.general.desc"
            defaultMessage="Choose one of the options below to get started."
          />
        </h3>
      </div>

      <div className="cards-wrapper-medical">
        <Col>
          <Nav.Link
            as="button"
            onClick={() => setShowModal(true)}
            className="modal-nav-link"
          >
            <CardComponent
              icon={cardiology}
              title={
                <FormattedMessage
                  id="pages.Medical.smartClinicalRecord.title"
                  defaultMessage="Smart Clinical Record"
                />
              }
              description={
                <FormattedMessage
                  id="pages.Medical.smartClinicalRecord.desc"
                  defaultMessage="Access patient data and request info and updates."
                />
              }
            />
          </Nav.Link>
        </Col>

        <FaceRecognitionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          url="/smart-clinical"
          apiClient={apiClient}
        />

        <Col>
          <NavLink to="/medical-alert-management" className="nav-link">
            <CardComponent
              icon={warning}
              title={
                <FormattedMessage
                  id="pages.general.alertManagement.title"
                  defaultMessage="Alert Management"
                />
              }
              description={
                <FormattedMessage
                  id="pages.general.alertManagement.desc"
                  defaultMessage="View and resolve machine alerts."
                />
              }
            />
          </NavLink>
        </Col>

        <Col>
          <NavLink to="/sample-integrity-check" className="nav-link">
            <CardComponent
              icon={settingsEthernet}
              title={
                <FormattedMessage
                  id="pages.Medical.check.title"
                  defaultMessage="Sample Integrity Check"
                />
              }
              description={
                <FormattedMessage
                  id="pages.Medical.check.desc"
                  defaultMessage="Detect defects and verify sample integrity."
                />
              }
            />
          </NavLink>
        </Col>
      </div>
    </Container>
  );
};

export default Medical;
