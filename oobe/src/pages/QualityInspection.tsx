import { Container, Image, Button } from "react-bootstrap";
import { logo } from "../assets/images";
import "./QualityInspection.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
import { useState, useEffect } from "react";
import {
  embeddedSBCFront,
  embeddedSBCFrontScanned,
  embeddedSBCBack,
} from "../assets/images";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  scanningMessage: {
    id: "qualityInspection.analyseMessage",
    defaultMessage: "Scanning in progress...",
  },
  anomaliesDetectedMessage: {
    id: "qualityInspection.anomaliesDetectedMessage",
    defaultMessage: "Anomalies detected",
  },
  upsideDownMessage: {
    id: "qualityInspection.upsideDownMessage",
    defaultMessage: "The board is upside down",
  },
  compliantProduct: {
    id: "qualityInspection.Compliant product",
    defaultMessage: "Compliant product!",
  },
});

const QualityInspection = () => {
  const [status, setStatus] = useState("greeting");
  const [currentImage, setCurrentImage] = useState(embeddedSBCFront);
  const [successfullScan, setSuccessfulScan] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        status === "analysis" &&
        currentImage === embeddedSBCFront &&
        !successfullScan
      ) {
        setStatus("result");
        setCurrentImage(embeddedSBCFrontScanned);
      } else if (status === "analysis" && currentImage === embeddedSBCBack) {
        setStatus("result");
      } else {
        setStatus("result");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, currentImage, successfullScan]);

  return (
    <Container
      fluid
      className="quality-inspection-container vh-100 d-flex flex-column p-4 bg-black text-white"
    >
      <div className="d-flex justify-content-between align-items-start w-100 mb-4">
        {status != "greeting" && (
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
            defaultMessage="Place the object in front of the camera within the detection area."
          />
        </h2>
      </div>

      {status != "greeting" && (
        <div className="row flex-grow-1 align-items-center mb-5 ">
          <div className="col-md-6 d-flex justify-content-center mx-auto ">
            <div className="overflow-hidden ">
              <Image src={currentImage} alt="Sample" fluid className="image" />
            </div>
          </div>

          <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
            <div className="mb-5 text-center">
              {status === "analysis" && (
                <div className="spinner-border mb-5 spinner" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
              <h3 className="fw-bold">
                <FormattedMessage
                  {...(status === "analysis"
                    ? messages.scanningMessage
                    : currentImage === embeddedSBCFrontScanned
                      ? messages.anomaliesDetectedMessage
                      : currentImage === embeddedSBCBack
                        ? messages.upsideDownMessage
                        : messages.compliantProduct)}
                />
              </h3>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-auto mb-4">
              <div>
                <Button
                  variant="light"
                  disabled={status === "analysis"}
                  className="analysis-result-left-button py-2 px-5 fw-bold"
                  onClick={() => {
                    if (currentImage === embeddedSBCFrontScanned) {
                      setStatus("analysis");
                      setCurrentImage(embeddedSBCFront);
                    } else if (
                      currentImage === embeddedSBCFront &&
                      successfullScan
                    ) {
                      setStatus("analysis");
                    } else if (currentImage === embeddedSBCBack)
                      setStatus("analysis");
                  }}
                >
                  <FormattedMessage
                    id="components.QualityInspection.tryAgainButton"
                    defaultMessage="Try Again"
                  />
                </Button>
              </div>

              <div>
                <Button
                  variant="light"
                  className="analysis-result-right-button py-2 px-5 fw-bold"
                  onClick={() => {
                    if (
                      currentImage === embeddedSBCFront ||
                      currentImage === embeddedSBCFrontScanned
                    ) {
                      setCurrentImage(embeddedSBCBack);
                      setStatus("analysis");
                    } else if (currentImage === embeddedSBCBack) {
                      setStatus("analysis");
                      setCurrentImage(embeddedSBCFront);
                      setSuccessfulScan(true);
                    }
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
