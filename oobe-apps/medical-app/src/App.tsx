import { JSX, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import Sidebar, { SidebarSection } from "./components/Sidebar";
import PatientOverview from "./components/PatientOverview";
import AstarteAPIClient from "./api/AstarteAPIClient";
import { PatientOverviewData, MedicalReportsData, VitalSignsData } from "types";
import MedicalReports from "./components/MedicalReports";
import VitalSigns from "./components/VitalSigns";

export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const [selectedSection, setSelectedSection] =
    useState<SidebarSection>("overview");
  const [patientOverview, setPatientOverview] =
    useState<PatientOverviewData | null>(null);
  const [dataFetching, setDataFetching] = useState(false);
  const [medicalReports, setMedicalReports] = useState<MedicalReportsData[]>(
    [],
  );
  const [vitalSigns, setVitalSigns] = useState<VitalSignsData[]>([]);
  const handleSectionChange = (e: SidebarSection) => {
    setSelectedSection(e);
  };
  const generateSalt = () => Math.random().toString(36).slice(2);
  const astarteClient = useMemo(() => {
    return new AstarteAPIClient({ astarteUrl, realm, token });
  }, [astarteUrl, realm, token]);

  const fetchAllData = async () => {
    setDataFetching(true);
    const patientOverviewPromise = astarteClient
      .getPatientOverview(deviceId)
      .then((patientData) => {
        setPatientOverview(patientData);
      })
      .catch(() => {
        setPatientOverview(null);
      });

    const medicalReportsPromise = astarteClient
      .getMedicalReports(deviceId)
      .then((medicalData) => {
        setMedicalReports(medicalData);
      })
      .catch(() => {
        setMedicalReports([]);
      });

    const vitalSignsPromise = astarteClient
      .getVitalSigns(deviceId)
      .then((vitalSignsData) => {
        setVitalSigns(vitalSignsData);
      })
      .catch(() => {
        setVitalSigns([]);
      });
    Promise.all([
      patientOverviewPromise,
      medicalReportsPromise,
      vitalSignsPromise,
    ]).finally(() => {
      setDataFetching(false);
    });
  };

  useEffect(() => {
    fetchAllData();
  }, [astarteClient, deviceId]);

  const setUpWebSocketConnection = async () => {
    const salt = generateSalt();
    const roomName = `${salt}:devices:${deviceId}:interfaces:com.oobe.vital.Signs`;

    astarteClient
      .joinRoom(roomName)
      .then(async (channel) => {
        await astarteClient.listenForEvents(roomName, handleVitalSignsEvent);

        const dataTriggerPayload = {
          name: `datatrigger-${deviceId}`,
          device_id: deviceId,
          simple_trigger: {
            type: "data_trigger",
            on: "incoming_data",
            interface_name: "com.oobe.vital.Signs",
            interface_major: 0,
            match_path: "/*",
            value_match_operator: "*",
          },
        } as const;

        return astarteClient.registerVolatileTrigger(
          roomName,
          dataTriggerPayload,
        );
      })
      .then(() => {
        console.log(`Watching for ${deviceId} data events`);
      })
      .catch((error) => {
        console.error("Error setting up WebSocket connection:", error);
      });
  };

  const handleVitalSignsEvent = (event: any) => {
    const dto = event.event.value;

    const newVital: VitalSignsData = {
      ecg: dto.ecg,
      systolicPressure: dto.systolic_pressure,
      diastolicPressure: dto.diastolic_pressure,
      oxygenSaturation: dto.oxygen_saturation,
      timestamp: new Date(event.timestamp),
    };

    setVitalSigns((prev) => [newVital, ...prev].slice(0, 200));
  };

  useEffect(() => {
    setUpWebSocketConnection();

    return () => {
      astarteClient.joinedRooms.forEach((room) => {
        astarteClient.leaveRoom(room);
      });
    };
  }, [astarteClient, deviceId]);

  const sectionContent: Record<SidebarSection, JSX.Element> = {
    overview: <PatientOverview data={patientOverview} />,
    reports: <MedicalReports reports={medicalReports} />,
    vitalSigns: <VitalSigns vitalSigns={vitalSigns} />,
  };

  return (
    <div className="bg-light min-vh-100 d-flex justify-content-center p-4">
      <Container fluid className="d-flex justify-content-center">
        <Card className="shadow-sm p-3 w-100 h-100 mw-100">
          <Row className="h-100">
            <Col
              xs={4}
              xl={2}
              className="border-end position-relative overflow-auto"
            >
              <Sidebar value={selectedSection} onChange={handleSectionChange} />
            </Col>

            <Col xs={8} xl={10} className="px-4">
              {dataFetching ? (
                <div className="text-center">
                  <div className="d-inline-flex align-items-center justify-content-center m-3">
                    <Spinner
                      animation="border"
                      variant="primary"
                      className="me-2"
                    />
                    <FormattedMessage
                      id="loading"
                      defaultMessage="Loading..."
                    />
                  </div>
                </div>
              ) : (
                sectionContent[selectedSection]
              )}
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default App;
