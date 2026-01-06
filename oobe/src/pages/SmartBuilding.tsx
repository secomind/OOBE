import { Container, Image, Col, Button } from "react-bootstrap";
import "./SmartBuilding.scss";
import CardComponent from "../components/CardComponent";
import { falling, interactiveSpace, logo, warning } from "../assets/images";
import { FormattedMessage } from "react-intl";
import "./SmartAlertManagement";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const SmartBuilding = () => {
  return (
    <Container fluid className="smartBuilding-container p-3">
      <Col xs={2} sm={6} md="auto" className="back-button-smart">
        <NavLink to="/demo" className="nav-link">
          <Button className="close-icon-button text-white btn-dark">
            <FontAwesomeIcon icon={faAngleLeft} className="text-white" />
          </Button>
        </NavLink>
      </Col>
      <Image src={logo} alt="SECO Logo" fluid className="smartBuilding-logo" />

      <div>
        <h1 className="smartBuilding-title">
          <FormattedMessage
            id="pages.general.title"
            defaultMessage="What would you like to do?"
          />
        </h1>

        <h3 className="smartBuilding-desc">
          <FormattedMessage
            id="pages.general.desc"
            defaultMessage="Choose one of the options below to get started."
          />
        </h3>
      </div>

      <div className="cards-wrapper-smartBuilding">
        <Col>
          <NavLink to="/smart-loby" className="nav-link">
            <CardComponent
              icon={interactiveSpace}
              title={
                <FormattedMessage
                  id="pages.SmartBuilding.smartLobby.title"
                  defaultMessage="Smart Lobby"
                />
              }
              description={
                <FormattedMessage
                  id="pages.SmartBuilding.smartLobby.desc"
                  defaultMessage="Recognize residents and access condo info."
                />
              }
            />
          </NavLink>
        </Col>

        <Col>
          <NavLink to="/smart-alert-management" className="nav-link">
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
          <CardComponent
            icon={falling}
            title={
              <FormattedMessage
                id="pages.SmartBuilding.detection.title"
                defaultMessage="Crowd and fall detection"
              />
            }
            description={
              <FormattedMessage
                id="pages.SmartBuilding.detection.desc"
                defaultMessage="Count people and detect falls in common areas."
              />
            }
          />
        </Col>
      </div>
    </Container>
  );
};

export default SmartBuilding;
