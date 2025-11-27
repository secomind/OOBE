import axios, { type AxiosInstance } from "axios";
import type { DeviceInfo } from "../components/DeviceDetails";

type Config = {
  apiUrl: URL;
};

export type DashboardUpdate = {
  field: "ramUsage" | "cpuUsage";
  value: number;
};

type DashboardMessage = {
  view: "dashboard";
  data: DashboardUpdate;
};

type ClientMessage = {
  action: "subscribe" | "unsubscribe";
  views: string[];
};

export class APIClient {
  private config: Config;
  private axiosInstance: AxiosInstance;
  private ws?: WebSocket;

  constructor() {
    this.config = {
      apiUrl: new URL(
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3030",
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

  connectDashboard(onUpdate: (update: DashboardUpdate) => void) {
    this.ws = new WebSocket(
      `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`,
    );

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["dashboard"],
      };
      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: DashboardMessage = JSON.parse(event.data);

        if (msg.view === "dashboard") {
          if (msg.data.field === "ramUsage" || msg.data.field === "cpuUsage") {
            onUpdate(msg.data);
          }
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  disconnectDashboard() {
    this.ws?.close();
    this.ws = undefined;
  }
}
