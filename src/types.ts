export interface ReportData {
  hn: string;
  cid: string;
  patientName: string;
  drug: string;
  symptom: string;
  reporter: string;
  note: string;
  naranjo: number;
  naranjoResult?: string;
}

export interface HistoryItem {
  date: string;
  hn: string;
  drug: string;
  symptom: string;
  reporter: string;
  naranjo?: string;
  patientName?: string;
}
