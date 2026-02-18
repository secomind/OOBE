import AstarteAPIClient from "./api/AstarteAPIClient";
import { useEffect, useMemo, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import IndustrialBarChart from "./component/IndustrialBarChart";
import { ImageData } from "types";
import { FormattedMessage, useIntl } from "react-intl";

export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const intl = useIntl();
  const [dataFetching, setDataFetching] = useState(false);
  const [imagesData, setImagesData] = useState<Record<string, ImageData>>({});
  const [error, setError] = useState<string | null>(null);

  const astarteClient = useMemo(() => {
    return new AstarteAPIClient({ astarteUrl, realm, token });
  }, [astarteUrl, realm, token]);

  useEffect(() => {
    setDataFetching(true);

    astarteClient
      .getImagesData(deviceId)
      .then((data) => {
        setImagesData(data);
      })
      .catch(() => {
        setError("Failed to fetch data.");
      })
      .finally(() => {
        setDataFetching(false);
      });
  }, [astarteClient, deviceId]);

  const categories = Object.keys(imagesData);

  const series = [
    {
      name: "Short Circuit (SC)",
      data: categories.map((key) => imagesData[key].shortCircuit),
    },
    {
      name: "Drill Error (Hole)",
      data: categories.map((key) => imagesData[key].drillError),
    },
  ];

  return (
    <Container fluid className="p-4">
      {dataFetching ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <h1>Industrial App</h1>

          {error && <Alert variant="danger">{error}</Alert>}

          {categories.length ? (
            <IndustrialBarChart
              categories={categories}
              series={series}
              title={intl.formatMessage({
                id: "defections",
                defaultMessage: "Defections",
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
