import axios, { AxiosInstance } from "axios";
import qs from "qs";

type AstarteAPIClientProps = {
  astarteUrl: URL;
  realm: string;
  token: string;
};

type Config = AstarteAPIClientProps & {
  appEngineUrl: URL;
};

type LinesParameters = {
  deviceId: string;
  lineId: string;
  sinceAfter?: Date;
  since?: Date;
  to?: Date;
  limit?: number;
};

type LineData = {
  cycleEndTime: Date;
  cycleStartTime: Date;
  productName: string;
  quality: boolean;
  timestamp: Date;
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

  async getLineIds(deviceId: string): Promise<string[]> {
    const { realm } = this.config;
    const response = await this.axiosInstance.get(
      `v1/${realm}/devices/${deviceId}/interfaces/com.oobe.industrial.Lines`,
    );

    return Object.keys(response.data?.data ?? {});
  }

  async getLinesData({
    deviceId,
    lineId,
    sinceAfter,
    since,
    to,
    limit,
  }: LinesParameters): Promise<LineData[]> {
    const { realm } = this.config;

    const query: Record<string, string> = {};

    if (sinceAfter) {
      query.sinceAfter = sinceAfter.toISOString();
    }
    if (since) {
      query.since = since.toISOString();
    }
    if (to) {
      query.to = to.toISOString();
    }
    if (limit) {
      query.limit = limit.toString();
    }

    return this.axiosInstance
      .get(
        `v1/${realm}/devices/${deviceId}/interfaces/com.oobe.industrial.Lines/${lineId}`,
        {
          params: query,
        },
      )
      .then((response) =>
        response.data.map(
          (data: any) =>
            ({
              cycleEndTime: data.cycle_end_time,
              cycleStartTime: data.cycle_start_time,
              productName: data.product_name,
              quality: data.quality,
              timestamp: data.timestamp,
            }) as LineData,
        ),
      )
      .catch((error) => {
        throw error;
      });
  }
}

export default AstarteAPIClient;
export type { LineData, LinesParameters };
