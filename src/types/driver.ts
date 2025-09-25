export type DriverPosition = {
  id: string | number;
  driverId?: string | number;
  name?: string;
  lat: number;
  lng: number;
  online?: boolean;
  updatedAt?: string;
};