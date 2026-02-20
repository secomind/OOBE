import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Container, Row, Image } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { expand, logo, person } from "../assets/images";
import "./SmartClinical.scss";
import ECGChart from "../components/ECGChart";
import { useEffect, useState } from "react";
import type { APIClient, SmartClinicalRecordUpdate } from "../api/APIClient";
import LaboratoryReportModal from "../components/BloodCountModal";
import { FormattedMessage } from "react-intl";

export interface PersonData {
  id: string;
  gender: string;
  birthDate: string;
  name: string;
  age: number;
  bloodType: string;
  heightCm: number;
  weightKg: number;
  attendingPhysician: string;
  reasonForHospitalization: string;
  allergies: string;
}

const personData = {
  id: "123456",
  gender: "male",
  birthDate: "1986-06-15T00:00:00Z",
  name: "John Kelley",
  age: 39,
  bloodType: "O+",
  heightCm: 174,
  weightKg: 78,
  attendingPhysician: "J. E. Wilson",
  reasonForHospitalization:
    "Head trauma due to minor car accident. Further tests and examinations are needed.",
  allergies: "No recognized allergies.",
};

const todayFormattedDate = new Date().toLocaleDateString("en-GB");

export interface LaboratoryReportData {
  labReport: {
    testType: string;
    collectionDate: string;
    reportDate: string;
  };
  testResults: {
    testName: string;
    result: string;
    unit: string;
    referenceRange: string;
  }[];
}

const sampleReportData: LaboratoryReportData = {
  labReport: {
    testType: "Complete Blood Count (CBC)",
    collectionDate: "04/08/2025",
    reportDate: "05/08/2025",
  },
  testResults: [
    {
      testName: "White Blood Cells (WBC)",
      result: "6.5",
      unit: "×10³/μL",
      referenceRange: "4.0 – 10.5",
    },
    {
      testName: "Red Blood Cells (RBC)",
      result: "5.10",
      unit: "×10³/μL",
      referenceRange: "4.50 – 5.90",
    },
    {
      testName: "Hemoglobin (Hb)",
      result: "15.2",
      unit: "g/dL",
      referenceRange: "13.5 – 17.5",
    },
    {
      testName: "Hematocrit (HCT)",
      result: "45",
      unit: "%",
      referenceRange: "41 – 53",
    },
    {
      testName: "Mean Corpuscular Volume (MCV)",
      result: "88",
      unit: "fL",
      referenceRange: "80 – 100",
    },
    {
      testName: "Platelets (PLT)",
      result: "210",
      unit: "×10³/μL",
      referenceRange: "150 – 400",
    },
  ],
};

interface SmartClinicalProps {
  apiClient: APIClient;
}

