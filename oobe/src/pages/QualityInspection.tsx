import { Container, Image, Button, Alert } from "react-bootstrap";
import { logo } from "../assets/images";
import "./QualityInspection.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useState, useEffect, useRef } from "react";
import {
  pcbMissingHole00,
  pcbMissingHole01,
  pcbMissingHole02,
  pcbMissingHole03,
  pcbMissingHole04,
  pcbShortCircuit01,
  pcbShortCircuit02,
  pcbShortCircuit03,
  pcbShortCircuit04,
  pcbShortCircuit05,
} from "../assets/images";
import { APIClient, type AnalysisMode } from "../api/APIClient";
import ImageCarousel from "./ImageCarousel";

const MISSING_HOLE_COLOR = "#FF0000";
const SHORT_CIRCUIT_COLOR = "#FFC107";
const DEFAULT_COLOR = "#222322";

const imageOptions = [
  pcbMissingHole00,
  pcbMissingHole01,
  pcbMissingHole02,
  pcbMissingHole03,
  pcbMissingHole04,
  pcbShortCircuit01,
  pcbShortCircuit02,
  pcbShortCircuit03,
  pcbShortCircuit04,
  pcbShortCircuit05,
];

interface QualityInspectionProps {
  apiClient: APIClient;
}

export type DefectResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

