export function normalizePhoneNumber(value: string): string {
  return value.replace(/\s+/g, '').trim();
}

export function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
