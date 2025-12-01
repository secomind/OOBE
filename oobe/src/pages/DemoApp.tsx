import { Container } from "react-bootstrap";
import "./DemoApp.scss";
import CardComponent from "../components/CardComponent";
import { corporateFare, factory, vitalSigns } from "../assets/images";
import { FormattedMessage } from "react-intl";

const DemoApp = () => {
  return (
    <Container fluid className="demo-container p-3">
      <h1 className="demo-title">
        <FormattedMessage id="pages.DemoApp.title" defaultMessage="Demo Apps" />
      </h1>

      <div className="cards-wrapper">
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
              defaultMessage="Control building systems and detect issues in real time"
            />
          }
        />

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
              defaultMessage="Monitor machines and resolve alerts in the factory"
            />
          }
        />

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
              defaultMessage="Monitor machines and resolve alerts in the factory"
            />
          }
        />
      </div>
    </Container>
  );
};

export default DemoApp;
