import { Container, Image, Col, Button } from "react-bootstrap";
import "./IndustrialAutomation.scss";
import CardComponent from "../components/CardComponent";
import { logo, settingsEthernet, warehouse, warning } from "../assets/images";
import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IndustrialAutomation = () => {
  return (
    <Container fluid className="industrial-container p-3">
      <Col xs={2} sm={6} md="auto" className="back-button-industrial">
        <NavLink to="/demo" className="nav-link">
          <Button className="close-icon-button text-white btn-dark">
            <FontAwesomeIcon icon={faAngleLeft} className="text-white" />
          </Button>
        </NavLink>
      </Col>

      <Image src={logo} alt="SECO Logo" fluid className="industrial-logo" />

      <div>
        <h1 className="industrial-title">
          <FormattedMessage
            id="pages.general.title"
            defaultMessage="What would you like to do?"
          />
        </h1>

        <h3 className="industrial-desc">
          <FormattedMessage
            id="pages.general.desc"
            defaultMessage="Choose one of the options below to get started."
          />
        </h3>
      </div>

      <div className="cards-wrapper">
        <Col>
          <CardComponent
            icon={warehouse}
            title={
              <FormattedMessage
                id="pages.IndustrialAutomation.plant.title"
                defaultMessage="Plant Management"
              />
            }
            description={
              <FormattedMessage
                id="pages.IndustrialAutomation.plant.desc"
                defaultMessage="Get reports and insights as the plant manager."
              />
            }
          />
        </Col>

        <Col>
          <NavLink to="/industrial-alert-management" className="nav-link">
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
          <NavLink to="/quality-inspection" className="nav-link">
            <CardComponent
              icon={settingsEthernet}
              title={
                <FormattedMessage
                  id="pages.IndustrialAutomation.qualityInspection.title"
                  defaultMessage="Quality Inspection"
                />
              }
              description={
                <FormattedMessage
                  id="pages.IndustrialAutomation.qualityInspection.desc"
                  defaultMessage="Inspect objects and analyze their faults and conformity."
                />
              }
            />
          </NavLink>
        </Col>
      </div>
    </Container>
  );
};

export default IndustrialAutomation;
