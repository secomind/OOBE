import React, { useRef, useState } from "react";
import { Container, Button, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../api/APIClient";
import { logo } from "../assets/images";
import { FormattedMessage } from "react-intl";

const EMPTY_BLISTER_COLOR = "#FF0000";
const FULL_BLISTER_COLOR = "#FFC107";
const DEFAULT_COLOR = "#222322";

export type BlisterPackResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

const SampleIntegrityCheckWebcam = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState("greeting");
  const [blisterPackResults, setBlisterPackResults] = useState<
    BlisterPackResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [currentTime] = useState(new Date());
  const [scale] = useState({ x: 1, y: 1 });
  const navigate = useNavigate();
  const apiClient = new APIClient();

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  React.useEffect(() => {
    if (status === "greeting" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 960, 720);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setCaptured(dataUrl);
        setStatus("analysis");
        setError(null);
        try {
          const file = dataURLtoFile(dataUrl, "webcam.png");
          const data = await apiClient.getBlisterPackResult(file);
          setBlisterPackResults(data);
          setStatus("result");
        } catch {
          setError("Backend rejected the image format or analysis failed.");
          setStatus("greeting");
        }
      }
    }
  };

  const formatFullDate = (date: Date): string => {
    const time = date.toLocaleTimeString("en-GB", { hour12: false });
    const dayMonthYear = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} - ${dayMonthYear}`;
  };

  const handleRestartWebcam = () => {
    setCaptured(null);
    setBlisterPackResults([]);
    setError(null);
    setStatus("greeting");
  };

  const handleCaptureAndAnalysis = () => {
    setCaptured(null);
    setBlisterPackResults([]);
    setError(null);
    setStatus("greeting");
    setTimeout(() => handleCapture(), 100);
  };

  const handleReturnPage = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    navigate("/sample-integrity-check", { state: { autoStart: true } });
  };

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
      className="quality-inspection-container vh-100 d-flex flex-column p-4 bg-black text-white"
    >
      <div className="w-100 mb-4 d-flex align-items-center">
        <div className="flex-grow-1"></div>

        <div className="text-center">
          <Image src={logo} alt="SECO" style={{ height: "30px" }} />
        </div>

        <div className="flex-grow-1 d-flex justify-content-end text-secondary small">
          {formatFullDate(currentTime)}
        </div>
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

      <div className="row flex-grow-1 overflow-hidden">
        <div className="col-md-7 d-flex flex-column h-100">
          <div
            className="position-relative flex-grow-1 bg-dark rounded-4 overflow-hidden border border-secondary shadow-lg d-flex align-items-center justify-content-center"
            style={{ minHeight: 320 }}
          >
            {status === "greeting" && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <video
                  ref={videoRef}
                  width={960}
                  height={720}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    background: "#222",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={720}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {captured && (status === "analysis" || status === "result") && (
              <div className="position-relative d-inline-block mb-4">
                <Image
                  ref={imageRef}
                  src={captured}
                  className="mw-100 mh-100 shadow-lg"
                  style={{ objectFit: "contain" }}
                />
                {status === "result" &&
                  blisterPackResults.map((defect, index) => (
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
              </div>
            )}
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
        </div>
        <div></div>
      </div>
      <div className="pt-3 d-flex gap-2">
        <Button
          variant="light"
          className="analysis-result-button flex-grow-1 py-3 fw-bold"
          onClick={handleReturnPage}
        >
          Gallery
        </Button>
        <Button
          variant="light"
          className="analysis-result-button flex-grow-1 py-3 fw-bold border-2"
          onClick={handleCaptureAndAnalysis}
          disabled={status === "analysis"}
        >
          {status === "analysis" ? "Scanning in progress..." : "Start Analysis"}
        </Button>
        <Button
          variant="light"
          className="analysis-result-button flex-grow-1 py-3 fw-bold"
          onClick={handleRestartWebcam}
          disabled={status === "greeting"}
        >
          Live Webcam Feedback
        </Button>
      </div>
    </Container>
  );
};

export default SampleIntegrityCheckWebcam;
