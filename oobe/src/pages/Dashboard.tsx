import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Dashboard.scss";
import { FormattedMessage } from "react-intl";
import SystemResourceUsage from "../components/SystemResourceUsage";
import Geolocalization from "../components/GeolocalizationCard";
import LogCard, { type UsageLogEntry } from "../components/LogCard";
import DeviceDetailsCard from "../components/DeviceDetails";
import type { APIClient, DashboardUpdate } from "../api/APIClient";

interface DashboardProps {
  apiClient: APIClient;
}

const Dashboard = ({ apiClient }: DashboardProps) => {
  const [time, setTime] = useState("");
  const [cpuData, setCpuData] = useState<{ x: number; y: number }[]>([]);
  const [ramData, setRamData] = useState<{ x: number; y: number }[]>([]);
  const [realTimeCpu, setRealTimeCpu] = useState(0);
  const [realTimeRam, setRealTimeRam] = useState(0);
  const [usageLogs, setUsageLogs] = useState<UsageLogEntry[]>([]);

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

  useEffect(() => {
    const temp: { cpu?: number; ram?: number } = {};

    const handleUpdate = (update: DashboardUpdate) => {
      const now = new Date();

      if (update.field === "cpuUsage") {
        setRealTimeCpu(update.value);
        setCpuData((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.cpu = update.value;
      }

      if (update.field === "ramUsage") {
        setRealTimeRam(update.value);
        setRamData((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.ram = update.value;
      }

      if (temp.cpu !== undefined && temp.ram !== undefined) {
        const entry: UsageLogEntry = {
          cpu: temp.cpu,
          ram: temp.ram,
          date: now.toLocaleDateString("en-GB"),
          time: now
            .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
            .replace(":", "."),
        };
        setUsageLogs((prev) => [entry, ...prev.slice(0, 3)]);
        temp.cpu = undefined;
        temp.ram = undefined;
      }
    };

    apiClient.connectDashboard(handleUpdate);
    return () => apiClient.disconnectDashboard();
  }, [apiClient]);

  return (
    <Container
      fluid
      className="dashboard-container bg-dark min-vh-100 d-flex flex-column p-3"
    >
      <Row className="justify-content-center flex-grow-1">
        <Col
          xs={10}
          sm={6}
          md="auto"
          className="d-flex flex-column align-items-center justify-content-center h-100"
        >
          <div className="clock-container">{time}</div>

          <h2 className="dashboard-title fw-bold text-center mt-2">
            <FormattedMessage
              id="pages.Dashboard.title"
              defaultMessage="Dashboard"
            />
          </h2>
        </Col>
      </Row>
      <Row className="gx-4 gy-4 cards-row flex-grow-1">
        <Col xs={12} md={6} lg={4} className="d-flex">
          <SystemResourceUsage
            cpuData={cpuData}
            ramData={ramData}
            realTimeCpu={realTimeCpu}
            realTimeRam={realTimeRam}
          />
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex">
          <Geolocalization />
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex flex-column gap-4">
          <LogCard usageLogs={usageLogs} />
          <DeviceDetailsCard apiClient={apiClient} />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
