import axios, { AxiosInstance } from "axios";
import qs from "qs";
import { PatientOverviewData } from "types";

type AstarteAPIClientProps = {
  astarteUrl: URL;
  realm: string;
  token: string;
};

type Config = AstarteAPIClientProps & {
  appEngineUrl: URL;
};

class AstarteAPIClient {
  private config: Config;
  private axiosInstance: AxiosInstance;

  constructor({ astarteUrl, realm, token }: AstarteAPIClientProps) {
    this.config = {
      astarteUrl,
      realm,
      token,
      appEngineUrl: new URL("appengine/", astarteUrl),
    };
    this.axiosInstance = axios.create({
      baseURL: this.config.appEngineUrl.toString(),
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        "Content-Type": "application/json;charset=UTF-8",
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      },
    });
  }

  async getPatientOverview(deviceId: string): Promise<PatientOverviewData> {
    const { realm } = this.config;

    return this.axiosInstance
      .get(
        `v1/${realm}/devices/${deviceId}/interfaces/com.oobe.patient.Overview`,
      )
      .then(
        (response) =>
          ({
            name: response.data.data.name,
            age: response.data.data.age,
            bloodType: response.data.data.blood_type,
            height: response.data.data.height,
            phisician: response.data.data.phisician,
            weight: response.data.data.weight,
            hospitalizationReason: response.data.data.hospitalizationReason,
          }) as PatientOverviewData,
      )
      .catch((error) => {
        console.error("[API] ERROR", error);
        throw error;
      });
  }
}
export default AstarteAPIClient;
