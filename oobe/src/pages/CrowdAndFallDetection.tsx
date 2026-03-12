import { Container, Image, Button } from "react-bootstrap";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, defineMessages } from "react-intl";
import ImageCarousel from "./ImageCarousel";
import AIErrorModal from "../components/AIErrorModal";
import { APIClient } from "../api/APIClient";
import {
  logo,
  elevator_second_floor_1,
  elevator_second_floor_2,
  elevator_second_floor_3,
  elevator_second_floor_4,
  elevator_second_floor_5,
  main_entrance_1,
  main_entrance_2,
  main_entrance_3,
  main_entrance_4,
  main_entrance_5,
  secondary_entrance_1,
  secondary_entrance_2,
  secondary_entrance_3,
  secondary_entrance_4,
  secondary_entrance_5,
} from "../assets/images";
import "./CrowdAndFallDetection.scss";

export type PersonResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

interface CrowdAndFallDetectionProps {
  apiClient: APIClient;
}

const imageOptions = [
  elevator_second_floor_1,
  elevator_second_floor_2,
  elevator_second_floor_3,
  elevator_second_floor_4,
  elevator_second_floor_5,
  main_entrance_1,
  main_entrance_2,
  main_entrance_3,
  main_entrance_4,
  main_entrance_5,
  secondary_entrance_1,
  secondary_entrance_2,
  secondary_entrance_3,
  secondary_entrance_4,
  secondary_entrance_5,
];

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

const messages = defineMessages({
  scanningMessage: {
    id: "crowdDetection.analyseMessage",
    defaultMessage: "Scanning in progress...",
  },
  noPersonsDetected: {
    id: "crowdDetection.noPeople",
    defaultMessage: "No people detected.",
  },
  startAnalysis: {
    id: "crowdDetection.start",
    defaultMessage: "Start Analysis",
  },
  personDetected: {
    id: "crowdDetection.personDetected",
    defaultMessage: "Person detected",
  },
  peopleCounter: {
    id: "crowdDetection.peopleCounter",
    defaultMessage: "PEOPLE COUNTER",
  },
  btnPrevious: { id: "crowdDetection.btnPrevious", defaultMessage: "Previous" },
  btnNext: { id: "crowdDetection.btnNext", defaultMessage: "Next" },
  fallLabel: { id: "crowdDetection.fall", defaultMessage: "FALL" },
  personLabel: { id: "crowdDetection.person", defaultMessage: "PERSON" },
  errorMsg: {
    id: "crowdDetection.error",
    defaultMessage: "Analysis error occurred.",
  },
});

const getLocationTranslationId = (imageSrc: string): string => {
  if (imageSrc.includes("elevator")) return "crowdDetection.location.elevator";
  if (imageSrc.includes("main_entrance"))
    return "crowdDetection.location.mainEntrance";
  if (imageSrc.includes("secondary_entrance"))
    return "crowdDetection.location.secondaryEntrance";
  return "crowdDetection.location.unknown";
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

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.split("/").pop() || "image.png";
  return new File([blob], fileName, { type: blob.type });
};

