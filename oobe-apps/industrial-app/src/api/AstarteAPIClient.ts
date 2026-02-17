import axios, { AxiosInstance } from "axios";
import qs from "qs";
import { ImageData } from "types";

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

  async getImagesData(
    deviceId: string,
    since?: Date,
    to?: Date,
  ): Promise<Record<string, ImageData>> {
    const { realm } = this.config;

    const params: {
      since?: string;
      to?: string;
    } = {};

    if (since) params.since = since.toISOString();
    if (to) params.to = to.toISOString();

    return this.axiosInstance
      .get(
        `v1/${realm}/devices/${deviceId}/interfaces/com.oobe.quality.Inspection`,
        { params },
      )
      .then((response) => response.data?.data ?? [])
      .catch((error) => {
        throw error;
      });
  }
}

export default AstarteAPIClient;
