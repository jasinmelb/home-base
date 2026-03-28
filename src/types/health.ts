export interface WeightEntry {
  date: string;
  weight: number;
}

export interface BodyFat {
  current: number;
  start: number;
}

export interface WeeklyAvg {
  calories: number;
  protein: number;
}

export interface PersonHealth {
  startWeight: number;
  targetWeight: number;
  currentWeight: number;
  startDate: string;
  weightHistory: WeightEntry[];
  bodyFat: BodyFat;
  weeklyAvg: WeeklyAvg;
  ftp?: number;
  ctl?: number;
}

export interface HealthData {
  updatedAt: string;
  jason: PersonHealth;
  penny: PersonHealth;
}
