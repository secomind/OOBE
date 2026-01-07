import { Col, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./DemoApp.scss";
import CardComponent from "../components/CardComponent";
import { corporateFare, factory, vitalSigns } from "../assets/images";
import { FormattedMessage } from "react-intl";
import { useEffect, useState } from "react";

const DemoApp = () => {
  const [time, setTime] = useState("");

  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
  };

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container
      fluid
      className="demo-container min-vh-100 d-flex flex-column p-3"
    >
      <Col xs={12} className="d-flex flex-column align-items-center ">
        <div className="clock-container">{time}</div>
        <h2 className="demo-title fw-bold text-center mt-2">
          <FormattedMessage
            id="pages.DemoApp.title"
            defaultMessage="Demo apps"
          />
        </h2>
      </Col>
      <div className="cards-wrapper">
        <NavLink to="/smart-building" className="nav-link">
          <CardComponent
            icon={corporateFare}
            title={
              <FormattedMessage
                id="pages.DemoApp.smartBuilding.title"
                defaultMessage="Smart Building"
              />
            }
            description={
              <FormattedMessage
                id="pages.DemoApp.smartBuilding.desc"
                defaultMessage="Control building systems and detect {br} issues in real time"
                values={{ br: <br /> }}
              />
            }
          />
        </NavLink>

        <NavLink to="/medical" className="nav-link">
          <CardComponent
            icon={vitalSigns}
            title={
              <FormattedMessage
                id="pages.DemoApp.medical.title"
                defaultMessage="Medical"
              />
            }
            description={
              <FormattedMessage
                id="pages.DemoApp.medical.desc"
                defaultMessage="Monitor machines and resolve alerts in {br} the factory"
                values={{ br: <br /> }}
              />
            }
          />
        </NavLink>

        <NavLink to="/industrial" className="nav-link">
          <CardComponent
            icon={factory}
            title={
              <FormattedMessage
                id="pages.DemoApp.industrialAutomation.title"
                defaultMessage="Industrial Automation"
              />
            }
            description={
              <FormattedMessage
                id="pages.DemoApp.industrialAutomation.desc"
                defaultMessage="Monitor machines and resolve alerts in {br} the factory"
                values={{ br: <br /> }}
              />
            }
          />
        </NavLink>
      </div>
    </Container>
  );
};

export default DemoApp;
