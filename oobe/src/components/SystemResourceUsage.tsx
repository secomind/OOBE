import ReactApexChart from "react-apexcharts";
import { type ApexOptions } from "apexcharts";
import { Card, Row, Col, Badge } from "react-bootstrap";
import "./SystemResourceUsage.scss";
import { FormattedMessage } from "react-intl";

interface DataPoint {
  x: number;
  y: number;
}

export interface SystemResourceUsageProps {
  cpuData: DataPoint[];
  ramData: DataPoint[];
  realTimeCpu: number;
  realTimeRam: number;
}

const SystemResourceUsage = ({
  cpuData,
  ramData,
  realTimeCpu,
  realTimeRam,
}: SystemResourceUsageProps) => {
  const baseChartOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    stroke: { curve: "straight", width: 3 },
    grid: {
      borderColor: "gray",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#fff", fontSize: "12px" } },
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        formatter: (val) => `${val}%`,
        style: { colors: "#fff", fontSize: "12px" },
      },
    },
    tooltip: { theme: "dark", x: { format: "HH:mm:ss" } },
    legend: { show: false },
    dataLabels: { enabled: false },
    markers: { size: 0 },
  };

  return (
    <Card className="system-usage-card bg-dark rounded-5 border-secondary border-2">
      <Card.Body className="d-flex flex-column mt-2">
        <Card.Title className="fw-bold mb-4 fs-4 ms-3">
          <FormattedMessage
            id="components.SystemResourceUsage.title"
            defaultMessage="System resource usage"
          />
        </Card.Title>

        <div className="usage-section mt-5">
          <Row className="align-items-center justify-content-between mb-2">
            <Col xs="auto" className="ms-5">
              <span className="fw-semibold medium">
                <FormattedMessage
                  id="components.SystemResourceUsage.cpuUsage"
                  defaultMessage="CPU usage"
                />
              </span>
            </Col>
            <Col xs="auto" className="d-flex align-items-center gap-1 me-2">
              <Badge bg="" className="dot dot-cpu" />
              <small className="text-secondary">
                <FormattedMessage
                  id="components.SystemResourceUsage.realTimeUsage"
                  defaultMessage="real time usage: {usage}"
                  values={{ usage: realTimeCpu }}
                />
              </small>
            </Col>
          </Row>
          <ReactApexChart
            options={{ ...baseChartOptions, colors: ["#00FFAA"] }}
            series={[{ name: "CPU Usage", data: cpuData }]}
            type="line"
            height={window.innerWidth < 576 ? 200 : 285}
          />
        </div>

        <div className="usage-section">
          <Row className="align-items-center justify-content-between mb-2">
            <Col xs="auto">
              <span className="fw-semibold medium ms-5">
                <FormattedMessage
                  id="components.SystemResourceUsage.ramUsage"
                  defaultMessage="RAM usage"
                />
              </span>
            </Col>
            <Col xs="auto" className="d-flex align-items-center gap-2 me-2">
              <Badge bg="" className="dot dot-ram" />
              <small className="text-secondary">
                <FormattedMessage
                  id="components.SystemResourceUsage.realTimeUsage"
                  defaultMessage="real time usage: {usage}"
                  values={{ usage: realTimeRam }}
                />
              </small>
            </Col>
          </Row>
          <ReactApexChart
            options={{ ...baseChartOptions, colors: ["#007bff"] }}
            series={[{ name: "RAM Usage", data: ramData }]}
            type="line"
            height={window.innerWidth < 576 ? 200 : 285}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default SystemResourceUsage;
