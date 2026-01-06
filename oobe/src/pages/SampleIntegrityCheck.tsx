import { Container, Image, Button } from "react-bootstrap";
import { logo } from "../assets/images";
import "./SampleIntegrityCheck.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
import { useState, useEffect } from "react";
import { redPills, redPillsScanned, whitePills } from "../assets/images";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  scanningMessage: {
    id: "SampleIntegrityCheck.analyseMessage",
    defaultMessage: "Scanning in progress...",
  },
  anomaliesDetectedMessage: {
    id: "SampleIntegrityCheck.anomaliesDetectedMessage",
    defaultMessage: "Anomalies detected",
  },
  compliantProduct: {
    id: "SampleIntegrityCheck.Compliant product",
    defaultMessage: "Compliant product!",
  },
});

const SampleIntegrityCheck = () => {
  const [status, setStatus] = useState("greeting");
  const [currentImage, setCurrentImage] = useState(redPills);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "analysis" && currentImage === redPills) {
        setStatus("result");
        setCurrentImage(redPillsScanned);
      } else if (status === "analysis" && currentImage === whitePills) {
        setStatus("result");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, currentImage]);

  return (
    <Container
      fluid
      className="integrity-container vh-100 d-flex flex-column p-4 bg-black text-white"
    >
      <div className="d-flex justify-content-between align-items-start w-100 mb-4">
        {status != "greeting" && (
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
                    : currentImage === redPillsScanned
                      ? messages.anomaliesDetectedMessage
                      : messages.compliantProduct)}
                />
              </h3>
            </div>

            <div className="d-flex justify-content-center mt-5">
              <Button
                variant="light"
                className="analysis-result-button py-2 px-5 fw-bold"
                onClick={() => {
                  if (
                    currentImage === redPills ||
                    currentImage === redPillsScanned
                  ) {
                    setCurrentImage(whitePills);
                    setStatus("analysis");
                  }
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
