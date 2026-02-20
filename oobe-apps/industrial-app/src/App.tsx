import { useEffect, useMemo, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import AstarteAPIClient from "./api/AstarteAPIClient";
import TopBar from "./components/TopBar";
import { isRangePreset, presetToDateRange } from "./components/RangeSelect";
import StatsOverview from "./components/StatsOverview";
import IndustrialBarChart from "./components/IndustrialBarChart";
import { ImageData } from "types";
import { FormattedMessage, useIntl } from "react-intl";

const TOP_PRODUCTS = [
  "APL-45Z689 pcs",
  "ART-PLQ77673 pcs",
  "HAS-34-6017-07_50665 pcs",
  "SF-2110-HAS-01-00657 pcs",
  "SMD-X330656 pcs",
];

type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const intl = useIntl();
  const [dataFetching, setDataFetching] = useState(false);
  const [imagesData, setImagesData] = useState<Record<string, ImageData>>({});
  const [statsImagesData, setStatsImagesData] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<any>("Day");

  const astarteClient = useMemo(() => {
    return new AstarteAPIClient({ astarteUrl, realm, token });
  }, [astarteUrl, realm, token]);

  const [since, to] = useMemo(() => {
    return isRangePreset(selectedRange)
      ? presetToDateRange(selectedRange)
      : selectedRange;
  }, [selectedRange]);

  const fetchData = () => {
    if (!astarteClient || !deviceId) return;

    setDataFetching(true);
    setError(null);

    astarteClient
      .getImagesData(deviceId, since, to)
      .then((data) => {
        setImagesData(data);
        const allImagesArray = Object.values(data);
        setStatsImagesData(allImagesArray);
      })
      .catch(() => {
        setError(
          intl.formatMessage({
            id: "fetchData.error",
            defaultMessage: "Failed to fetch data.",
          }),
        );
        setImagesData({});
        setStatsImagesData([]);
      })
      .finally(() => {
        setDataFetching(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [astarteClient, deviceId, since, to]);

  const categories = Object.keys(imagesData);

  const series = [
    {
      name: intl.formatMessage({
        id: "chart.shortCircuit",
        defaultMessage: "Short Circuit (SC)",
      }),
      data: categories.map((key) => imagesData[key].shortCircuit),
    },
    {
      name: intl.formatMessage({
        id: "chart.drillError",
        defaultMessage: "Drill Error (Hole)",
      }),
      data: categories.map((key) => imagesData[key].drillError),
    },
  ];

  return (
    <Container fluid className="p-4" style={{ minHeight: "100vh" }}>
      {error && (
        <Alert variant="danger" className="mx-2 shadow-sm">
          {error}
        </Alert>
      )}

      {dataFetching && (
        <div className="text-center p-5 mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!dataFetching && (
        <>
          <TopBar
            title={intl.formatMessage({
              id: "topBar.qualityInspection",
              defaultMessage: "Quality inspection",
            })}
            selectedRange={selectedRange}
            isDisabled={dataFetching}
            onRangeChange={setSelectedRange}
            onRefresh={fetchData}
          />
          <hr className="my-4 text-muted opacity-25" />

          <StatsOverview
            imagesData={statsImagesData}
            imageIdsCount={Object.keys(imagesData).length}
          />
          <h6>
            <FormattedMessage id="topProducts" defaultMessage="Top Products" />
          </h6>

          <ul className="small">
            {TOP_PRODUCTS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>

          {categories.length > 0 ? (
            <IndustrialBarChart
              categories={categories}
              series={series}
              title={intl.formatMessage({
                id: "defects",
                defaultMessage: "Defects",
              })}
            />
          ) : (
            <FormattedMessage id="noData" defaultMessage="No data available." />
          )}
        </>
      )}
    </Container>
  );
};

export default App;
