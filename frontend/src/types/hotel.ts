export type Hotel = {
  id: number;
  name: string;
  address: string;
  start_date: string;
  end_date: string;
  reserved: boolean;
  notes?: string;
  link?: string;
};

export type HotelListProps = {
  hotels: Hotel[];
  onAdd: () => void;
  onEdit: (hotel: Hotel) => void;
  onDelete: (id: number) => void;
};