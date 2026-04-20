export function toSlotKey({
  date,
  time,
  slotMinutes,
}: {
  date: Date;
  time: string;
  slotMinutes: number;
}): string | null {
  const minutes = Math.max(5, Math.min(240, Math.floor(slotMinutes || 60)));
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || "").trim());
  if (!m) return null;

  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  const total = hh * 60 + mm;
  const slotStart = Math.floor(total / minutes) * minutes;
  const slotH = Math.floor(slotStart / 60);
  const slotM = slotStart % 60;
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const dateIso = date.toISOString().slice(0, 10);
  return `${dateIso}T${pad2(slotH)}:${pad2(slotM)}`;
}

