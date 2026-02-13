import { LineData } from "api/AstarteAPIClient";
import { Row, Col, Card } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

interface DashboardStatsProps {
  data: LineData[];
  activeLinesCount: number;
}

const DashboardStats = ({ data, activeLinesCount }: DashboardStatsProps) => {
  let ok = 0;
  let ko = 0;
  let totalMs = 0;
  let validCycles = 0;

  data.forEach((item: LineData) => {
    if (item.quality === true) ok++;
    else if (item.quality === false) ko++;

    const start = new Date(item.cycleStartTime).getTime();
    const end = new Date(item.cycleEndTime).getTime();

    if (!isNaN(start) && !isNaN(end) && end > start) {
      totalMs += end - start;
      validCycles++;
    }
  });

  const total = ok + ko;
  const rate = total > 0 ? ((ok / total) * 100).toFixed(1) : "0.0";
  const avg =
    validCycles > 0 ? (totalMs / validCycles / 1000).toFixed(1) : "0.0";

  return (
    <Card className="shadow-sm border-0 mt-3 p-3">
      <Card.Body className="p-0">
        <Row className="text-center align-items-center g-0">
          <Col>
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.totalPieces"
                defaultMessage="Total Pieces"
              />
            </small>
            <div className="h3 fw-bold mb-0">{total}</div>
          </Col>

          <Col className="border-start">
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.qualityOk"
                defaultMessage="Quality OK"
              />
            </small>
            <div className="h3 fw-bold mb-0 text-success">{ok}</div>
          </Col>

          <Col className="border-start">
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.qualityKo"
                defaultMessage="Quality KO"
              />
            </small>
            <div className="h3 fw-bold mb-0 text-danger">{ko}</div>
          </Col>

          <Col className="border-start">
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.qualityRate"
                defaultMessage="Quality Rate"
              />
            </small>
            <div className="h3 fw-bold mb-0">{rate}%</div>
          </Col>

          <Col className="border-start">
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.avgCycleTime"
                defaultMessage="Avg Cycle Time"
              />
            </small>
            <div className="h3 fw-bold mb-0">{avg}s</div>
          </Col>

          <Col className="border-start">
            <small
              className="text-muted d-block text-uppercase fw-semibold"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              <FormattedMessage
                id="components.DashboardStats.activeLines"
                defaultMessage="Active Lines"
              />
            </small>
            <div className="h3 fw-bold mb-0 text-primary">
              {activeLinesCount}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DashboardStats;
