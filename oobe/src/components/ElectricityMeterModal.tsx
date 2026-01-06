import { Modal, Image, Container, Row, Col } from "react-bootstrap";
import "./ElectricityMeterModal.scss";
import { logo } from "../assets/images";
import { FormattedMessage } from "react-intl";

export interface ElectricityMeterData {
  customer: string;
  meterId: string;
  readingDate: string;

  currentReading: string;
  previousReading: string;
  periodConsumption: string;

  currentTariff: string;
  estimatedCost: string;

  peakDemand: string;
  averageDailyUsage: string;
  status: string;
}

interface ElectricityMeterModalProps {
  show: boolean;
  onHide: () => void;
  data: ElectricityMeterData;
}

const ElectricityMeterModal = ({
  show,
  onHide,
  data,
}: ElectricityMeterModalProps) => {
  if (!data) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="electricity-meter-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="modal-title-custom w-100 text-center">
          <Image src={logo} alt="SECO Logo" fluid className="logo" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Container fluid>
          <Row className="section-header">
            <Col>
              <h3>
                <FormattedMessage
                  id="electricityMeter.title"
                  defaultMessage="Electricity Meter"
                />
              </h3>
            </Col>
          </Row>
          <Row className="px-4 pb-3">
            <Col md={4}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.customer"
                  defaultMessage="Customer"
                />
                :
              </strong>
            </Col>
            <Col md={8}>{data.customer}</Col>
            <Col md={4}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.meterId"
                  defaultMessage="Meter ID"
                />
                :
              </strong>
            </Col>
            <Col md={8}>{data.meterId}</Col>
            <Col md={4}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.readingDate"
                  defaultMessage="Reading Date"
                />
                :
              </strong>
            </Col>
            <Col md={8}>{data.readingDate}</Col>
          </Row>
          <Row className="section-header">
            <Col>
              <h3>
                <FormattedMessage
                  id="electricityMeter.consumption.title"
                  defaultMessage="Consumption"
                />
              </h3>
            </Col>
          </Row>
          <Row className="px-4 pb-3">
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.currentReading"
                  defaultMessage="Current Reading"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.currentReading}</Col>
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.previousReading"
                  defaultMessage="Previous Reading"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.previousReading}</Col>
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.periodConsumption"
                  defaultMessage="Period Consumption"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.periodConsumption}</Col>
          </Row>
          <Row className="section-header">
            <Col>
              <h3>
                <FormattedMessage
                  id="electricityMeter.cost.title"
                  defaultMessage="Cost"
                />
              </h3>
            </Col>
          </Row>
          <Row className="px-4 pb-3">
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.currentTariff"
                  defaultMessage="Current Tariff"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.currentTariff}</Col>
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.estimatedCost"
                  defaultMessage="Estimated Cost"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.estimatedCost}</Col>
          </Row>
          <Row className="section-header">
            <Col>
              <h3>
                <FormattedMessage
                  id="electricityMeter.additional.title"
                  defaultMessage="Additional Info"
                />
              </h3>
            </Col>
          </Row>
          <Row className="px-4 pb-4">
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.peakDemand"
                  defaultMessage="Peak Demand"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.peakDemand}</Col>
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.averageDailyUsage"
                  defaultMessage="Average Daily Usage"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.averageDailyUsage}</Col>
            <Col md={6}>
              <strong>
                <FormattedMessage
                  id="electricityMeter.status"
                  defaultMessage="Status"
                />
                :
              </strong>
            </Col>
            <Col md={6}>{data.status}</Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default ElectricityMeterModal;
