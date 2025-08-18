export type Activity = {
  id: number;
  trip_id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  end_time?: string;
  location?: string;
};
