import { Container, Image, Button } from "react-bootstrap";
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
import AIErrorModal from "../components/AIErrorModal";

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
  const [status, setStatus] = useState("greeting");
  const [currentImage, setCurrentImage] = useState(pcbMissingHole00);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [showAIErrorModal, setShowAIErrorModal] = useState(false);

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
    if (status !== "analysis" || showAIErrorModal) return;

    const timer = setTimeout(() => {
      if (status === "analysis" && !showAIErrorModal) setStatus("result");
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, currentImage, showAIErrorModal]);

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
      } catch {
        setShowAIErrorModal(true);
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
        {status !== "greeting" && (
          <Button
            variant="link"
            className="close-icon-button p-0"
            onClick={() => navigate("/industrial")}
          >
            <FontAwesomeIcon icon={faX} size="lg" />
          </Button>
        )}
        <div className="flex-grow-1 d-flex justify-content-center">
          <Image
            src={logo}
            alt="SECO Logo"
            className={status === "greeting" ? "logo-big" : "logo-small"}
          />
        </div>
        <div style={{ width: "24px" }}></div>
      </div>

      <AIErrorModal
        show={showAIErrorModal}
        onHide={() => {
          setShowAIErrorModal(false);
          setStatus("result");
        }}
        onContinue={async () => {
          try {
            setDefectResults([]);
            setInferenceTime(null);
            const file = await urlToFile(currentImage);
            const data = await apiClient.getDefectResult(file, analysisMode);
            setDefectResults(data.results || []);
            setInferenceTime(data.inferenceTime || null);
            setStatus("result");
            return true;
          } catch (e) {
            return false;
          }
        }}
        message="if you see this pop-up, please check that the AI service is available or deployed"
      />

      <div
        className={
          status === "greeting"
            ? "flex-grow-1 d-flex align-items-center justify-content-center text-center"
            : "flex-grow-1 d-flex align-items-left mb-4 mt-5 text-center"
        }
      >
        <h2
          className={
            status === "greeting" ? "greeting-message" : "analysis-message"
          }
        >
          {status === "greeting" ? (
            <FormattedMessage
              id="components.QualityInspection.startAnalysisMessage"
              defaultMessage="This is a demo environment, the camera feed is simulated. Click ‘Start Analysis’ to run inference."
            />
          ) : (
            <FormattedMessage
              id="components.QualityInspection.analyzeNextMessage"
              defaultMessage="This is a demo environment, the camera feed is simulated. Click ‘CPU Analysis’ or 'NPU Analysis' to run inference"
            />
          )}
        </h2>
      </div>

      {status !== "greeting" && (
        <div className="row flex-grow-1 align-items-center justify-content-center mb-2">
          <div className="col-md-7 d-flex flex-column align-items-center justify-content-center">
            <div className="position-relative d-inline-block mb-4">
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

            <div className="mt-4 ms-5 w-100">
              <ImageCarousel
                images={imageOptions}
                currentImage={currentImage}
                onSelect={(img) => {
                  setCurrentImage(img);
                  setDefectResults([]);
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
      )}

      {status === "greeting" && (
        <div className="d-flex justify-content-center pb-5">
          <Button
            variant="light"
            className="greeting-button py-2 px-5 fw-bold"
            onClick={() => {
              setStatus("analysis");
              setAnalysisMode("cpu");
            }}
          >
            <FormattedMessage
              id="components.QualityInspection.startAnalysisButton"
              defaultMessage="Start analysis"
            />
          </Button>
        </div>
      )}
    </Container>
  );
};

export default QualityInspection;
