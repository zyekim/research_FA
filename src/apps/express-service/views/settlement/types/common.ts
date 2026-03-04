interface searchSTLMType {
  dateType: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  stlmStatus: string[];
  searchText: string | null;
  carrierCodes: string[];
}

interface sumTableType {
  shippingFee: string | null;
  extraFee: string | null;
  fuelSurcharge: string | null;
  extraShippingFee: string | null;
  tax: string | null;
  inspectionFee: string | null;
  extraTax: string | null;
  otherPrice: string | null;
  totalAmount: string | null;
}
export type { searchSTLMType, sumTableType };
