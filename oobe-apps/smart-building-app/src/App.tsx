import AstarteAPIClient from "./api/AstarteAPIClient";
import { useEffect, useMemo, useState } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import HistoryCameraTable from "./components/CameraHistroyTable";
import { CameraHistoryData } from "types";
import DataSection from "./components/DataSection";
import RangeSelect, {
  DateRange,
  isRangePreset,
  presetToDateRange,
  RangePreset,
} from "./components/RangeSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import LineChart from "./components/LineChart";

export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const intl = useIntl();
  const [dataFetching, setDataFetching] = useState(false);
  const [_cameraIds, setCameraIds] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<CameraHistoryData[]>([]);
  const [selectedRange, setSelectedRange] = useState<RangePreset | DateRange>(
    "Day",
  );
  const [weeklyStats, setWeeklyStats] = useState({
    totalPeople: 0,
    singlePerson: 0,
    groups: 0,
    busiestTime: "",
  });

  const astarteClient = useMemo(() => {
    return new AstarteAPIClient({ astarteUrl, realm, token });
  }, [astarteUrl, realm, token]);

  const [start, end] = useMemo(() => {
    const value = selectedRange ?? "Week";
    return isRangePreset(value)
      ? presetToDateRange(value)
      : (value as DateRange);
  }, [selectedRange]);

  const fetchHistory = (start: Date, end: Date) => {
    setDataFetching(true);

    astarteClient
      .getCameraIds(deviceId)
      .then((ids) => {
        setCameraIds(ids);

        return Promise.all(
          ids.map((cameraId) =>
            astarteClient.getCameraHistory({
              deviceId,
              cameraId,
              since: start,
              to: end,
            }),
          ),
        );
      })
      .then((results) => {
        const combined: CameraHistoryData[] = results
          .flat()
          .sort(
            (a, b) =>
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
          );

        setHistoryData(combined);
      })
      .catch(() => {
        [];
      })
      .finally(() => {
        setDataFetching(false);
      });
  };

  const calculateWeeklyStats = (combined: CameraHistoryData[], intl: any) => {
    let totalPeople = 0;
    let singlePerson = 0;
    let groups = 0;
    let busiestTime = "";
    let maxGroupCount = 0;
    let latestTime = 0;

    const personDetectedPerHour: Record<number, number> = {};

    for (const item of combined) {
      const time = new Date(item.datetime).getTime();
      const count = item.numberOfPeople ?? 0;

      if (item.event === "Person detected") {
        singlePerson += 1;
        totalPeople += 1;

        const hour = new Date(item.datetime).getHours();
        personDetectedPerHour[hour] = (personDetectedPerHour[hour] ?? 0) + 1;
      } else if (item.event === "Group of people") {
        groups += 1;
        totalPeople += count;

        if (
          count > maxGroupCount ||
          (count === maxGroupCount && time > latestTime)
        ) {
          maxGroupCount = count;
          latestTime = time;

          const date = new Date(item.datetime);
          const roundedDate = new Date(date);
          roundedDate.setMinutes(date.getMinutes() >= 30 ? 60 : 0);

          busiestTime = intl.formatTime(roundedDate, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
      }
    }

    if (groups === 0 && Object.keys(personDetectedPerHour).length > 0) {
      const busiestHour = Object.keys(personDetectedPerHour).reduce(
        (busiestHour, hour) =>
          personDetectedPerHour[+hour] >
          (personDetectedPerHour[+busiestHour] ?? 0)
            ? hour
            : busiestHour,
        "0",
      );

      const date = new Date();
      date.setHours(+busiestHour, 0, 0, 0);

      busiestTime = intl.formatTime(date, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    return { totalPeople, singlePerson, groups, busiestTime };
  };

  const fetchWeeklyStats = () => {
    const [weekStart, weekEnd] = presetToDateRange("Week");

    setDataFetching(true);

    astarteClient
      .getCameraIds(deviceId)
      .then((ids) =>
        Promise.all(
          ids.map((cameraId) =>
            astarteClient.getCameraHistory({
              deviceId,
              cameraId,
              since: weekStart,
              to: weekEnd,
            }),
          ),
        ),
      )
      .then((results) => {
        const combined: CameraHistoryData[] = results.flat();
        const stats = calculateWeeklyStats(combined, intl);
        setWeeklyStats(stats);
      })
      .catch(() => {
        setWeeklyStats({
          totalPeople: 0,
          singlePerson: 0,
          groups: 0,
          busiestTime: "",
        });
      })
      .finally(() => {
        setDataFetching(false);
      });
  };

  useEffect(() => {
    fetchHistory(start, end);
  }, [start, end, deviceId, astarteClient]);

  useEffect(() => {
    fetchWeeklyStats();
  }, [deviceId, astarteClient]);

  return (
    <Row className="app-container p-4">
      <Col>
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
            <div className="d-flex justify-content-between align-items-center">
              <h5>
                <FormattedMessage
                  id="appTitle"
                  defaultMessage="People counter"
                />
              </h5>

              <div className="d-flex align-items-center gap-3">
                <FontAwesomeIcon
                  icon={faSync}
                  style={{ color: "var(--bs-primary)", width: "1.1em" }}
                  onClick={() => fetchHistory(start, end)}
                />
                <RangeSelect
                  value={selectedRange}
                  isDisabled={dataFetching}
                  onChange={setSelectedRange}
                />
              </div>
            </div>

            <hr />
            <h6>
              <FormattedMessage
                id="highestValue"
                defaultMessage="Highest Values Recorded This Week"
              />
            </h6>
            <Row xl={4} xs={1} className="mt-4">
              <Col>
                <DataSection
                  label={
                    <FormattedMessage
                      id="totalPeople"
                      defaultMessage="Total People"
                    />
                  }
                  value={weeklyStats.totalPeople}
                />
              </Col>
              <Col>
                <DataSection
                  label={
                    <FormattedMessage
                      id="singlePerson"
                      defaultMessage="Single Person"
                    />
                  }
                  value={weeklyStats.singlePerson}
                />
              </Col>
              <Col>
                <DataSection
                  label={
                    <FormattedMessage id="groups" defaultMessage="Groups" />
                  }
                  value={weeklyStats.groups}
                />
              </Col>
              <Col>
                <DataSection
                  label={
                    <FormattedMessage
                      id="busiestTime"
                      defaultMessage="Busiest Time"
                    />
                  }
                  value={weeklyStats.busiestTime}
                />
              </Col>
            </Row>

            <hr />
            <h5>
              <FormattedMessage id="historyTable" defaultMessage="History" />
            </h5>

            <HistoryCameraTable data={historyData} />
            <hr />
            <div className="d-flex justify-content-center">
              <LineChart data={historyData} minX={start} maxX={end} />
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default App;
