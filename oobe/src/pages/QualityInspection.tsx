import { Container, Image, Button, Alert } from "react-bootstrap";
import { logo } from "../assets/images";
import "./QualityInspection.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
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
import { defineMessages } from "react-intl";
import { APIClient } from "../api/APIClient";

interface QualityInspectionProps {
  apiClient: APIClient;
}

export type DefectResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

const messages = defineMessages({
  scanningMessage: {
    id: "qualityInspection.analyseMessage",
    defaultMessage: "Scanning in progress...",
  },
  anomaliesDetectedMessage: {
    id: "qualityInspection.anomaliesDetectedMessage",
    defaultMessage: "Anomalies detected",
  },
  missingHole: {
    id: "qualityInspection.missingHole",
    defaultMessage: "Missing hole",
  },
  shortCircuit: {
    id: "qualityInspection.shortCircuit",
    defaultMessage: "Short circuit",
  },
});

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image at ${url}.`);
  const blob = await response.blob();
  const fileName = url.split("/").pop() || "image.png";
  return new File([blob], fileName, { type: blob.type });
};

const QualityInspection = ({ apiClient }: QualityInspectionProps) => {
  const [defectResults, setDefectResults] = useState<DefectResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("greeting");
  const [currentImage, setCurrentImage] = useState(pcbMissingHole00);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const imageRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

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

    const timer = setTimeout(() => {
      if (status === "analysis") setStatus("result");
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, currentImage]);

  useEffect(() => {
    if (status !== "analysis") return;
    const processImage = async () => {
      try {
        setDefectResults([]);
        const file = await urlToFile(currentImage);
        const data = await apiClient.getDefectResult(file);
        setDefectResults(data);
      } catch {
        setError("Backend rejected the image format.");
      }
    };

    if (currentImage) processImage();
  }, [apiClient, currentImage, status]);

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
          <FormattedMessage
            id="components.QualityInspection.mainMessage"
            defaultMessage="This is a demo environment, the camera feed is simulated. Click ‘Start analysis’ to run inference."
          />
        </h2>
      </div>

      {status !== "greeting" && (
        <div className="row flex-grow-1 align-items-center mb-5">
          <div className="col-md-6 d-flex justify-content-center mx-auto">
            <div className="position-relative d-inline-block overflow-hidden">
              {status === "result" &&
                defectResults.map((defect, index) => (
                  <div
                    key={index}
                    className="position-absolute"
                    style={{
                      zIndex: 10,
                      position: "absolute",
                      left: `${defect.bbox[0] * scale.x}px`,
                      top: `${defect.bbox[1] * scale.y}px`,
                      width: `${defect.bbox[2] * scale.x}px`,
                      height: `${defect.bbox[3] * scale.y}px`,
                      border: `3px solid ${defect.categoryId === 0 ? "#ff0000" : "#ffc107"}`,
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
          </div>

          <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
            <div className="mb-5 mt-5 text-center">
              {status === "analysis" && (
                <div className="spinner-border mb-5 spinner" role="status" />
              )}
              <h3 className="fw-bold d-flex flex-column align-items-start text-start">
                {status === "analysis" ? (
                  <FormattedMessage {...messages.scanningMessage} />
                ) : (
                  <div className="d-flex flex-column align-items-start gap-1">
                    <FormattedMessage {...messages.anomaliesDetectedMessage} />

                    <div className="d-flex align-items-center">
                      <span
                        className="status-box me-2"
                        style={{ borderColor: "#ff0000" }}
                      ></span>
                      <FormattedMessage {...messages.missingHole} />
                    </div>

                    <div className="d-flex align-items-center">
                      <span
                        className="status-box me-2"
                        style={{ borderColor: "#ffc107" }}
                      ></span>
                      <FormattedMessage {...messages.shortCircuit} />
                    </div>
                  </div>
                )}
              </h3>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3 mt-auto mb-4">
              <Button
                variant="light"
                disabled={status === "analysis"}
                className="try-again-button py-2 px-5 fw-bold"
                onClick={() => setStatus("analysis")}
              >
                <FormattedMessage
                  id="components.QualityInspection.tryAgainButton"
                  defaultMessage="Try Again"
                />
              </Button>

              <Button
                variant="light"
                className="analyze-next-button py-2 px-5 fw-bold"
                onClick={() => {
                  const images = [
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
                  const nextIdx =
                    (images.indexOf(currentImage) + 1) % images.length;
                  setCurrentImage(images[nextIdx]);
                  setStatus("analysis");
                }}
              >
                <FormattedMessage
                  id="components.QualityInspection.analyzeNextObjectButton"
                  defaultMessage="Analyze next object"
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
            onClick={() => setStatus("analysis")}
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
