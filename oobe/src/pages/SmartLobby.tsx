import { useState } from "react";
import { Container, Row, Col, Image, Button, Form } from "react-bootstrap";
import { logo, expand } from "../assets/images";
import carImg from "../assets/images/car.jpg";
import "./SmartLobby.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import ElectricityMeterModal from "../components/ElectricityMeterModal";

const chats = [
  {
    id: 1,
    name: "Administrator",
    msg: "Condominium meeting tomorrow.",
    avatar: "https://i.pravatar.cc/40?img=12",
    time: "2d",
  },
  {
    id: 2,
    name: "Hall Doorman",
    msg: "Your package has arrived.",
    avatar: "https://i.pravatar.cc/40?img=15",
    time: "4d",
  },
  {
    id: 3,
    name: "Emily Carter",
    msg: "Please review the documents.",
    avatar: "https://i.pravatar.cc/40?img=17",
    time: "1d",
  },
  {
    id: 4,
    name: "Security",
    msg: "Elevator maintenance tomorrow.",
    avatar: "https://i.pravatar.cc/40?img=20",
    time: "3d",
  },
  {
    id: 5,
    name: "Maintenance",
    msg: "Water outage from 2-4 PM.",
    avatar: "https://i.pravatar.cc/40?img=25",
    time: "5h",
  },
  {
    id: 6,
    name: "Janitor",
    msg: "Cleaning schedule updated.",
    avatar: "https://i.pravatar.cc/40?img=28",
    time: "6h",
  },
  {
    id: 7,
    name: "Reception",
    msg: "Visitor at the lobby.",
    avatar: "https://i.pravatar.cc/40?img=30",
    time: "2d",
  },
];

const electricityMeterData = {
  customer: "Emily Carter – Apt. 4B",
  meterId: "ELM-4728391",
  readingDate: "06 August 2025 – 14:35",
  currentReading: "12,478.6 kWh",
  previousReading: "12,312.4 kWh",
  periodConsumption: "166.2 kWh",
  currentTariff: "€0.21 / kWh",
  estimatedCost: "€34.90",
  peakDemand: "5.2 kW",
  averageDailyUsage: "23.7 kWh",
  status: "Normal",
};

