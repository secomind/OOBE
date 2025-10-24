import axios, { type AxiosInstance } from "axios";
import qs from "qs";

export type LatLng = {
  lat: number;
  lng: number;
};

export type NominatimAddress = {
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  country?: string;
};

export type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export default class MapAPIClient {
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: "https://nominatim.openstreetmap.org",
      headers: {
        "Content-Type": "application/json",
      },
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    });
  }

  async getAddress({ lat, lng }: LatLng): Promise<NominatimResponse | null> {
    return this.axiosClient
      .get<NominatimResponse>("/reverse", {
        params: {
          lat,
          lon: lng,
          format: "json",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("[MapAPIClient] getAddress error:", error);
        return null;
      });
  }
}
