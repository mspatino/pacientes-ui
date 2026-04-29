export const formatEstadoCivil = (rawValue?: string | null): string => {
  if (!rawValue) return "-";

  const normalized = rawValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "SOLTERO") return "Soltero/a";
  if (normalized === "CASADO") return "Casado/a";
  if (normalized === "DIVORCIADO") return "Divorciado/a";
  if (normalized === "VIUDO") return "Viudo/a";
  if (normalized === "UNION_CONVIVENCIAL") return "Unión convivencial";
  return rawValue;
};

export const formatDate = (rawFecha?: string | null): string => {
  if (!rawFecha) return "-";

  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const trimmed = rawFecha.trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    return dateFormatter.format(new Date(year, month - 1, day));
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return rawFecha;

  return dateFormatter.format(date);
};

export const formatConviviente = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatNivelEducativo = (rawValue?: string | null): string => {
  if (!rawValue) return "-";
  return rawValue
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const asRecord = (value: unknown): Record<string, unknown> =>
  (value as Record<string, unknown>) || {};

export const firstString = (source: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
};

export const firstStringArray = (source: Record<string, unknown>, keys: string[]): string[] => {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  }
  return [];
};