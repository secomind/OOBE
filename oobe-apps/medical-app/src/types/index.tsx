export type PatientOverviewData = {
  name: string;
  age: number;
  bloodType: string;
  height: number;
  phisician: string;
  weight: number;
  hospitalizationReason: string;
};

export type MedicalReportsData = {
  type: string;
  facility: string;
  date: Date;
};
