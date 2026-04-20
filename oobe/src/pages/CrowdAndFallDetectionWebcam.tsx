import React, { useRef, useState, useMemo } from "react";
import { Container, Button, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APIClient, type AnalysisMode } from "../api/APIClient";
import { logo } from "../assets/images";
import { FormattedMessage } from "react-intl";

const DETECTION_COLORS = [
  "#00FF00",
  "#FFD700",
  "#00FFFF",
  "#FF00FF",
  "#1E90FF",
  "#ADFF2F",
  "#FF69B4",
  "#00FA9A",
  "#87CEEB",
  "#FFFFFF",
];

export type PersonResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

const CrowdAndFallDetectionWebcam = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnalyzingRef = useRef(false);

  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState<PersonResult[]>([]);
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
          ctx.drawImage(videoRef.current, 0, 0, 980, 720);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvasRef.current?.toBlob((b) => resolve(b), "image/jpeg", 0.6),
          );

          if (blob && active && status === "greeting") {
            const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
            const data = await apiClient.getPersonResult(file, analysisMode);
            if (active && status === "greeting") {
              const url = URL.createObjectURL(blob);
              setCaptured((prev) => {
                if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                return url;
              });
              setResults(data.results);
              setInferenceTime(data.inferenceTime);
            }
          }
        }
      } catch (err) {
        console.error("Loop analysis error:", err);
      } finally {
        isAnalyzingRef.current = false;
        if (active && status === "greeting") {
          setTimeout(analyzeLoop, 50);
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
    navigate("/crowd-and-fall-detection", { state: { autoStart: true } });
  };

  const renderBBoxes = () => {
    const media = imageRef.current || videoRef.current;
    const container = containerRef.current;
    if (!media || !container || results.length === 0) return null;

    const rect = media.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scaleX = rect.width / 980;
    const scaleY = rect.height / 720;

    const offsetX = rect.left - containerRect.left;
    const offsetY = rect.top - containerRect.top;

    return results.map((r, i) => {
      const isFall = r.categoryId === 1;
      const boxColor = isFall
        ? "#FF0000"
        : DETECTION_COLORS[i % DETECTION_COLORS.length];
      return (
        <div
          key={i}
          className="position-absolute"
          style={{
            left: offsetX + r.bbox[0] * scaleX,
            top: offsetY + r.bbox[1] * scaleY,
            width: r.bbox[2] * scaleX,
            height: r.bbox[3] * scaleY,
            border: `3px solid ${boxColor}`,
            boxShadow: isFall ? `0 0 15px #FF0000` : `0 0 5px ${boxColor}66`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      );
    });
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
                width={980}
                height={720}
                autoPlay
                muted
                playsInline
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  aspectRatio: "980 / 720",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
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
                    style={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      aspectRatio: "980 / 720",
                    }}
                  />
                ) : (
                  <div className="spinner-border text-light" role="status" />
                )}
                <canvas
                  ref={canvasRef}
                  width={980}
                  height={720}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {renderBBoxes()}
          </div>
        </div>

        <div className="col-md-5 d-flex flex-column ps-md-4 pb-3 h-100">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              className={`status-indicator ${results.some((r) => r.categoryId === 1) ? "bg-danger animate-pulse" : "bg-success"}`}
            ></div>
            <h2 className="fw-bold h5 text-uppercase m-0 text-white">
              Live Webcam
            </h2>
          </div>

          {inferenceTime !== null && (
            <div
              className="mb-2"
              style={{
                fontSize: "1rem",
                color: "#fff",
                fontStyle: "italic",
              }}
            >
              Inference time: <strong>{inferenceTime.toFixed(2)} ms</strong>
            </div>
          )}

          <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar mb-3">
            <div className="list-group list-group-flush gap-1">
              {results.length === 0 ? (
                <div className="p-4 text-center border border-secondary border-opacity-25 rounded-4">
                  <p className="text-secondary small m-0">
                    No people detected.
                  </p>
                </div>
              ) : (
                results.map((r, i) => (
                  <div
                    key={i}
                    className="list-group-item bg-dark bg-opacity-25 text-white border-secondary border-opacity-10 px-3 py-2 rounded-3 d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary smaller">#{i + 1}</span>
                      <span className="fw-medium">Person detected</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-top border-secondary border-opacity-50">
            <div className="d-flex justify-content-between align-items-end mb-3">
              <span className="text-secondary text-uppercase small fw-bold tracking-wider">
                PEOPLE COUNTER
              </span>
              <span
                className={`display-3 fw-black ${
                  results.some((r) => r.categoryId === 1)
                    ? "text-danger"
                    : results.length > 0
                      ? "text-primary"
                      : "text-white"
                }`}
                style={{ lineHeight: 1 }}
              >
                {results.length.toString().padStart(2, "0")}
              </span>
            </div>
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
            id="components.CrowdAndFallDetection.cpuAnalysisButton"
            defaultMessage="CPU Analysis"
          />
        </Button>
        <Button
          variant="light"
          className={`analyze-gpu-button flex-grow-1 py-2 px-5 fw-bold ${analysisMode === "gpu" && status !== "idle" ? "active-analysis" : ""}`}
          onClick={() => handleAnalysisClick("gpu")}
        >
          <FormattedMessage
            id="components.CrowdAndFallDetection.gpuAnalysisButton"
            defaultMessage="GPU Analysis"
          />
        </Button>
        <Button
          variant="light"
          className={`analyze-npu-button flex-grow-1 py-2 px-5 fw-bold ${analysisMode === "npu" && status !== "idle" ? "active-analysis" : ""}`}
          onClick={() => handleAnalysisClick("npu")}
        >
          <FormattedMessage
            id="components.CrowdAndFallDetection.npuAnalysisButton"
            defaultMessage="NPU Analysis"
          />
        </Button>
      </div>
    </Container>
  );
};

export default CrowdAndFallDetectionWebcam;
