import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import "./Dashboard.scss";
import { FormattedMessage } from "react-intl";
import SystemResourceUsage from "../components/SystemResourceUsage";
import LogCard, { type UsageLogEntry } from "../components/LogCard";
import DeviceDetailsCard from "../components/DeviceDetails";
import type { APIClient, DashboardUpdate } from "../api/APIClient";
import CardComponent from "../components/CardComponent";
import { corporateFare, factory, settings, vitalSigns } from "../assets/images";
import { NavLink } from "react-router-dom";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        setUsageLogs((prev) => [entry, ...prev.slice(0, 5)]);
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
      className="dashboard-container min-vh-100 d-flex flex-column p-3"
    >
      <Row className="mb-4 position-relative">
        <Col xs={12} className="d-flex flex-column align-items-center">
          <div className="clock-container">{time}</div>
          <h2 className="dashboard-title fw-bold text-center mt-2">
            <FormattedMessage
              id="pages.Dashboard.title"
              defaultMessage="Device Status"
            />
          </h2>
        </Col>

        <div className="settings-top-right">
          <Dropdown className="menu" align="end">
            <Dropdown.Toggle as="button" className="icon-button">
              <img src={settings} alt="Settings" className="icon-img" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="settings-dropdown">
              <Dropdown.Item className="dropdown-item-custom exit-item">
                <FormattedMessage
                  id="components.Sidebar.exit"
                  defaultMessage="Exit"
                />
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="text-white"
                />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Row>

      <Card className="dashboard-main-card">
        <Card.Body className="p-4">
          <Row className="gx-5 gy-4 cards-row">
            <Col xs={12} lg={4} className="border-right-column">
              <div className="component-section">
                <SystemResourceUsage
                  cpuData={cpuData}
                  ramData={ramData}
                  realTimeCpu={realTimeCpu}
                  realTimeRam={realTimeRam}
                />
              </div>
            </Col>

            <Col xs={12} lg={4} className="border-right-column">
              <div className="component-section">
                <LogCard usageLogs={usageLogs} />
              </div>
            </Col>

            <Col xs={12} lg={4}>
              <div className="component-section">
                <DeviceDetailsCard apiClient={apiClient} />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="justify-content-center mb-4">
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h2 className="dashboard-discover fw-bold text-center mt-2">
            <FormattedMessage
              id="pages.Dashboard.discover"
              defaultMessage="Discover our demos"
            />
          </h2>
        </Col>
      </Row>
      <div className="div-wrapper">
        <Col>
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
                  defaultMessage="Control building systems and detect issues in real time"
                />
              }
            />
          </NavLink>
        </Col>
        <Col>
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
                  defaultMessage="Monitor machines and resolve alerts in the factory"
                />
              }
            />
          </NavLink>
        </Col>
        <Col>
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
                  defaultMessage="Monitor machines and resolve alerts in the factory"
                />
              }
            />
          </NavLink>
        </Col>
      </div>
    </Container>
  );
};

export default Dashboard;
