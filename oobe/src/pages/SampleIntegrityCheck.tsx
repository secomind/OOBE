import { Container, Image, Button, Alert } from "react-bootstrap";
import { logo } from "../assets/images";
import "./SampleIntegrityCheck.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useState, useEffect, useRef } from "react";
import {
  blisterPackEmpty00,
  blisterPackEmpty01,
  blisterPackFull00,
  blisterPackFull01,
  blisterPackPartial00,
  blisterPackPartial01,
  blisterPackPartial02,
  blisterPackPartial03,
  blisterPackPartial04,
  blisterPackPartial05,
  blisterPackPartial06,
  blisterPackPartial07,
  blisterPackPartial08,
  blisterPackPartial09,
  blisterPackPartial10,
} from "../assets/images";
import { APIClient } from "../api/APIClient";

const EMPTY_BLISTER_COLOR = "#FF0000";
const FULL_BLISTER_COLOR = "#FFC107";
const DEFAULT_COLOR = "#222322";

interface SampleIntegrityCheckProps {
  apiClient: APIClient;
}

export type BlisterPackResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image at ${url}.`);
  const blob = await response.blob();
  const fileName = url.split("/").pop() || "image.png";
  return new File([blob], fileName, { type: blob.type });
};

const SampleIntegrityCheck = ({ apiClient }: SampleIntegrityCheckProps) => {
  const [blisterPackResults, setBlisterPackResults] = useState<
    BlisterPackResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("greeting");
  const [currentImage, setCurrentImage] = useState(blisterPackEmpty00);
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

    const timer = setTimeout(() => {
      if (status === "analysis") setStatus("result");
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, currentImage]);

  useEffect(() => {
    if (status !== "analysis") return;
    const processImage = async () => {
      try {
        setBlisterPackResults([]);
        const file = await urlToFile(currentImage);
        const data = await apiClient.getBlisterPackResult(file);
        setBlisterPackResults(data);
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
  }, [apiClient, currentImage, status, intl]);

  const handleBBoxColor = (categoryId: number) => {
    switch (categoryId) {
      case 1:
        return EMPTY_BLISTER_COLOR;
      case 2:
        return FULL_BLISTER_COLOR;
      default:
        return DEFAULT_COLOR;
    }
  };

  return (
    <Container
      fluid
      className="integrity-container vh-100 d-flex flex-column p-4 bg-black text-white"
    >
      <div className="d-flex justify-content-between align-items-start w-100 mb-4">
        {status !== "greeting" && (
          <Button
            variant="link"
            className="close-icon-button p-0"
            onClick={() => navigate("/medical")}
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
            id="components.SampleIntegrityCheck.mainMessage"
            defaultMessage="This is a demo environment, the camera feed is simulated. Click ‘Start analysis’ to run inference."
          />
        </h2>
      </div>

      {status !== "greeting" && (
        <div className="row flex-grow-1 align-items-center mb-5">
          <div className="col-md-6 d-flex justify-content-center mx-auto">
            <div className="position-relative d-inline-block overflow-hidden">
              {status === "result" &&
                blisterPackResults.map((defect, index) => (
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
          </div>

          <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
            <div className="mb-5 mt-5 text-center">
              {status === "analysis" && (
                <div className="spinner-border mb-5 spinner" role="status" />
              )}
              <h3 className="fw-bold d-flex flex-column align-items-start text-start">
                {status === "analysis" ? (
                  <FormattedMessage
                    id="SampleIntegrityCheck.analyseMessage"
                    defaultMessage="Scanning in progress..."
                  />
                ) : (
                  <div className="d-flex flex-column align-items-start gap-1">
                    <FormattedMessage
                      id="SampleIntegrityCheck.anomaliesDetectedMessage"
                      defaultMessage="Anomalies detected"
                    />

                    <div className="d-flex align-items-center">
                      <span
                        className="status-box me-2"
                        style={{ borderColor: EMPTY_BLISTER_COLOR }}
                      ></span>
                      <FormattedMessage
                        id="SampleIntegrityCheck.emptyBlister"
                        defaultMessage="Empty blister"
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <span
                        className="status-box me-2"
                        style={{ borderColor: FULL_BLISTER_COLOR }}
                      ></span>
                      <FormattedMessage
                        id="SampleIntegrityCheck.fullBlister"
                        defaultMessage="Full blister"
                      />
                    </div>
                  </div>
                )}{" "}
              </h3>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3 mt-auto mb-4">
              <Button
                variant="light"
                className="analysis-result-button py-2 px-5 fw-bold"
                onClick={() => {
                  const images = [
                    blisterPackEmpty00,
                    blisterPackEmpty01,
                    blisterPackFull00,
                    blisterPackFull01,
                    blisterPackPartial00,
                    blisterPackPartial01,
                    blisterPackPartial02,
                    blisterPackPartial03,
                    blisterPackPartial04,
                    blisterPackPartial05,
                    blisterPackPartial06,
                    blisterPackPartial07,
                    blisterPackPartial08,
                    blisterPackPartial09,
                    blisterPackPartial10,
                  ];
                  const nextIdx =
                    (images.indexOf(currentImage) + 1) % images.length;
                  setCurrentImage(images[nextIdx]);
                  setStatus("analysis");
                }}
              >
                <FormattedMessage
                  id="components.SampleIntegrityCheck.analyzeNextButton"
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
              id="components.SampleIntegrityCheck.startButton"
              defaultMessage="Start analysis"
            />
          </Button>
        </div>
      )}
    </Container>
  );
};

export default SampleIntegrityCheck;
