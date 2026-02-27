import { useEffect, useState } from "react";
import { Card, Row, Col, Alert } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import "./DeviceDetails.scss";
import { APIClient } from "../api/APIClient";

interface DeviceDetailsCardProps {
  apiClient: APIClient;
}

export type DeviceInfo = {
  cpuArchitecture: string;
  cpuModelCode: string;
  cpuModelName: string;
  cpuVendor: string;
  deviceId?: string;
};

const DeviceDetailsCard = ({ apiClient }: DeviceDetailsCardProps) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getSystemInfo()
      .then((data) => {
        setDeviceInfo(data);
      })
      .catch(() => {
        setError("Failed to fetch system info");
      });
  }, [apiClient]);

  return (
    <>
      <Card.Title className="fw-bold fs-4 mb-3 device-details-card__title">
        <FormattedMessage
          id="components.DeviceDetailsCard.title"
          defaultMessage="Device details"
        />
      </Card.Title>

      {error && (
        <Alert
          onClose={() => setError(null)}
          dismissible
          variant="danger"
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      <Row className="device-details-card__item align-items-start mb-3">
        <Col className="device-details-card__label">
          <FormattedMessage
            id="components.DeviceDetailsCard.cpuArchitecture"
            defaultMessage="CPU architecture"
          />
        </Col>
        <Col className="device-details-card__value">
          {deviceInfo?.cpuArchitecture ?? "N/A"}
        </Col>
      </Row>

      <Row className="device-details-card__item align-items-start mb-3">
        <Col className="device-details-card__label">
          <FormattedMessage
            id="components.DeviceDetailsCard.cpuModelCode"
            defaultMessage="CPU model code"
          />
        </Col>
        <Col className="device-details-card__value">
          {deviceInfo?.cpuModelCode ?? "N/A"}
        </Col>
      </Row>

      <Row className="device-details-card__item align-items-start mb-3">
        <Col className="device-details-card__label">
          <FormattedMessage
            id="components.DeviceDetailsCard.cpuModelName"
            defaultMessage="CPU model name"
          />
        </Col>
        <Col className="device-details-card__value">
          {deviceInfo?.cpuModelName ?? "N/A"}
        </Col>
      </Row>

      <Row className="device-details-card__item align-items-start mb-3">
        <Col className="device-details-card__label">
          <FormattedMessage
            id="components.DeviceDetailsCard.cpuVendor"
            defaultMessage="CPU vendor"
          />
        </Col>
        <Col className="device-details-card__value">
          {deviceInfo?.cpuVendor ?? "N/A"}
        </Col>
      </Row>

      <Row className="device-details-card__item align-items-start">
        <Col className="device-details-card__label">
          <FormattedMessage
            id="components.DeviceDetailsCard.deviceId"
            defaultMessage="Device ID"
          />
        </Col>
        <Col className="device-details-card__value">
          {deviceInfo?.deviceId ?? "[DEVICE ID NOT AVAILABLE]"}
        </Col>
      </Row>
    </>
  );
};

export default DeviceDetailsCard;
