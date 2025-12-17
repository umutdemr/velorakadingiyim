export const formatTRY = (v: number) =>
  v.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
