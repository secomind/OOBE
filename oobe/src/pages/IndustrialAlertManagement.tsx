import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { logo } from "../assets/images";
import "./IndustrialAlertManagement.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DataStreamChart from "../components/DataStreamChart";
import PropertyChart from "../components/PropertyChart";
import { NavLink } from "react-router-dom";
import type { APIClient, IndustrialUpdate } from "../api/APIClient";
import { useEffect, useState } from "react";
import { defineMessages } from "react-intl";
import AlarmResolvingSidebar from "../components/AlarmResolvingSidebar";

interface IndustrialAlertManagementProps {
  apiClient: APIClient;
}

const messages = defineMessages({
  suctionPressure: {
    id: "industrialAlertManagement.suctionPressure",
    defaultMessage: "SUCTION PRESSURE",
  },
  dischargePressure: {
    id: "industrialAlertManagement.dischargePressure",
    defaultMessage: "DISCHARGE PRESSURE",
  },
  energyConsumption: {
    id: "industrialAlertManagement.energyConsumption",
    defaultMessage: "ENERGY CONSUMPTION",
  },
  internalHumidity: {
    id: "industrialAlertManagement.internalHumidity",
    defaultMessage: "INTERNAL HUMIDITY",
  },
  fanSpeed: {
    id: "industrialAlertManagement.fanSpeed",
    defaultMessage: "FAN SPEED",
  },
  systemStatus: {
    id: "industrialAlertManagement.systemStatus",
    defaultMessage: "SYSTEM STATUS",
  },
});

const IndustrialAlertManagement = ({
  apiClient,
}: IndustrialAlertManagementProps) => {
  const [, setTime] = useState("");
  const [suctionPressure, setSuctionPressure] = useState<
    { x: number; y: number }[]
  >([]);
  const [dischargePressure, setDischargePressure] = useState<
    { x: number; y: number }[]
  >([]);
  const [energyConsumption, setEnergyConsumption] = useState<
    { x: number; y: number }[]
  >([]);
  const [internalHumidity, setInternalHumidity] = useState<
    { x: number; y: number }[]
  >([]);
  const [fanSpeed, setFanSpeed] = useState<{ x: number; y: number }[]>([]);
  const [systemStatus, setSystemStatus] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [realTimeSuctionPressure, setRealTimeSuctionPressure] = useState(0);
  const [realTimeDischargePressure, setRealTimeDischargePressure] = useState(0);
  const [realTimeEnergyConsumption, setRealTimeEnergyConsumption] = useState(0);
  const [realTimeInternalHumidity, setRealTimeInternalHumidity] = useState(0);
  const [realTimeFanSpeed, setRealTimeFanSpeed] = useState(0);
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

  const handleUpdate = (updateData: IndustrialUpdate) => {
    switch (updateData.field) {
      case "suctionPressure":
        setRealTimeSuctionPressure(updateData.value);
        setSuctionPressure((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: updateData.value },
        ]);
        break;

      case "dischargePressure":
        setRealTimeDischargePressure(updateData.value);
        setDischargePressure((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: updateData.value },
        ]);
        break;

      case "energyConsumption":
        setRealTimeEnergyConsumption(updateData.value);
        setEnergyConsumption((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: updateData.value },
        ]);
        break;

      case "internalHumidity":
        setRealTimeInternalHumidity(updateData.value);
        setInternalHumidity((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: updateData.value },
        ]);
        break;

      case "fanSpeed":
        setRealTimeFanSpeed(updateData.value);
        setFanSpeed((prev) => [
          ...prev.slice(-19),
          { x: Date.now(), y: updateData.value },
        ]);
        break;

      case "systemStatus":
        setRealTimeSystemStatus(updateData.value);
        setSystemStatus((prev) => [
          ...prev.slice(-19),
          {
            x: Date.now(),
            y: updateData.value === "working" ? 1 : 0,
          },
        ]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    apiClient.connectIndustrial(handleUpdate);

    return () => {
      apiClient.disconnectWebSocket();
    };
  }, [apiClient]);

  return (
    <Container
      fluid
      className="industrial-building-container min-vh-100 d-flex flex-column p-3"
    >
      <Row className="justify-content-center flex-grow-1">
        <Col
          xs={2}
          sm={6}
          md="auto"
          className="d-flex flex-column align-items-center justify-content-center h-100"
        >
          <NavLink to="/industrial" className="nav-link">
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
            leftTitle={messages.suctionPressure.defaultMessage}
            rightTitle={messages.dischargePressure.defaultMessage}
            leftSubtitle={
              realTimeSuctionPressure.toFixed(1).toString() + " bar"
            }
            rightSubtitle={
              realTimeDischargePressure.toFixed(1).toString() + " bar"
            }
            chartData1={suctionPressure}
            chartData2={dischargePressure}
          />
        </Col>
        <Col xs={12} md={12} lg={6} className="d-flex">
          <DataStreamChart
            chartType="line"
            leftTitle={messages.energyConsumption.defaultMessage}
            leftSubtitle={
              realTimeEnergyConsumption.toFixed(1).toString() + " kWH"
            }
            chartData1={energyConsumption}
          />
        </Col>
      </Row>

      <Row className="gx-4 gy-4 flex-grow-1 mb-4">
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.internalHumidity.defaultMessage}
            chartColor="blue"
            chartData={internalHumidity || []}
            realTimeData={
              Math.round(realTimeInternalHumidity).toString() + " %"
            }
          />
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex">
          <PropertyChart
            chartName={messages.fanSpeed.defaultMessage}
            chartColor="orange"
            chartData={fanSpeed || []}
            realTimeData={realTimeFanSpeed.toFixed().toString() + " RPM"}
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
            chartColor={realTimeSystemStatus === "fault" ? "red" : "green"}
            chartData={systemStatus || []}
            realTimeData={realTimeSystemStatus}
          />
        </Col>
      </Row>
      <AlarmResolvingSidebar
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        apiClient={apiClient}
        statusToFix="industrial"
      />
    </Container>
  );
};

export default IndustrialAlertManagement;