export type DefectAnalysisResponse = {
  results: DefectResult[];
  inferenceTime: number;
};

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image at ${url}.`);
  const blob = await response.blob();
  const fileName = url.split("/").pop() || "image.png";
  return new File([blob], fileName, { type: blob.type });
};

const QualityInspection = ({ apiClient }: QualityInspectionProps) => {
  const [defectResults, setDefectResults] = useState<DefectResult[]>([]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("cpu");
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("analysis");
  const [currentImage, setCurrentImage] = useState(pcbMissingHole00);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const imageRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const intl = useIntl();

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      setScale({
        x: img.clientWidth / img.naturalWidth,
        y: img.clientHeight / img.naturalHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleImageLoad);
    return () => window.removeEventListener("resize", handleImageLoad);
  }, []);

  useEffect(() => {
    if (status !== "analysis") return;
    const processImage = async () => {
      try {
        setDefectResults([]);
        setInferenceTime(null);
        const file = await urlToFile(currentImage);
        const data = await apiClient.getDefectResult(file, analysisMode);
        setDefectResults(data.results);
        setInferenceTime(data.inferenceTime);
        setStatus("result");
      } catch {
        setError(
          intl.formatMessage({
            id: "imageFormatError",
            defaultMessage: "Backend rejected the image format.",
          }),
        );
      }
    };

    if (currentImage) processImage();
  }, [apiClient, currentImage, status, intl, analysisMode]);

  const handleBBoxColor = (categoryId: number) => {
    switch (categoryId) {
      case 0:
        return MISSING_HOLE_COLOR;
      case 3:
        return SHORT_CIRCUIT_COLOR;
      default:
        return DEFAULT_COLOR;
    }
  };

  return (
    <Container
      fluid
      className="quality-inspection-container vh-100 d-flex flex-column p-4 bg-black text-white"
    >
      <div className="d-flex justify-content-between align-items-start w-100 mb-4">
        <Button
          variant="link"
          className="close-icon-button p-0"
          onClick={() => navigate("/industrial")}
        >
          <FontAwesomeIcon icon={faX} size="lg" />
        </Button>
        <div className="flex-grow-1 d-flex justify-content-center">
          <Image src={logo} alt="SECO Logo" className="logo-small" />
        </div>
        <div style={{ width: "24px" }}></div>
      </div>

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

      <div className="row flex-grow-1 align-items-center mb-5">
        <div className="col-md-6 d-flex flex-column align-items-center mx-auto">
          <div className="position-relative d-inline-block overflow-hidden">
            {status === "result" &&
              defectResults.map((defect, index) => (
                <div
                  key={index}
                  className="position-absolute"
                  style={{
                    zIndex: 10,
                    left: `${defect.bbox[0] * scale.x}px`,
                    top: `${defect.bbox[1] * scale.y}px`,
                    width: `${defect.bbox[2] * scale.x}px`,
                    height: `${defect.bbox[3] * scale.y}px`,
                    border: `3px solid ${handleBBoxColor(defect.categoryId)}`,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    pointerEvents: "none",
                  }}
                />
              ))}
            <Image
              ref={imageRef}
              src={currentImage}
              alt="Sample"
              fluid
              onLoad={handleImageLoad}
              className="image"
            />
          </div>

          <div className="py-3 mt-3 w-100">
            <ImageCarousel
              images={imageOptions}
              currentImage={currentImage}
              onSelect={(img) => {
                setCurrentImage(img);
                setStatus("analysis");
              }}
            />
          </div>
        </div>

        <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
          <div className="mb-5 mt-5 text-center">
            {status === "analysis" && (
              <div className="spinner-border mb-5 spinner" role="status" />
            )}
            <h3 className="fw-bold d-flex flex-column align-items-start text-start">
              {status === "analysis" ? (
                <FormattedMessage
                  id="qualityInspection.analyseMessage"
                  defaultMessage="Scanning in progress..."
                />
              ) : (
                <div className="d-flex flex-column align-items-start gap-1">
                  <FormattedMessage
                    id="qualityInspection.anomaliesDetectedMessage"
                    defaultMessage="Anomalies detected"
                  />

                  {status === "result" && inferenceTime !== null && (
                    <div
                      className="mb-2"
                      style={{
                        fontSize: "1rem",
                        color: "#fff",
                        fontStyle: "italic",
                      }}
                    >
                      Inference time:{" "}
                      <strong>{inferenceTime.toFixed(2)} ms</strong>
                    </div>
                  )}

                  <div className="d-flex align-items-center">
                    <span
                      className="status-box me-2"
                      style={{ borderColor: MISSING_HOLE_COLOR }}
                    ></span>
                    <FormattedMessage
                      id="qualityInspection.missingHole"
                      defaultMessage="Missing hole"
                    />
                  </div>

                  <div className="d-flex align-items-center">
                    <span
                      className="status-box me-2"
                      style={{ borderColor: SHORT_CIRCUIT_COLOR }}
                    ></span>
                    <FormattedMessage
                      id="qualityInspection.shortCircuit"
                      defaultMessage="Short circuit"
                    />
                  </div>
                </div>
              )}
            </h3>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-auto mb-4">
            <Button
              variant="light"
              className={`analyze-cpu-button py-2 px-3 fw-bold`}
              onClick={() => navigate("/quality-inspection/webcam")}
            >
              Live webcam Analysis
            </Button>
            <Button
              variant="light"
              disabled={status === "analysis"}
              className={`analyze-cpu-button py-2 px-5 fw-bold ${status === "analysis" && analysisMode === "cpu" ? "active-analysis" : ""}`}
              onClick={() => {
                setStatus("analysis");
                setAnalysisMode("cpu");
              }}
            >
              <FormattedMessage
                id="components.QualityInspection.cpuAnalysisButton"
                defaultMessage="CPU Analysis"
              />
            </Button>

            <Button
              variant="light"
              disabled={status === "analysis"}
              className={`analyze-gpu-button py-2 px-5 fw-bold ${status === "analysis" && analysisMode === "gpu" ? "active-analysis" : ""}`}
              onClick={() => {
                setStatus("analysis");
                setAnalysisMode("gpu");
              }}
            >
              <FormattedMessage
                id="components.QualityInspection.gpuAnalysisButton"
                defaultMessage="GPU Analysis"
              />
            </Button>

            <Button
              variant="light"
              disabled={status === "analysis"}
              className={`analyze-npu-button py-2 px-5 fw-bold ${status === "analysis" && analysisMode === "npu" ? "active-analysis" : ""}`}
              onClick={() => {
                setStatus("analysis");
                setAnalysisMode("npu");
              }}
            >
              <FormattedMessage
                id="components.QualityInspection.npuAnalysisButton"
                defaultMessage="NPU Analysis"
              />
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default QualityInspection;
