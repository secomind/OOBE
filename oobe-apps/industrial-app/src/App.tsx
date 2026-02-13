import { useEffect, useMemo, useState } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import Sidebar from "./components/Sidebar";
import DashboardStats from "./components/DashboardStats";
import DashboardFilters from "./components/DashboardFilters";
import AstarteAPIClient, { LineData } from "./api/AstarteAPIClient";

export type FilterType = "day" | "week" | "month" | "year" | "custom";
export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const [dataFetching, setDataFetching] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("line");
  const [lineIds, setLineIds] = useState<string[]>([]);
  const [linesDataMap, setLinesDataMap] = useState<Record<string, LineData[]>>(
    {},
  );

  const [filterType, setFilterType] = useState<FilterType>("day");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const astarteClient = useMemo(
    () => new AstarteAPIClient({ astarteUrl, realm, token }),
    [astarteUrl, realm, token],
  );

  const initApp = async () => {
    setDataFetching(true);
    try {
      const ids = await astarteClient.getLineIds(deviceId);
      setLineIds(ids);
      const tempMap: Record<string, LineData[]> = {};
      await Promise.all(
        ids.map(async (id) => {
          const res = await astarteClient.getLinesData({
            deviceId,
            lineId: id,
          });
          tempMap[id] = res;
        }),
      );
      setLinesDataMap(tempMap);
    } catch (e) {
      console.error(e);
    } finally {
      setDataFetching(false);
    }
  };
  const handleResetAll = async () => {
    setFilterType("day");
    setDateRange([new Date(), null]);
    await initApp();
  };

  useEffect(() => {
    initApp();
  }, [astarteClient, deviceId]);

  const filteredData = useMemo(() => {
    let baseData =
      selectedSection === "line"
        ? Object.values(linesDataMap).flat()
        : linesDataMap[selectedSection] || [];
    const now = new Date();
    return baseData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      if (filterType === "day")
        return itemDate.toDateString() === now.toDateString();
      if (filterType === "week") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return itemDate >= d;
      }
      if (filterType === "month")
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      if (filterType === "year")
        return itemDate.getFullYear() === now.getFullYear();
      if (filterType === "custom" && startDate) {
        if (!endDate)
          return itemDate.toDateString() === startDate.toDateString();
        const endLimit = new Date(endDate);
        endLimit.setHours(23, 59, 59);
        return itemDate >= startDate && itemDate <= endLimit;
      }
      return true;
    });
  }, [selectedSection, linesDataMap, filterType, startDate, endDate]);

  return (
    <Row className="app-container bg-light min-vh-100 m-0 p-0">
      <Col xs={4} xl={2} className="border-end shadow-sm bg-white p-0 pt-4">
        <Sidebar
          activeTab={selectedSection}
          onChange={setSelectedSection}
          lineIds={lineIds}
        />
      </Col>
      <Col xs={8} xl={10} className="p-0">
        <DashboardFilters
          activeId={selectedSection}
          filterType={filterType}
          onFilterChange={setFilterType}
          onRefresh={handleResetAll}
          startDate={startDate}
          endDate={endDate}
          onDateChange={setDateRange}
        />
        <div className="px-4">
          {dataFetching ? (
            <div className="text-center mt-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <DashboardStats
              data={filteredData}
              activeLinesCount={selectedSection === "line" ? lineIds.length : 1}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default App;
