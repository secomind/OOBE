import { useState } from "react";
import { Container, Spinner } from "react-bootstrap";

export type AppProps = {
  astarteUrl: URL;
  realm: string;
  deviceId: string;
  token: string;
};

const App = ({ astarteUrl, realm, deviceId, token }: AppProps) => {
  const [dataFetching, setDataFetching] = useState(false);

  return (
    <Container fluid className="p-4">
      {dataFetching ? (
        <div className="p-2 p-md-4 text-center">
          <Spinner />
        </div>
      ) : (
        <h1>Industrial App</h1>
        // TODO: implement components
      )}
    </Container>
  );
};

export default App;
