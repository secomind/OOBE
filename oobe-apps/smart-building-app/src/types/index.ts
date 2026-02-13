export type CameraHistoryDTO = {
  event: "Person detected" | "Group of people" | "Incident";
  behavior: "Entering" | "Leaving" | "Gathering";
  datetime: Date;
  number_of_people: number;
  timestamp: Date;
};

export type CameraHistoryData = {
  event: "Person detected" | "Group of people" | "Incident";
  behavior: "Entering" | "Leaving" | "Gathering";
  datetime: Date;
  numberOfPeople: number;
  timestamp: Date;
};

export type CameraHistoryExtended = CameraHistoryData & {
  cameraId: string;
};
