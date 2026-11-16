// Data de hoje no formato da API: "2026-11-15"
export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// "2026-11-15" -> "15/11/2026"
export function isoToBR(iso: string): string {
  if (!iso) return '';

  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return '';

  return `${day}/${month}/${year}`;
}

// "15/11/2026" -> "2026-11-15"  (devolve null se estiver incompleta)
export function brToISO(br: string): string | null {
  const [day, month, year] = br.split('/');
  if (!day || !month || !year || year.length !== 4) {
    return null;
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
