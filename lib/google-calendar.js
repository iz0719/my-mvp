const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function fetchTodayEvents(accessToken) {
  const { start, end } = getTodayRange();
  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Calendar API error: ${response.status} ${body}`);
  }

  const data = await response.json();
  return (data.items || []).map((event) => ({
    id: event.id,
    title: event.summary || "(タイトルなし)",
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    allDay: !event.start?.dateTime,
  }));
}

export function formatEventTime(start, end, allDay) {
  if (allDay) return "終日";
  const opts = { hour: "2-digit", minute: "2-digit" };
  const startStr = new Date(start).toLocaleTimeString("ja-JP", opts);
  const endStr = new Date(end).toLocaleTimeString("ja-JP", opts);
  return `${startStr} – ${endStr}`;
}

export function minutesUntil(isoString) {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return null;
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `あと ${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `あと ${hours}時間${rem}分` : `あと ${hours}時間`;
}

export { CALENDAR_SCOPE };
