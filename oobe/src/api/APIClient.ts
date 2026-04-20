import axios, { type AxiosInstance } from "axios";
import type { DeviceInfo } from "../components/DeviceDetails";
import type { DefectAnalysisResponse } from "../pages/QualityInspection";
import type { BlisterPackResult } from "../pages/SampleIntegrityCheck";

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

export type PersonResult = {
  categoryId: number;
  bbox: number[];
  score: number;
};

export type InverterStatus = "ready" | "fault";
export type SmartUpdate =
  | { field: "plantStatus"; value: string }
  | { field: "plantPower"; value: number }
  | { field: "powerSentToGrid"; value: number }
  | { field: "inverterTemperature"; value: number }
  | { field: "selfConsumption"; value: number }
  | { field: "inverterStatus"; value: InverterStatus };

type SmartMessage = {
  view: "plant";
  data: SmartUpdate;
};

export type SystemStatus = "ready" | "fault" | "working";
export type MedicalUpdate =
  | { field: "tubeStatus"; value: string }
  | { field: "tubeTemperature"; value: number }
  | { field: "tubeCurrent"; value: number }
  | { field: "gantryTemperature"; value: number }
  | { field: "coolingSystem"; value: string }
  | { field: "systemStatus"; value: SystemStatus };

type MedicalMessage = {
  view: "medical";
  data: MedicalUpdate;
};

export type IndustrialUpdate =
  | { field: "suctionPressure"; value: number }
  | { field: "dischargePressure"; value: number }
  | { field: "energyConsumption"; value: number }
  | { field: "internalHumidity"; value: number }
  | { field: "fanSpeed"; value: number }
  | { field: "systemStatus"; value: SystemStatus };

export type SmartClinicalRecordUpdate =
  | { field: "ecg"; value: number }
  | { field: "bpm"; value: number }
  | { field: "systolic"; value: number }
  | { field: "diastolic"; value: number }
  | { field: "oxygenSaturation"; value: number };

type SmartClinicalRecordMessage = {
  view: "smartClinicalRecord";
  data: SmartClinicalRecordUpdate;
};

type IndustrialMessage = {
  view: "industrial";
  data: IndustrialUpdate;
};

type ClientMessage = {
  action: "subscribe" | "unsubscribe";
  views: string[];
};

interface AIDetectionResult {
  items: AIDetectionResultItem[];
  inferenceTime: number;
}

interface AIDetectionResultItem {
  category_id: number;
  bbox: number[];
  score: number;
}

export type FaceRecognitionUpdate = {
  cX: number;
  cY: number;
  score: number;
  label: string;
};

type FaceRecognitionMessage = {
  view: "faceRecognition";
  data: FaceRecognitionUpdate[];
};

export type AnalysisMode = "cpu" | "gpu" | "npu";

export interface DetectionResponse<T> {
  results: T[];
  inferenceTime: number;
}

export class APIClient {
  private config: Config;
  private axiosInstance: AxiosInstance;
  private ws?: WebSocket;
  private faceWs?: WebSocket;

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

  async getDefectResult(
    imageFile: File,
    mode: AnalysisMode,
  ): Promise<DefectAnalysisResponse> {
    const response = await this.axiosInstance.post<AIDetectionResult>(
      `/pcb-defect-detect-${mode}`,
      imageFile,
      {
        headers: {
          "Content-Type": imageFile.type,
        },
      },
    );

    return {
      results: response.data.items.map((item) => ({
        categoryId: item.category_id,
        bbox: item.bbox,
        score: item.score,
      })),
      inferenceTime: response.data.inferenceTime,
    };
  }

  async getBlisterPackResult(
    imageFile: File,
    mode: AnalysisMode,
  ): Promise<DetectionResponse<BlisterPackResult>> {
    const response = await this.axiosInstance.post<AIDetectionResult>(
      `/blister-pack-detect-${mode}`,
      imageFile,
      {
        headers: {
          "Content-Type": imageFile.type,
        },
      },
    );
    return {
      results: response.data.items.map((item) => ({
        categoryId: item.category_id,
        bbox: item.bbox,
        score: item.score,
      })),
      inferenceTime: response.data.inferenceTime,
    };
  }

  async exitApp(): Promise<void> {
    await this.axiosInstance.post("/exit");
  }

  async fixStatus(
    path: "inverter" | "industrial" | "medical",
  ): Promise<string> {
    return this.axiosInstance
      .post(`/fix-${path}-status`)
      .then((response) => response.data)
      .catch((error) => error);
  }