export default function SmartLobby() {
  const [page, setPage] = useState(0);
  const chatsPerPage = 4;
  const totalPages = Math.ceil(chats.length / chatsPerPage);
  const [showModal, setShowModal] = useState(false);
  const todayFormattedDate = new Date().toLocaleDateString("en-GB");

  return (
    <Container
      fluid
      className="smart-lobby-container d-flex flex-column min-vh-100 p-3"
    >
      <Row className="justify-content-center mb-4">
        <Col
          xs={2}
          sm={6}
          md="auto"
          className="d-flex align-items-center justify-content-center"
        >
          <NavLink to="/smart-building" className="nav-link">
            <Button className="close-icon-button text-white btn-dark">
              <FontAwesomeIcon icon={faX} />
            </Button>
          </NavLink>
        </Col>
        <Col className="text-center">
          <Image src={logo} alt="Logo" className="logo" />
        </Col>
      </Row>
      <Row className="flex-grow-1 gx-4 gy-4 h-100 align-items-stretch">
        <Col lg={3} className="d-flex flex-column gap-4 h-100">
          <div className="panel profile-panel d-flex flex-column justify-content-between flex-grow-1">
            <div>
              <Image
                src="https://i.pravatar.cc/120?img=47"
                className="avatar mb-3"
              />
              <h5 className="fw-bold text-uppercase">
                <FormattedMessage
                  id="pages.SmartLobby.profile.name"
                  defaultMessage="EMILY CARTER"
                />
              </h5>
              <div className="profile-info mt-3">
                <div className="row-item d-flex justify-content-between align-items-center">
                  <span>
                    <FormattedMessage
                      id="pages.SmartLobby.profile.inbox"
                      defaultMessage="INBOX MESSAGES"
                    />
                  </span>
                  <span className="position-relative">
                    <span className="value">2</span>
                    <span className="badge-dot" />
                  </span>
                </div>
                <div className="row-item d-flex justify-content-between align-items-center">
                  <span>
                    <FormattedMessage
                      id="pages.SmartLobby.profile.nextRent"
                      defaultMessage="NEXT RENT PAYMENT"
                    />
                  </span>
                  <span className="value">10/08/2025</span>
                </div>
                <div className="row-item d-flex justify-content-between align-items-center">
                  <span>
                    <FormattedMessage
                      id="pages.SmartLobby.profile.nextMeeting"
                      defaultMessage="NEXT CONDO MEETING"
                    />
                  </span>
                  <span className="muted">
                    <FormattedMessage
                      id="pages.SmartLobby.profile.unscheduled"
                      defaultMessage="Unscheduled"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel locker-panel d-flex flex-column justify-content-between flex-grow-1">
            <Row className="align-items-center mb-3 gx-0">
              <Col>
                <Row className="align-items-center justify-content-between gx-0">
                  <Col>
                    <FormattedMessage
                      id="pages.SmartLobby.locker.title"
                      defaultMessage="SMART LOCKER"
                    />
                  </Col>
                  <Col xs="auto" className="position-relative">
                    <span className="position-relative d-inline-block">
                      1 Package
                    </span>
                    <span className="badge-dot" />
                  </Col>
                </Row>
              </Col>
            </Row>
            <p className="locker-text text-start mb-3">
              <FormattedMessage
                id="pages.SmartLobby.locker.description"
                defaultMessage="Scan the QR code with the Condominium App to unlock your smart locker."
              />
            </p>
            <Row className="justify-content-center gx-0">
              <Col xs="auto">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=LOCKER"
                  className="qr"
                />
              </Col>
            </Row>
          </div>
        </Col>
        <Col lg={9} className="d-flex flex-column gap-4 h-100">
          <div className="panel car-panel d-flex position-relative flex-grow-1">
            <div className="car-left position-relative flex-grow-1 d-flex flex-column justify-content-center">
              <Row className="align-items-center car-item-wrapper gx-0">
                <Col xs="auto" className="d-flex flex-column white-dots">
                  <span className="side"></span>
                  <span className="side"></span>
                  <span className="side"></span>
                  <span className="side"></span>
                </Col>
                <Col className="car-text d-flex flex-column justify-content-center">
                  <h2>
                    <FormattedMessage
                      id="pages.SmartLobby.car.title"
                      defaultMessage="CAR"
                    />
                  </h2>
                  <div className="underline" />
                </Col>
              </Row>
              <p className="mt-5 text-white price-text">
                <FormattedMessage
                  id="pages.SmartLobby.car.price"
                  defaultMessage="Starting from {price}"
                  values={{ price: "17.000€" }}
                />
              </p>
            </div>
            <div className="car-right d-flex justify-content-center align-items-center">
              <Image src={carImg} />
            </div>
            <div className="slider-dots">
              <span className="bg-light"></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <Row className="flex-grow-1 gx-4 gy-4 h-100 align-items-stretch">
            <Col lg={8} className="d-flex flex-column gap-4 h-100">
              <div className="panel messages-panel d-flex flex-column justify-content-between flex-grow-1">
                <h6 className="mb-3">
                  <FormattedMessage
                    id="pages.SmartLobby.messages.title"
                    defaultMessage="Messages"
                  />
                </h6>
                <div
                  className="chat-slider-wrapper flex-grow-1"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="chat-slider d-flex"
                    style={{
                      transform: `translateX(-${page * 100}%)`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <div
                        key={idx}
                        className="d-flex flex-column gap-2"
                        style={{ flex: "0 0 100%" }}
                      >
                        {chats
                          .slice(idx * chatsPerPage, (idx + 1) * chatsPerPage)
                          .map((chat) => (
                            <Row
                              key={chat.id}
                              className="message-row align-items-center mb-2 gx-0"
                            >
                              <Col xs="auto">
                                <Image src={chat.avatar} roundedCircle />
                              </Col>
                              <Col>
                                <b>{chat.name}</b>
                                <p>{chat.msg}</p>
                              </Col>
                              <Col xs="auto" className="position-relative">
                                <span className="position-relative d-inline-block">
                                  {chat.time}
                                </span>
                                <span className="badge-dot" />
                              </Col>
                            </Row>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`pagination-dot ${page === idx ? "active" : ""}`}
                      onClick={() => setPage(idx)}
                    />
                  ))}
                </div>
              </div>
            </Col>
            <Col lg={4} className="d-flex flex-column gap-4 h-100">
              <div className="panel weather-panel d-flex flex-column justify-content-center text-center flex-grow-1">
                <h1>
                  <FormattedMessage
                    id="pages.SmartLobby.weather.temp"
                    defaultMessage="28°c"
                  />
                </h1>
                <p className="d-block locker-text">
                  <FormattedMessage
                    id="pages.SmartLobby.weather.day"
                    defaultMessage="Monday"
                  />
                </p>
                <p className="d-block locker-text">
                  <FormattedMessage
                    id="pages.SmartLobby.weather.location"
                    defaultMessage="New York, USA"
                  />
                </p>
                <Form.Text className="icon d-block">☀️</Form.Text>
              </div>

              <div className="panel assistant-panel d-flex flex-column justify-content-between text-center flex-grow-1 position-relative">
                <h3 className="locker-text">
                  <FormattedMessage
                    id="pages.SmartClinical.realTimeAssistant"
                    defaultMessage="Real time assistant"
                  />
                </h3>
                <p className="text-start mb-3">
                  <FormattedMessage
                    id="pages.SmartClinical.realTimeAssistantMessage"
                    defaultMessage="Of course, here is the last laboratory test for the patient."
                  />
                </p>
                <Button
                  variant="outline-light p-4"
                  onClick={() => setShowModal(true)}
                  className="d-flex align-items-center justify-content-between w-100 mt-auto locker-text"
                >
                  <FormattedMessage
                    id="pages.SmartLobby.ElectricityMeterReading"
                    defaultMessage="Electricity Meter Reading"
                  />
                  - {todayFormattedDate}
                  <Image
                    src={expand}
                    alt="expand"
                    fluid
                    rounded
                    className="expand-img"
                  />
                </Button>
                <div className="slider-dots">
                  <span className="bg-light"></span>
                  <span className="bg-light"></span>
                  <span className="bg-light"></span>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <ElectricityMeterModal
        show={showModal}
        onHide={() => setShowModal(false)}
        data={electricityMeterData}
      />
    </Container>
  );
}
