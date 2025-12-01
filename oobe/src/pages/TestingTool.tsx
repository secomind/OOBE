import { Container } from "react-bootstrap";
import "./TestingTool.scss";
import CardComponent from "../components/CardComponent";
import { gradient, hd, playCircle, touchLong, openJam } from "../assets/images";
import { FormattedMessage } from "react-intl";

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
        <CardComponent
          icon={gradient}
          title={
            <FormattedMessage
              id="pages.TestingTool.rgbPattern"
              defaultMessage="RGB pattern"
            />
          }
        />

        <CardComponent
          icon={hd}
          title={
            <FormattedMessage
              id="pages.TestingTool.highResolution"
              defaultMessage="High-resolution visuals"
            />
          }
        />

        <CardComponent
          icon={playCircle}
          title={
            <FormattedMessage
              id="pages.TestingTool.videoPlayer"
              defaultMessage="Video player"
            />
          }
        />

        <CardComponent
          icon={touchLong}
          title={
            <FormattedMessage
              id="pages.TestingTool.multitouch"
              defaultMessage="Multitouch capabilities"
            />
          }
        />

        <CardComponent
          icon={openJam}
          title={
            <FormattedMessage
              id="pages.TestingTool.easyTransfer"
              defaultMessage="Easy Image/Video transfer"
            />
          }
        />
      </div>
    </Container>
  );
};

export default TestingTool;