  connectDashboard(onUpdate: (update: DashboardUpdate) => void) {
    if (!this.ws) {
      this.ws = new WebSocket(
        `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
          /^http/,
          "ws",
        ),
      );
    }

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

  connectSmart(onUpdate: (update: SmartUpdate) => void) {
    if (!this.ws) {
      this.ws = new WebSocket(
        `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
          /^http/,
          "ws",
        ),
      );
    }

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["plant"],
      };
      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: SmartMessage = JSON.parse(event.data);

        if (msg.view === "plant") {
          if (
            msg.data.field === "plantStatus" ||
            msg.data.field === "plantPower" ||
            msg.data.field === "powerSentToGrid" ||
            msg.data.field === "inverterTemperature" ||
            msg.data.field === "selfConsumption" ||
            msg.data.field === "inverterStatus"
          ) {
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

  connectMedical(onUpdate: (update: MedicalUpdate) => void) {
    if (!this.ws) {
      this.ws = new WebSocket(
        `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
          /^http/,
          "ws",
        ),
      );
    }

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["medical"],
      };
      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: MedicalMessage = JSON.parse(event.data);

        if (msg.view === "medical") {
          if (
            msg.data.field === "tubeStatus" ||
            msg.data.field === "tubeTemperature" ||
            msg.data.field === "tubeCurrent" ||
            msg.data.field === "gantryTemperature" ||
            msg.data.field === "coolingSystem" ||
            msg.data.field === "systemStatus"
          ) {
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

  connectIndustrial(onUpdate: (update: IndustrialUpdate) => void) {
    if (!this.ws) {
      this.ws = new WebSocket(
        `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
          /^http/,
          "ws",
        ),
      );
    }

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["industrial"],
      };
      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: IndustrialMessage = JSON.parse(event.data);

        if (msg.view === "industrial") {
          if (
            msg.data.field === "suctionPressure" ||
            msg.data.field === "dischargePressure" ||
            msg.data.field === "energyConsumption" ||
            msg.data.field === "internalHumidity" ||
            msg.data.field === "fanSpeed" ||
            msg.data.field === "systemStatus"
          ) {
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

  connectSmartClinicalRecord(
    onUpdate: (update: SmartClinicalRecordUpdate) => void,
  ) {
    this.ws = new WebSocket(
      `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
        /^http/,
        "ws",
      ),
    );

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["smartClinicalRecord"],
      };

      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: SmartClinicalRecordMessage = JSON.parse(event.data);

        if (msg.view === "smartClinicalRecord") {
          onUpdate(msg.data);
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

  connectFaceRecognition(onUpdate: (update: FaceRecognitionUpdate[]) => void) {
    if (this.faceWs) {
      this.faceWs.close();
    }
    this.faceWs = new WebSocket(
      `${this.config.apiUrl.toString().replace(/\/$/, "")}/ws`.replace(
        /^http/,
        "ws",
      ),
    );

    this.faceWs.onopen = () => {
      console.log("WebSocket connected");

      const subscribeMsg: ClientMessage = {
        action: "subscribe",
        views: ["faceRecognition"],
      };
      this.faceWs?.send(JSON.stringify(subscribeMsg));
    };

    this.faceWs.onmessage = (event) => {
      try {
        const msg: FaceRecognitionMessage = JSON.parse(event.data);

        if (msg.view === "faceRecognition") {
          onUpdate(msg.data);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    this.faceWs.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    this.faceWs.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  async getPersonResult(
    imageFile: File,
    mode: AnalysisMode,
  ): Promise<DetectionResponse<PersonResult>> {
    const response = await this.axiosInstance.post<AIDetectionResult>(
      `/people-detect-${mode}`,
      imageFile,
      {
        headers: {
          "Content-Type": imageFile.type,
        },
      },
    );

    return {
      results: response.data.items.map((item) => ({
        categoryId: item.category_id,
        bbox: item.bbox,
        score: item.score,
      })),
      inferenceTime: response.data.inferenceTime,
    };
  }

  disconnectWebSocket(wsType?: string) {
    if (wsType === "faceRecognition") {
      if (this.faceWs) {
        this.faceWs.close();
        this.faceWs = undefined;
      }
    } else {
      if (this.ws) {
        this.ws.close();
        this.ws = undefined;
      }
    }
  }
}
