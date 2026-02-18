import { useEffect, useState } from "react";
import { Container, Row, Col, Image, Collapse, Button } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./AlarmResolvingSidebar.scss";
import { logo, padlockLocked, padlockUnlocked } from "../assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

interface AlarmResolvingSidebarProps {
  show: boolean;
  onHide: () => void;
}

const AlarmResolvingSidebar = ({
  show,
  onHide,
}: AlarmResolvingSidebarProps) => {
  const [status, setStatus] = useState("notAuthenticated");

  useEffect(() => {
    if (show) {
      if (status === "notAuthenticated") {
        const authenticationTimer = setTimeout(() => {
          setStatus("authenticated");
        }, 3000);
        return () => clearTimeout(authenticationTimer);
      } else if (status === "authenticated") {
        const alarmCheckingTimer = setTimeout(() => {
          setStatus("alarmResolvingInstructions");
        }, 6000);
        return () => clearTimeout(alarmCheckingTimer);
      } else if (status === "alarmCheck") {
        const alarmResolvedTimer = setTimeout(() => {
          setStatus("alarmResolved");
        }, 9000);
        return () => clearTimeout(alarmResolvedTimer);
      }
    }
  }, [show, status]);

  return (
    <>
      <Collapse in={show}>
        <div className={`alarm-resolving-sidebar ${show ? "open" : ""}`}>
          <Button
            variant="link"
            className="close-button p-0"
            onClick={() => {
              onHide();
              setStatus("notAuthenticated");
            }}
          >
            <FontAwesomeIcon icon={faX} size="lg" />
          </Button>
          <Container fluid className="d-flex flex-column align-items-center">
            <Row className="mb-5">
              <Col>
                <Image src={logo} alt="SECO Logo" className="logo mt-3" />
              </Col>
            </Row>
            <Row className="mt-5">
              <Col>
                <h2 className="text-center mt-5 ">
                  {status === "notAuthenticated" ? (
                    <FormattedMessage
                      id="alarmResolvingSidebar.notAuthenticatedUser"
                      defaultMessage="Access required"
                    />
                  ) : status === "authenticated" ? (
                    <FormattedMessage
                      id="alarmResolvingSidebar.authenticatingUser"
                      defaultMessage="Authorization confirmed"
                    />
                  ) : status === "alarmResolvingInstructions" ? (
                    <FormattedMessage
                      id="alarmResolvingSidebar.alarmCheckInstructions"
                      defaultMessage="Welcome"
                    />
                  ) : status === "alarmCheck" ? (
                    <FormattedMessage
                      id="alarmResolvingSidebar.checkingAlarm"
                      defaultMessage="Checking, please wait"
                    />
                  ) : (
                    <FormattedMessage
                      id="alarmResolvingSidebar.alarmResolved"
                      defaultMessage="Alarm solved"
                    />
                  )}
                </h2>
              </Col>
            </Row>
            {status !== "alarmCheck" && status !== "alarmResolved" && (
              <Row>
                <Col>
                  <h5 className="text-center mt-3">
                    {status === "notAuthenticated" ? (
                      <FormattedMessage
                        id="alarmResolvingSidebar.tenantRecognized"
                        defaultMessage="Waiting for authorized technician identification"
                      />
                    ) : status === "authenticated" ? (
                      <FormattedMessage
                        id="alarmResolvingSidebar.checkingPermissions"
                        defaultMessage="Authorized technician successfully recognized."
                      />
                    ) : (
                      <FormattedMessage
                        id="alarmResolvingSidebar.resolvingAlarmInstructions"
                        defaultMessage="You are authorized to resolve this alert. I’m sending you the instructions."
                      />
                    )}
                  </h5>
                </Col>
              </Row>
            )}
            {status === "alarmResolvingInstructions" && (
              <Row>
                <Col>
                  <h5 className="text-center mt-3">
                    <FormattedMessage
                      id="alarmResolvingSidebar.resolvingAlarmInstructions"
                      defaultMessage="Once performed the necessary actions, press the button below to verify that the problem is resolved."
                    />
                  </h5>
                </Col>
              </Row>
            )}
            {(status === "notAuthenticated" || status === "authenticated") && (
              <Row>
                <Col>
                  <img
                    src={
                      status === "authenticated"
                        ? padlockUnlocked
                        : padlockLocked
                    }
                    alt="Padlock"
                    className="padlock-logo mt-5 mb-5"
                  />
                </Col>
              </Row>
            )}
            {status === "alarmCheck" && (
              <Row className="mt-5">
                <Col>
                  <div className="spinner-border mb-5 spinner" role="status" />
                </Col>
              </Row>
            )}
            {status === "alarmResolvingInstructions" && (
              <Row className="mt-auto mb-4">
                <Col className="d-flex justify-content-center ">
                  <Button
                    variant="light"
                    className="check-alarm-button"
                    onClick={() => {
                      setStatus("alarmCheck");
                    }}
                  >
                    <FormattedMessage
                      id="alarmResolvingSidebar.verifyResolutionButton"
                      defaultMessage="Check if solved"
                    />
                  </Button>
                </Col>
              </Row>
            )}
          </Container>
        </div>
      </Collapse>
    </>
  );
};

export default AlarmResolvingSidebar;
