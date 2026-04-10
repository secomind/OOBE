import React, { useRef, useState } from "react";
import { Container, Button, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../api/APIClient";
import { logo } from "../assets/images";

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

  const [status, setStatus] = useState("greeting");
  const [results, setResults] = useState<PersonResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [currentTime] = useState(new Date());

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
          const data = await apiClient.getPersonResult(file);
          setResults(data);
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
    setResults([]);
    setError(null);
    setStatus("greeting");
  };

  const handleCaptureAndAnalysis = () => {
    setCaptured(null);
    setResults([]);
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
    navigate("/crowd-and-fall-detection", { state: { autoStart: true } });
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

            {captured && status !== "greeting" && (
              <>
                <div
                  ref={containerRef}
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
                  <Image
                    ref={imageRef}
                    src={captured}
                    className="mw-100 mh-100 shadow-lg"
                    style={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: 960,
                      height: 720,
                    }}
                  />
                </div>

                {status === "result" &&
                  results.map((r, i) => {
                    const img = imageRef.current;
                    const container = containerRef.current;
                    if (!img || !container) return null;

                    const rect = img.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    const scaleX = rect.width / 960;
                    const scaleY = rect.height / 720;

                    const offsetX = rect.left - containerRect.left;
                    const offsetY = rect.top - containerRect.top;

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
                          boxShadow: isFall
                            ? `0 0 15px #FF0000`
                            : `0 0 5px ${boxColor}66`,
                          pointerEvents: "none",
                        }}
                      ></div>
                    );
                  })}
              </>
            )}
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

          <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar mb-3">
            {status === "analysis" ? (
              <div className="d-flex align-items-center gap-3 text-info p-4 bg-dark bg-opacity-50 rounded-4 border border-info border-opacity-25">
                <div className="spinner-border spinner-border-sm" />
                Scanning in progress...
              </div>
            ) : (
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
            )}
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

      <div className="pt-3 d-flex gap-2">
        <Button
          variant="light"
          className="flex-grow-1 py-3 fw-bold"
          onClick={handleReturnPage}
        >
          Gallery
        </Button>
        <Button
          variant="outline-light"
          className="flex-grow-1 py-3 fw-bold border-2"
          onClick={handleCaptureAndAnalysis}
          disabled={status === "analysis"}
        >
          {status === "analysis" ? "Scanning in progress..." : "Start Analysis"}
        </Button>
        <Button
          variant="light"
          className="flex-grow-1 py-3 fw-bold"
          onClick={handleRestartWebcam}
          disabled={status === "greeting"}
        >
          Live Webcam Feedback
        </Button>
      </div>
    </Container>
  );
};

export default CrowdAndFallDetectionWebcam;
