import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";

import MapAPIClient, { type LatLng } from "../api/MapAPIClient";
import "./GeolocalizationCard.scss";

const deviceStatus = "Active";
const devicePosition: LatLng = { lat: 45.4642, lng: 9.19 };
const isOnline = deviceStatus === "Active";

const Geolocalization: React.FC = () => {
  const [position] = useState<LatLng | null>(devicePosition);
  const [address, setAddress] = useState<string | null>(null);
  const [addressAvailable, setAddressAvailable] = useState<boolean>(true);

  const mapApiClient = useMemo(() => new MapAPIClient(), []);

  const fetchAddress = useCallback(
    (position: LatLng | null) => {
      if (!position) return;

      mapApiClient
        .getAddress(position)
        .then((data) => {
          if (!data || !data.address) {
            setAddress(null);
            setAddressAvailable(false);
          } else {
            const addr = data.address;
            const addressStr = [
              `${addr.postcode ?? ""} ${addr.city ?? addr.town ?? addr.village ?? ""}`.trim(),
              addr.country ?? "",
            ]
              .filter(Boolean)
              .join(", ");

            setAddress(addressStr);
            setAddressAvailable(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
          setAddressAvailable(false);
        });
    },
    [mapApiClient],
  );

  useEffect(() => {
    fetchAddress(position);
  }, [position, fetchAddress]);

  return (
    <Card className="geoloc-card bg-dark rounded-5 border-secondary border-2">
      <Card.Body className="d-flex flex-column mt-2">
        <Card.Title className="fw-bold mb-4 fs-4 ms-3 text-light">
          <FormattedMessage
            id="components.GeolocalizationCard.title"
            defaultMessage="Geolocalization"
          />
        </Card.Title>

        {!isOnline ? (
          <div className="offline-state d-flex flex-column align-items-center justify-content-center flex-grow-1">
            <h6 className="fw-semibold mt-3 text-light">
              <FormattedMessage
                id="components.GeolocalizationCard.offline"
                defaultMessage="Device Offline"
              />
            </h6>
            <p className="text-secondary text-center px-3">
              <FormattedMessage
                id="components.GeolocalizationCard.offlineDescription"
                defaultMessage="Geolocation will be available once the device is connected to the internet."
              />
            </p>
          </div>
        ) : !position ? (
          <div className="loading-state d-flex align-items-center justify-content-center flex-grow-1">
            <p className="text-secondary text-center">
              <FormattedMessage
                id="components.GeolocalizationCard.loading"
                defaultMessage="Loading position..."
              />
            </p>
          </div>
        ) : (
          <div className="map-wrapper flex-grow-1">
            <MapContainer
              center={position}
              zoom={17}
              scrollWheelZoom={true}
              className="map-container"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker position={position}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {addressAvailable ? (
                    address || (
                      <FormattedMessage
                        id="components.GeolocalizationCard.loadingAddress"
                        defaultMessage="Loading address..."
                      />
                    )
                  ) : (
                    <FormattedMessage
                      id="components.GeolocalizationCard.addressUnavailable"
                      defaultMessage="Address unavailable"
                    />
                  )}
                </Tooltip>

                <Popup>
                  {addressAvailable && address ? (
                    <>
                      <strong>
                        <FormattedMessage
                          id="components.GeolocalizationCard.addressLabel"
                          defaultMessage="Address:"
                        />
                      </strong>{" "}
                      {address}
                      <br />
                      <strong>
                        <FormattedMessage
                          id="components.GeolocalizationCard.statusLabel"
                          defaultMessage="Status:"
                        />
                      </strong>{" "}
                      {deviceStatus}
                    </>
                  ) : (
                    <FormattedMessage
                      id="components.GeolocalizationCard.addressUnavailable"
                      defaultMessage="Address unavailable"
                    />
                  )}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Geolocalization;