const SmartClinical = ({ apiClient }: SmartClinicalProps) => {
  const [ecgCurrent, setEcgCurrent] = useState<{ x: number; y: number }[]>([]);
  const [realTimeBpmCurrent, setRealTimeBpmCurrent] = useState(0);
  const [oxygenSaturation, setOxygenSaturation] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [systolic, setSystolic] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const temp: {
      ecgCurrent?: number;
    } = {};

    const handleUpdate = (update: SmartClinicalRecordUpdate) => {
      switch (update.field) {
        case "bpm":
          setRealTimeBpmCurrent(update.value);
          break;

        case "ecg":
          setEcgCurrent((prev) => [
            ...prev.slice(-149),
            { x: Date.now(), y: update.value },
          ]);
          temp.ecgCurrent = update.value;
          break;

        case "oxygenSaturation":
          setOxygenSaturation(Math.round(update.value));
          break;

        case "systolic":
          setSystolic(Math.round(update.value));
          break;

        case "diastolic":
          setDiastolic(Math.round(update.value));
          break;

        default:
          break;
      }
    };

    apiClient.connectSmartClinicalRecord(handleUpdate);
    return () => apiClient.disconnectSmartClinicalRecord();
  }, [apiClient]);

  return (
    <Container
      fluid
      className="smart-clinical-container min-vh-100 d-flex flex-column p-3"
    >
      <Row className="justify-content-center">
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

      <div className="container-fluid">
        <Row>
          <Col md={4}>
            <div className="p-3 bg-dark text-white h-100 card-border">
              <div className="text-center mb-3">
                <div className="card-image" style={{ width: 120, height: 120 }}>
                  <Image src={person} alt="person" fluid rounded />
                </div>
                <h5 className="mt-2">{personData.name}</h5>
                <p>
                  <FormattedMessage
                    id="pages.SmartClinical.age"
                    defaultMessage="Age:"
                  />
                  &nbsp;
                  {personData.age}
                </p>
              </div>
              <p>
                <strong>
                  <FormattedMessage
                    id="pages.SmartClinical.bloodType"
                    defaultMessage="Blood Type:"
                  />
                </strong>
                &nbsp;
                {personData.bloodType}
              </p>
              <p>
                <strong>
                  <FormattedMessage
                    id="pages.SmartClinical.height"
                    defaultMessage="Height:"
                  />
                </strong>
                &nbsp;
                {personData.heightCm} Cm
              </p>
              <p>
                <strong>
                  <FormattedMessage
                    id="pages.SmartClinical.weight"
                    defaultMessage="Weight:"
                  />
                </strong>
                &nbsp;
                {personData.weightKg} Kg
              </p>
              <p>
                <strong>
                  <FormattedMessage
                    id="pages.SmartClinical.physician"
                    defaultMessage="Attending Physician:"
                  />
                </strong>
                &nbsp;
                {personData.attendingPhysician}
              </p>
              <hr className="border-secondary" />
              <p>
                <strong>
                  <FormattedMessage
                    id="pages.SmartClinical.reasonForHospitalization"
                    defaultMessage="Reason for hospitalization:"
                  />
                </strong>
                &nbsp;
                {personData.reasonForHospitalization}
                <p>{personData.allergies}</p>
              </p>
            </div>
          </Col>

          <Col md={8}>
            <Row className="g-3 mb-3">
              <Col xs={12} md={12} lg={12} className="d-flex">
                <ECGChart
                  title={"ECG Recording"}
                  subtitle={
                    realTimeBpmCurrent.toFixed(1).toString() + " bpm"
                  }
                  data={ecgCurrent}
                  color="#165BAA"
                />
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={8}>
                <div className="d-flex flex-column gap-3 h-100">
                  <div className="p-3 bg-dark text-white text-center card-border">
                    <p>
                      <FormattedMessage
                        id="pages.SmartClinical.bloodPressure"
                        defaultMessage="Blood Pressure"
                      />
                    </p>
                    <h3>
                      {systolic}/{diastolic} mmHg
                    </h3>
                  </div>
                  <div className="p-3 bg-dark text-white text-center card-border">
                    <p>
                      <FormattedMessage
                        id="pages.SmartClinical.oxygenSaturation"
                        defaultMessage="Oxygen Saturation"
                      />
                    </p>
                    <h3>{oxygenSaturation}%</h3>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 bg-dark card-border text-white text-center h-100 d-flex flex-column justify-content-center">
                  <h3>
                    <FormattedMessage
                      id="pages.SmartClinical.realTimeAssistant"
                      defaultMessage="Real time assistant"
                    />
                  </h3>
                  <p className="text-start">
                    <FormattedMessage
                      id="pages.SmartClinical.realTimeAssistantMessage"
                      defaultMessage="Of course, here is the last laboratory test for the patient."
                    />
                  </p>
                  <Button
                    variant="outline-light"
                    onClick={() => setShowModal(true)}
                    className="d-flex align-items-center justify-content-between w-100"
                  >
                    <FormattedMessage
                      id="pages.SmartClinical.bloodCountButton"
                      defaultMessage="Blood Count(CBC) "
                    />
                    - {todayFormattedDate}
                    <Image
                      src={expand}
                      alt="expand"
                      fluid
                      rounded
                      className="expand-img"
                    />
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <LaboratoryReportModal
        show={showModal}
        onHide={() => setShowModal(false)}
        reportData={sampleReportData}
        patientData={personData}
      />
    </Container>
  );
};

export default SmartClinical;
