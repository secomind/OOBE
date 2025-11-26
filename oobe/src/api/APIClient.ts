import axios, { type AxiosInstance } from "axios";
import type { DeviceInfo } from "../components/DeviceDetails";

type Config = {
  apiUrl: URL;
};

export class APIClient {
  private config: Config;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.config = {
      apiUrl: new URL(
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3030"
      ),
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl.toString(),
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    });
  }

  async getSystemInfo(): Promise<DeviceInfo> {
    const response = await this.axiosInstance.get<DeviceInfo>("/static");
    return response.data;
  }
}
