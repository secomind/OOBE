import React, { useRef, useState, useMemo } from "react";
import { Container, Button, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APIClient, type AnalysisMode } from "../api/APIClient";
import { type DefectResult } from "./QualityInspection.tsx";
import { logo } from "../assets/images";
import { FormattedMessage } from "react-intl";

const MISSING_HOLE_COLOR = "#FF0000";
const SHORT_CIRCUIT_COLOR = "#FFC107";
const DEFAULT_COLOR = "#222322";

const QualityInspectionWebcam = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnalyzingRef = useRef(false);

  const [status, setStatus] = useState("idle");
  const [defectResults, setDefectResults] = useState<DefectResult[]>([]);
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("cpu");
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [currentTime] = useState(new Date());
  const navigate = useNavigate();
  const apiClient = useMemo(() => new APIClient(), []);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setStatus("greeting");
    } catch {
      setError(
        "Failed to access webcam. Please ensure you have given permission.",
      );
    }
  };

  React.useEffect(() => {
    if (status === "greeting" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  React.useEffect(() => {
    let active = true;
    const analyzeLoop = async () => {
      if (
        status !== "greeting" ||
        !streamRef.current ||
        !videoRef.current ||
        !canvasRef.current
      )
        return;
      if (isAnalyzingRef.current) return;

      isAnalyzingRef.current = true;
      try {
        const ctx = canvasRef.current.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 960, 720);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvasRef.current?.toBlob((b) => resolve(b), "image/jpeg", 0.7),
          );

          if (blob && active && status === "greeting") {
            const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
            const data = await apiClient.getDefectResult(file, analysisMode);
            if (active && status === "greeting") {
              const url = URL.createObjectURL(blob);
              setCaptured((prev) => {
                if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                return url;
              });
              setDefectResults(data.results);
              setInferenceTime(data.inferenceTime);
            }
          }
        }
      } catch (err) {
        console.error("Loop analysis error:", err);
      } finally {
        isAnalyzingRef.current = false;
        if (active && status === "greeting") {
          setTimeout(analyzeLoop, 100);
        }
      }
    };

    if (status === "greeting") {
      analyzeLoop();
    }
    return () => {
      active = false;
    };
  }, [status, analysisMode, apiClient]);

  const formatFullDate = (date: Date): string => {
    const time = date.toLocaleTimeString("en-GB", { hour12: false });
    const dayMonthYear = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} - ${dayMonthYear}`;
  };

  const handleAnalysisClick = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    if (status === "idle") {
      startWebcam();
    }
  };

  const handleReturnPage = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/quality-inspection", { state: { autoStart: true } });
  };

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

  const renderBBoxes = () => {
    const media = imageRef.current || videoRef.current;
    const container = containerRef.current;
    if (!media || !container || defectResults.length === 0) return null;

    const rect = media.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scaleX = rect.width / 960;
    const scaleY = rect.height / 720;

    const offsetX = rect.left - containerRect.left;
    const offsetY = rect.top - containerRect.top;

    return defectResults.map((defect, index) => (
      <div
        key={index}
        className="position-absolute"
        style={{
          zIndex: 10,
          left: offsetX + defect.bbox[0] * scaleX,
          top: offsetY + defect.bbox[1] * scaleY,
          width: defect.bbox[2] * scaleX,
          height: defect.bbox[3] * scaleY,
          border: `3px solid ${handleBBoxColor(defect.categoryId)}`,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          pointerEvents: "none",
        }}
      />
    ));
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
            ref={containerRef}
            className="position-relative flex-grow-1 bg-dark rounded-4 overflow-hidden border border-secondary shadow-lg d-flex align-items-center justify-content-center"
            style={{ minHeight: 320 }}
          >
            {status === "idle" && (
              <div className="text-secondary text-center">
                <p>Webcam inactive.</p>
                <p className="small">Click an analysis mode to start.</p>
              </div>
            )}

            {status === "greeting" && (
              <video
                ref={videoRef}
                width={960}
                height={720}
                autoPlay
                muted
                playsInline
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            )}

            {(status === "greeting" || captured) && (
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
                {captured ? (
                  <Image
                    ref={imageRef}
                    src={captured}
                    className="mw-100 mh-100 shadow-lg"
                    style={{ objectFit: "contain" }}
                  />
                ) : status === "greeting" ? (
                  <div className="spinner-border text-light" role="status" />
                ) : null}
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={720}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {renderBBoxes()}
          </div>
        </div>
        <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
          <div className="mb-5 mt-5 text-center">
            <h3 className="fw-bold d-flex flex-column align-items-start text-start">
              <div className="d-flex flex-column align-items-start gap-1">
                <FormattedMessage
                  id="qualityInspection.anomaliesDetectedMessage"
                  defaultMessage="Anomalies detected"
                />

                {inferenceTime !== null && (
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
            </h3>
          </div>
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-center d-flex gap-2">
        <Button
          variant="light"
          className="analyze-cpu-button flex-grow-1 py-3 px-5 fw-bold"
          onClick={handleReturnPage}
        >
          Gallery
        </Button>
        <Button
          variant="light"
          className={`analyze-cpu-button flex-grow-1 py-2 px-5 fw-bold ${analysisMode === "cpu" && status !== "idle" ? "active-analysis" : ""}`}
          onClick={() => handleAnalysisClick("cpu")}
        >
          <FormattedMessage
            id="components.QualityInspection.cpuAnalysisButton"
            defaultMessage="CPU Analysis"
          />
        </Button>
        <Button
          variant="light"
          className={`analyze-gpu-button flex-grow-1 py-2 px-5 fw-bold ${analysisMode === "gpu" && status !== "idle" ? "active-analysis" : ""}`}
          onClick={() => handleAnalysisClick("gpu")}
        >
          <FormattedMessage
            id="components.QualityInspection.gpuAnalysisButton"
            defaultMessage="GPU Analysis"
          />
        </Button>
        <Button
          variant="light"
          className={`analyze-npu-button flex-grow-1 py-2 px-5 fw-bold ${analysisMode === "npu" && status !== "idle" ? "active-analysis" : ""}`}
          onClick={() => handleAnalysisClick("npu")}
        >
          <FormattedMessage
            id="components.QualityInspection.npuAnalysisButton"
            defaultMessage="NPU Analysis"
          />
        </Button>
      </div>
    </Container>
  );
};

export default QualityInspectionWebcam;
