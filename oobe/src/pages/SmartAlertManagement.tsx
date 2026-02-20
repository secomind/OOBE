import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { logo } from "../assets/images";
import "./SmartAlertManagement.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DataStreamChart from "../components/DataStreamChart";
import PropertyChart from "../components/PropertyChart";
import { NavLink } from "react-router-dom";
import type { APIClient, SmartUpdate } from "../api/APIClient";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import AlarmResolvingSidebar from "../components/AlarmResolvingSidebar";

interface SmartAlertManagementProps {
  apiClient: APIClient;
}

const messages = defineMessages({
  plantStatus: {
    id: "smartAlertManagement.plantStatus",
    defaultMessage: "PLANT STATUS",
  },
  powerSentToGrid: {
    id: "smartAlertManagement.powerSentToGrid",
    defaultMessage: "POWER SENT TO GRID",
  },
  gantryTemperature: {
    id: "smartAlertManagement.gantryTemperature",
    defaultMessage: "GANTRY TEMPERATURE",
  },
  selfConsumption: {
    id: "smartAlertManagement.selfConsumption",
    defaultMessage: "SELF-CONSUMPTION",
  },
  inverterStatus: {
    id: "smartAlertManagement.inverterStatus",
    defaultMessage: "INVERTER STATUS",
  },
});

const SmartAlertManagement = ({ apiClient }: SmartAlertManagementProps) => {
  const [, setTime] = useState("");
  const [plantStatus, setPlantStatus] = useState<string>("");
  const [plantPower, setPlantPower] = useState<{ x: number; y: number }[]>([]);
  const [powerSentToGrid, setPowerSentToGrid] = useState<
    { x: number; y: number }[]
  >([]);
  const [inverterTemperature, setInverterTemperature] = useState<
    { x: number; y: number }[]
  >([]);
  const [selfConsumption, setSelfConsumption] = useState<
    { x: number; y: number }[]
  >([]);
  const [inverterStatus, setInverterStatus] = useState<
    { x: number; y: number }[]
  >([]);
  const [realTimePlantPower, setRealTimePlantPower] = useState(0);
  const [realTimePowerSentToGrid, setRealTimePowerSentToGrid] = useState(0);
  const [realTimeInvTemp, setRealTimeInvTemp] = useState(0);
  const [realTimeSelfConsupmtion, setRealTimeSelfConsupmtion] = useState(0);
  const [realTimeInvStatus, setRealTimeInvStatus] = useState<string>("");
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
      plantStatus?: string;
      plantPower?: number;
      powerSentToGrid?: number;
      inverterTemperature?: number;
      selfConsumption?: number;
      inverterStatus?: string;
    } = {};

    const handleUpdate = (update: SmartUpdate) => {
      if (update.field === "plantStatus") {
        setPlantStatus(update.value);
        temp.plantStatus = update.value;
      }

      if (update.field === "plantPower") {
        setRealTimePlantPower(update.value);
        setPlantPower((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.plantPower = update.value;
      }

      if (update.field === "powerSentToGrid") {
        setRealTimePowerSentToGrid(update.value);
        setPowerSentToGrid((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.powerSentToGrid = update.value;
      }

      if (update.field === "inverterTemperature") {
        setRealTimeInvTemp(update.value);
        setInverterTemperature((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value },
        ]);
        temp.inverterTemperature = update.value;
      }

      if (update.field === "selfConsumption") {
        const selfConsumptionPercentage =
          (update.value / realTimePlantPower) * 100;

        setRealTimeSelfConsupmtion(selfConsumptionPercentage);
        setSelfConsumption((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: selfConsumptionPercentage },
        ]);
        temp.selfConsumption = selfConsumptionPercentage;
      }

      if (update.field === "inverterStatus") {
        setRealTimeInvStatus(update.value);
        setInverterStatus((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: update.value === "ready" ? 1 : 0 },
        ]);
        temp.inverterStatus = update.value;
      }
    };

    apiClient.connectSmart(handleUpdate);
    return () => apiClient.disconnectSmart();
  }, [apiClient, realTimePlantPower]);

  return (
    <Container
      fluid
      className="smart-building-container min-vh-100 d-flex flex-column p-3"
    >
      <Row className="justify-content-center flex-grow-1">
        <Col
          xs={2}
          sm={6}
          md="auto"
          className="d-flex flex-column align-items-center justify-content-center h-100"
        >
          <NavLink to="/smart-building" className="nav-link">
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
            leftTitle={messages.plantStatus.defaultMessage}
            leftSubtitle={plantStatus}
            rightSubtitle={realTimePlantPower.toFixed(1).toString() + " kW"}
            chartData1={plantPower}
          />
        </Col>
        <Col xs={12} md={12} lg={6} className="d-flex">
          <DataStreamChart
            chartType="line"
            leftTitle={messages.powerSentToGrid.defaultMessage}
            leftSubtitle={realTimePowerSentToGrid.toFixed(1).toString() + " kW"}
            chartData1={powerSentToGrid}
          />
        </Col>
      </Row>

      <Row className="gx-4 gy-4 flex-grow-1 mb-4">
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.gantryTemperature.defaultMessage}
            chartColor="blue"
            chartData={inverterTemperature || []}
            realTimeData={realTimeInvTemp.toFixed().toString() + "°C"}
          />
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.selfConsumption.defaultMessage}
            chartColor="orange"
            chartData={selfConsumption || []}
            realTimeData={realTimeSelfConsupmtion.toFixed().toString() + "%"}
          />
        </Col>
        <Col
          xs={12}
          md={6}
          lg={4}
          className="d-flex"
          onClick={() => {
            if (realTimeInvStatus === "fault") {
              setShowSidebar(true);
            }
          }}
        >
          <PropertyChart
            chartName={messages.inverterStatus.defaultMessage}
            chartColor="green"
            chartData={inverterStatus || []}
            realTimeData={realTimeInvStatus}
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

export default SmartAlertManagement;
