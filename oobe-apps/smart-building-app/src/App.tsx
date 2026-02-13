import Sidebar from "./components/Sidebar";
import AstarteAPIClient from "./api/AstarteAPIClient";
import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import HistoryCameraTable from "./components/CameraHistroyTable";
import { CameraHistoryExtended } from "types";

export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const [dataFetching, setDataFetching] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("history");
  const [cameraIds, setCameraIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<
    Record<string, CameraHistoryExtended[]>
  >({});

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
  };

  const astarteClient = useMemo(() => {
    return new AstarteAPIClient({ astarteUrl, realm, token });
  }, [astarteUrl, realm, token]);

  useEffect(() => {
    setDataFetching(true);

    astarteClient
      .getCameraIds(deviceId)
      .then((ids) => {
        setCameraIds(ids);
      })
      .catch(() => {
        setError("Failed to fetch data.");
      })
      .finally(() => {
        setDataFetching(false);
      });
  }, [astarteClient, deviceId]);

  useEffect(() => {
    if (!cameraIds.length) return;

    setDataFetching(true);
    setError(null);

    if (selectedSection === "history") {
      Promise.all(
        cameraIds.map((cameraId) =>
          astarteClient.getCameraHistory({
            deviceId,
            cameraId,
          }),
        ),
      )
        .then((results) => {
          const newData: Record<string, CameraHistoryExtended[]> = {};

          cameraIds.forEach((id, index) => {
            newData[id] = results[index].map((item) => ({
              ...item,
              cameraId: id,
            }));
          });

          setHistoryData(newData);
        })
        .catch(() => {
          setError("Failed to fetch camera history.");
        })
        .finally(() => {
          setDataFetching(false);
        });
    } else {
      if (historyData[selectedSection]) {
        setDataFetching(false);
        return;
      }

      astarteClient
        .getCameraHistory({
          deviceId,
          cameraId: selectedSection,
        })
        .then((data) => {
          const formatted: CameraHistoryExtended[] = data.map((item) => ({
            ...item,
            cameraId: selectedSection,
          }));

          setHistoryData((prev) => ({
            ...prev,
            [selectedSection]: formatted,
          }));
        })
        .catch(() => {
          setError("Failed to fetch camera history.");
        })
        .finally(() => {
          setDataFetching(false);
        });
    }
  }, [selectedSection, cameraIds, astarteClient, deviceId]);

  const visibleData = useMemo(() => {
    const data =
      selectedSection === "history"
        ? Object.values(historyData).flat()
        : historyData[selectedSection] || [];

    return [...data].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
  }, [historyData, selectedSection]);

  return (
    <Row className="app-container p-4">
      <Col xs={4} xl={2} className="border-end position-relative overflow-auto">
        <Sidebar
          activeTab={selectedSection}
          onChange={handleSectionChange}
          cameraIds={cameraIds}
        />
      </Col>
      <Col xs={8} xl={10} className="px-4">
        {dataFetching ? (
          <div className="text-center">
            <div className="d-inline-flex align-items-center justify-content-center m-3">
              <Spinner
                animation="border"
                variant="primary"
                style={{ marginRight: "10px" }}
              />
              <FormattedMessage id="loading" defaultMessage="Loading..." />
            </div>
          </div>
        ) : (
          <>
            {selectedSection === "history" ? (
              <h5>
                <FormattedMessage
                  id="historyTitle"
                  defaultMessage="All Cameras History"
                />
              </h5>
            ) : (
              <h5>{selectedSection}</h5>
            )}
            <HistoryCameraTable
              data={visibleData}
              isAllHistory={selectedSection === "history"}
            />
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
              >
                {error}
              </Alert>
            )}
          </>
        )}
      </Col>
    </Row>
  );
};

export default App;
