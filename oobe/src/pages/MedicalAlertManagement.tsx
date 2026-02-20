import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { logo } from "../assets/images";
import "./MedicalAlertManagement.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DataStreamChart from "../components/DataStreamChart";
import PropertyChart from "../components/PropertyChart";
import { NavLink } from "react-router-dom";
import type { APIClient, MedicalUpdate } from "../api/APIClient";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import AlarmResolvingSidebar from "../components/AlarmResolvingSidebar";

interface MedicalAlertManagementProps {
  apiClient: APIClient;
}

const messages = defineMessages({
  tubeStatus: {
    id: "medicalAlertManagement.tubeStatus",
    defaultMessage: "TUBE STATUS",
  },
  tubeCurrent: {
    id: "medicalAlertManagement.tubeCurrent",
    defaultMessage: "TUBE CURRENT",
  },
  gantryTemperature: {
    id: "medicalAlertManagement.gantryTemperature",
    defaultMessage: "GANTRY TEMPERATURE",
  },
  coolingSystem: {
    id: "medicalAlertManagement.coolingSystem",
    defaultMessage: "COOLING SYSTEM",
  },
  systemStatus: {
    id: "medicalAlertManagement.systemStatus",
    defaultMessage: "SYSTEM STATUS",
  },
});

const MedicalAlertManagement = ({ apiClient }: MedicalAlertManagementProps) => {
  const [, setTime] = useState("");
  const [tubeStatus, setTubeStatus] = useState<string>("");
  const [tubeTemperature, setTubeTemperature] = useState<
    { x: number; y: number }[]
  >([]);
  const [tubeCurrent, setTubeCurrent] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [gantryTemperature, setGantryTemperature] = useState<
    { x: number; y: number }[]
  >([]);
  const [coolingSystem, setCoolingSystem] = useState<
    { x: number; y: number }[]
  >([]);
  const [systemStatus, setSystemStatus] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [realTimeTubeTemperature, setRealTimeTubeTemperature] = useState(0);
  const [realTimeTubeCurrent, setRealTimeTubeCurrent] = useState(0);
  const [realTimeGantryTemperature, setRealTimeGantryTemperature] = useState(0);
  const [realTimeCoolingSystem, setRealTimeCoolingSystem] =
    useState<string>("");
  const [realTimeSystemStatus, setRealTimeSystemStatus] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);

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
    const temp: {
      tubeStatus?: string;
      tubeTemperature?: number;
      tubeCurrent?: number;
      gantryTemperature?: number;
      coolingSystem?: string;
      systemStatus?: string;
    } = {};

    const handleUpdate = (update: MedicalUpdate) => {
      if (update.field === "tubeStatus") {
        setTubeStatus(update.value);
        temp.tubeStatus = update.value;
      }

      if (update.field === "tubeTemperature") {
        setRealTimeTubeTemperature(update.value);
        setTubeTemperature((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.tubeTemperature = update.value;
      }

      if (update.field === "tubeCurrent") {
        setRealTimeTubeCurrent(update.value);
        setTubeCurrent((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.tubeCurrent = update.value;
      }

      if (update.field === "gantryTemperature") {
        setRealTimeGantryTemperature(update.value);
        setGantryTemperature((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.gantryTemperature = update.value;
      }

      if (update.field === "coolingSystem") {
        setRealTimeCoolingSystem(update.value);
        setCoolingSystem((prev) => [
          ...prev.slice(-19),
          {
            x: Date.now(),
            y: update.value === "Running" ? 1 : 0,
          },
        ]);
        temp.coolingSystem = update.value;
      }

      if (update.field === "systemStatus") {
        setRealTimeSystemStatus(update.value);
        setSystemStatus((prev) => [
          ...prev.slice(-19),
          {
            x: Date.now(),
            y: update.value === "ready" ? 1 : 0,
          },
        ]);
        temp.systemStatus = update.value;
      }
    };

    apiClient.connectMedical(handleUpdate);
    return () => apiClient.disconnectMedical();
  }, [apiClient, realTimeTubeTemperature]);

  return (
    <Container
      fluid
      className="medical-building-container min-vh-100 d-flex flex-column p-3"
    >
      <Row className="justify-content-center flex-grow-1">
        <Col
          xs={2}
          sm={6}
          md="auto"
          className="d-flex flex-column align-items-center justify-content-center h-100"
        >
          <NavLink to="/medical" className="nav-link">
            <Button className="close-icon-button text-white btn-dark">
              <FontAwesomeIcon icon={faX} className="text-white" />
            </Button>
          </NavLink>
        </Col>
        <Col>
          <Image src={logo} alt="SECO Logo" fluid className="logo" />
        </Col>
      </Row>

      <Row className="gx-4 gy-4 flex-grow-1 mb-4">
        <Col xs={12} md={12} lg={6} className="d-flex">
          <DataStreamChart
            chartType="area"
            leftTitle={messages.tubeStatus.defaultMessage}
            leftSubtitle={tubeStatus}
            rightSubtitle={realTimeTubeTemperature.toFixed().toString() + "°C"}
            chartData1={tubeTemperature}
          />
        </Col>
        <Col xs={12} md={12} lg={6} className="d-flex">
          <DataStreamChart
            chartType="line"
            leftTitle={messages.tubeCurrent.defaultMessage}
            leftSubtitle={realTimeTubeCurrent.toFixed(1).toString() + " kW"}
            chartData1={tubeCurrent}
          />
        </Col>
      </Row>

      <Row className="gx-4 gy-4 flex-grow-1 mb-4">
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.gantryTemperature.defaultMessage}
            chartColor="blue"
            chartData={gantryTemperature || []}
            realTimeData={realTimeGantryTemperature.toFixed().toString() + "°C"}
          />
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.coolingSystem.defaultMessage}
            chartColor="orange"
            chartData={coolingSystem || []}
            realTimeData={realTimeCoolingSystem}
          />
        </Col>
        <Col
          xs={12}
          md={6}
          lg={4}
          className="d-flex"
          onClick={() => {
            if (realTimeSystemStatus === "fault") {
              setShowSidebar(true);
            }
          }}
        >
          <PropertyChart
            chartName={messages.systemStatus.defaultMessage}
            chartColor="green"
            chartData={systemStatus || []}
            realTimeData={realTimeSystemStatus}
          />
        </Col>
      </Row>
      <AlarmResolvingSidebar
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        apiClient={apiClient}
      />
    </Container>
  );
};

export default MedicalAlertManagement;
