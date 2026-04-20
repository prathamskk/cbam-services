export type DocumentStatus = "pending" | "verified" | "rejected";
export type EmissionType = "actual" | "default";

export type SupplierRow = {
  id: string;
  name: string;
  country: string | null;
  carbon_maturity_score: number | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  cn_code: string;
  description: string | null;
  default_emission_factor_tco2e_per_tonne: number;
  created_at: string;
};

export type ShipmentRow = {
  id: string;
  shipment_date: string;
  supplier_id: string;
  product_id: string;
  mass_tonnes: number;
  created_at: string;
};

export type EmissionRow = {
  id: string;
  shipment_id: string;
  type: EmissionType;
  emission_factor_tco2e_per_tonne: number;
  created_at: string;
};

export type ShipmentDetail = {
  id: string;
  shipment_date: string;
  mass_tonnes: number;
  supplier: { id: string; name: string; country: string | null };
  product: {
    id: string;
    cn_code: string;
    description: string | null;
    default_emission_factor_tco2e_per_tonne: number;
  };
  emissions: { type: string; emission_factor_tco2e_per_tonne: number }[];
};

export type DocumentListRow = {
  id: string;
  supplier_id: string;
  product_id: string | null;
  storage_path: string;
  filename: string;
  status: string;
  reviewed_at: string | null;
  created_at: string;
  supplier_name: string | null;
  cn_code: string | null;
};

export type DocumentRow = {
  id: string;
  supplier_id: string;
  product_id: string | null;
  storage_path: string;
  filename: string;
  status: DocumentStatus;
  reviewed_at: string | null;
  created_at: string;
};