const CrowdAndFallDetection = ({ apiClient }: CrowdAndFallDetectionProps) => {
  const [results, setResults] = useState<PersonResult[]>([]);
  const [status, setStatus] = useState<"greeting" | "analysis" | "result">(
    "greeting",
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysisTime, setAnalysisTime] = useState<Date | null>(null);
  const [currentImage, setCurrentImage] = useState(imageOptions[0]);
  const [imgRect, setImgRect] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const [showAIErrorModal, setShowAIErrorModal] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const hasFall = results.some((r) => r.categoryId === 1);

  const updateLayout = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container || img.naturalWidth === 0) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = containerWidth / containerHeight;

    let drawWidth, drawHeight;
    if (imageRatio > containerRatio) {
      drawWidth = containerWidth;
      drawHeight = containerWidth / imageRatio;
    } else {
      drawHeight = containerHeight;
      drawWidth = containerHeight * imageRatio;
    }
    setImgRect({
      width: drawWidth,
      height: drawHeight,
      left: (containerWidth - drawWidth) / 2,
      top: (containerHeight - drawHeight) / 2,
    });
  };

  useLayoutEffect(() => {
    const observer = new ResizeObserver(updateLayout);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [currentImage, results]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status !== "analysis") return;
    const processImage = async () => {
      try {
        setResults([]);
        const file = await urlToFile(currentImage);
        const data = await apiClient.getPersonResult(file);
        setResults(data);
        setAnalysisTime(new Date());
        setStatus("result");
      } catch {
        setShowAIErrorModal(true);
        // keep status as 'analysis' so the modal overlays the spinner and user can retry
      }
    };
    processImage();
  }, [apiClient, currentImage, status]);

  const changeImage = (dir: number) => {
    const idx = imageOptions.indexOf(currentImage);
    const next = (idx + dir + imageOptions.length) % imageOptions.length;
    setCurrentImage(imageOptions[next]);
    setStatus("analysis");
  };

  return (
    <Container
      fluid
      className="quality-inspection-container vh-100 d-flex flex-column p-4 bg-black overflow-hidden"
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="link"
          className="text-white p-0"
          onClick={() => navigate("/smart-building")}
        >
          <FontAwesomeIcon icon={faX} size="lg" />
        </Button>
        <Image src={logo} alt="SECO" style={{ height: "30px" }} />
        <div className="text-secondary small">
          {formatFullDate(currentTime)}
        </div>
      </div>

      {status === "greeting" ? (
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <Button
            variant="light"
            size="lg"
            className="fw-bold px-5 py-3 rounded-pill shadow-lg"
            onClick={() => setStatus("analysis")}
          >
            <FormattedMessage {...messages.startAnalysis} />
          </Button>
        </div>
      ) : (
        <div className="row flex-grow-1 overflow-hidden">
          <div className="col-md-7 d-flex flex-column h-100">
            <div
              ref={containerRef}
              className="position-relative flex-grow-1 bg-dark rounded-4 overflow-hidden border border-secondary shadow-lg d-flex align-items-center justify-content-center"
            >
              <div
                className="position-absolute"
                style={{
                  width: imgRect.width,
                  height: imgRect.height,
                  left: imgRect.left,
                  top: imgRect.top,
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {status === "result" &&
                  results.map((r, i) => {
                    const scaleX =
                      imgRect.width / (imageRef.current?.naturalWidth || 1);
                    const scaleY =
                      imgRect.height / (imageRef.current?.naturalHeight || 1);
                    const isFall = r.categoryId === 1;
                    const boxColor = isFall
                      ? "#FF0000"
                      : DETECTION_COLORS[i % DETECTION_COLORS.length];

                    return (
                      <div
                        key={i}
                        className="position-absolute"
                        style={{
                          left: r.bbox[0] * scaleX,
                          top: r.bbox[1] * scaleY,
                          width: r.bbox[2] * scaleX,
                          height: r.bbox[3] * scaleY,
                          border: `3px solid ${boxColor}`,
                          boxShadow: isFall
                            ? `0 0 15px #FF0000`
                            : `0 0 5px ${boxColor}66`,
                        }}
                      ></div>
                    );
                  })}
              </div>
              <Image
                ref={imageRef}
                src={currentImage}
                onLoad={updateLayout}
                className="mw-100 mh-100 shadow-lg"
                style={{ objectFit: "contain" }}
              />
            </div>

            <div className="py-3 mt-auto">
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

          <div className="col-md-5 d-flex flex-column ps-md-4 pb-3 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className={`status-indicator ${hasFall ? "bg-danger animate-pulse" : "bg-success"}`}
              ></div>
              <h2 className="fw-bold h5 text-uppercase m-0 text-white">
                <FormattedMessage
                  id={getLocationTranslationId(currentImage)}
                  defaultMessage="Location"
                />
              </h2>
            </div>

            <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar mb-3">
              {status === "analysis" ? (
                <div className="d-flex align-items-center gap-3 text-info p-4 bg-dark bg-opacity-50 rounded-4 border border-info border-opacity-25">
                  <div className="spinner-border spinner-border-sm" />
                  <FormattedMessage {...messages.scanningMessage} />
                </div>
              ) : (
                <div className="list-group list-group-flush gap-1">
                  {results.length === 0 ? (
                    <div className="p-4 text-center border border-secondary border-opacity-25 rounded-4">
                      <p className="text-secondary small m-0">
                        <FormattedMessage {...messages.noPersonsDetected} />
                      </p>
                    </div>
                  ) : (
                    results.map((r, i) => (
                      <div
                        key={i}
                        className="list-group-item bg-dark bg-opacity-25 text-white border-secondary border-opacity-10 px-3 py-2 rounded-3 d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-secondary smaller">
                            #{i + 1}
                          </span>
                          <span className="fw-medium">
                            <FormattedMessage {...messages.personDetected} />
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-secondary smaller">
                            {analysisTime ? formatFullDate(analysisTime) : ""}
                          </span>
                          {r.categoryId === 1 && (
                            <span className="text-danger small fw-bold d-flex align-items-center gap-1">
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              <FormattedMessage {...messages.fallLabel} />
                            </span>
                          )}
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
                  <FormattedMessage {...messages.peopleCounter} />
                </span>
                <span
                  className={`display-3 fw-black ${hasFall ? "text-danger" : results.length > 0 ? "text-primary" : "text-white"}`}
                  style={{ lineHeight: 1 }}
                >
                  {results.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  className="flex-grow-1 py-3 fw-bold border-2"
                  onClick={() => changeImage(-1)}
                >
                  <FormattedMessage {...messages.btnPrevious} />
                </Button>
                <Button
                  variant="light"
                  className="flex-grow-1 py-3 fw-bold"
                  onClick={() => changeImage(1)}
                >
                  <FormattedMessage {...messages.btnNext} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AIErrorModal
        show={showAIErrorModal}
        onHide={() => {
          setShowAIErrorModal(false);
          setStatus("result");
        }}
        onContinue={async () => {
          try {
            setResults([]);
            const file = await urlToFile(currentImage);
            const data = await apiClient.getPersonResult(file);
            setResults(data || []);
            setAnalysisTime(new Date());
            setStatus("result");
            return true;
          } catch (e) {
            return false;
          }
        }}
        message="if you see this pop-up, please check that the AI service is available or deployed"
      />
    </Container>
  );
};

export default CrowdAndFallDetection;
