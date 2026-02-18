import { Card, Row, Col } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { VitalSignsData } from "types";

export type VitalSignsProps = {
  vitalSigns: VitalSignsData[];
};

const VitalSigns = ({ vitalSigns }: VitalSignsProps) => {
  const [chartKey, setChartKey] = useState(0);

  const series = useMemo(
    () => [
      {
        name: "ECG",
        data: vitalSigns
          .slice()
          .slice(0, 250)
          .map((v) => v.ecg),
      },
    ],
    [vitalSigns],
  );

  const latest = vitalSigns[0];

  useEffect(() => {
    const handleResize = () => setChartKey((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      animations: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    stroke: { curve: "straight", width: 1.5 },
    grid: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { show: false } },
    tooltip: { enabled: true },
  };

  return (
    <Card className="p-4 h-100">
      <Card.Body>
        <Card.Title className="mb-3">
          <FormattedMessage
            id="vital.realTimeName"
            defaultMessage="Real Time Vital Signs"
          />
        </Card.Title>

        <Row className="mb-4 align-items-center">
          <Col>
            <FormattedMessage
              id="vital.ecgRecording"
              defaultMessage="ECG Recording"
            />
          </Col>
          <Col className="fw-semibold fs-4 text-end">
            {latest?.ecg ? `${latest.ecg} bpm` : "–"}
          </Col>
          <Col className="text-start">
            <FormattedMessage
              id="vital.bloodPressure"
              defaultMessage="Blood Pressure"
            />
          </Col>
        </Row>

        <Row className="g-3">
          <Col lg={8}>
            <div className="border rounded p-4 h-100">
              <div className="w-100 overflow-hidden">
                <ReactApexChart
                  key={chartKey}
                  options={options}
                  series={series}
                  type="line"
                  height={160}
                />
              </div>
            </div>
          </Col>

          <Col lg={4} className="d-flex flex-column gap-3">
            <div className="border rounded p-4 text-center d-flex flex-column justify-content-center">
              <div className="fs-4 fw-bold">
                {latest
                  ? `${latest.systolicPressure}/${latest.diastolicPressure} mmHg`
                  : "–"}
              </div>
            </div>

            <div>
              <FormattedMessage
                id="vital.oxygenSaturation"
                defaultMessage="Oxygen Saturation"
              />
            </div>
            <div className="border rounded p-4 text-center d-flex flex-column justify-content-center">
              <div className="fs-4 fw-bold">
                {latest ? `${latest.oxygenSaturation}%` : "–"}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default VitalSigns;
