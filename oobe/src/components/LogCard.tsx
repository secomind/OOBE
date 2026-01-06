import { Card, Row, Col, ListGroup } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./LogCard.scss";

export type UsageLogEntry = {
  cpu: number;
  ram: number;
  date: string;
  time: string;
};

interface SystemUsageLogProps {
  usageLogs: UsageLogEntry[];
}

const SystemUsageLog = ({ usageLogs }: SystemUsageLogProps) => {
  return (
    <>
      <Card.Title className="fw-bold fs-4 mb-4">
        <FormattedMessage
          id="components.SystemUsageLog.title"
          defaultMessage="Log"
        />
      </Card.Title>

      <Card.Subtitle className="fw-semibold fs-5">
        <FormattedMessage
          id="components.SystemUsageLog.subtitle"
          defaultMessage="Usage Update"
        />
      </Card.Subtitle>

      <ListGroup variant="flush" className="flex-grow-1">
        {usageLogs.map((log, index) => (
          <ListGroup key={index} className="text-light py-3">
            <Row className="align-items-center">
              <Col xs={8}>
                <Row className="flex-column g-1">
                  <Col>
                    <Row className="g-3">
                      <Col
                        xs="auto"
                        className="d-flex align-items-center gap-2"
                      >
                        <span className="dot dot-cpu" />
                        <small className="text-secondary">
                          <FormattedMessage
                            id="components.SystemUsageLog.cpu"
                            defaultMessage={"CPU"}
                          />{" "}
                          {log.cpu}%
                        </small>
                      </Col>

                      <Col
                        xs="auto"
                        className="d-flex align-items-center gap-2"
                      >
                        <span className="dot dot-ram" />
                        <small className="text-secondary">
                          <FormattedMessage
                            id="components.SystemUsageLog.ram"
                            defaultMessage={"RAM"}
                          />{" "}
                          {log.ram}%
                        </small>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>

              <Col xs={4} className="text-end">
                <small className="text-secondary">
                  {log.date}, {log.time}
                </small>
              </Col>
            </Row>
          </ListGroup>
        ))}
      </ListGroup>
    </>
  );
};

export default SystemUsageLog;
