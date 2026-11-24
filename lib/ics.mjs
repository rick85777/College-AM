/**
 * RFC 5545 .ics 生成器。零依赖，只实现本项目需要的部分：
 * VEVENT + VALARM + 全天事件 + 正确折行 + CRLF。
 */

const CRLF = "\r\n";

/** RFC 5545 §3.1：行不超过 75 字节，超出折行（续行以单个空格开头） */
function fold(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const chunks = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // 不要把多字节字符切断
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    chunks.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74; // 续行开头有一个空格，占 1 字节
  }
  return chunks.join(CRLF + " ");
}

/** 转义 RFC 5545 §3.3.11 规定的特殊字符 */
function esc(text) {
  return String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** YYYY-MM-DD -> YYYYMMDD（全天事件） */
function toDateValue(dateStr) {
  return dateStr.replace(/-/g, "");
}

/** 全天事件结束日需 +1 天（DTEND 是 exclusive 的） */
function nextDay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

function toUtcStamp(dt = new Date()) {
  return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * @param {object} opts
 * @param {string} opts.name 日历名称
 * @param {string} [opts.description]
 * @param {Array<{uid:string, start:string, end?:string, summary:string, description?:string, url?:string, alarmDays?:number[]}>} opts.events
 * @param {Date} [opts.now]
 */
export function buildCalendar({ name, description = "", events = [], now = new Date() }) {
  const stamp = toUtcStamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//College-AM//college-am//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:" + esc(name),
    "X-WR-TIMEZONE:Asia/Shanghai",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H"
  ];
  if (description) lines.push("X-WR-CALDESC:" + esc(description));

  for (const ev of events) {
    const start = toDateValue(ev.start);
    const end = toDateValue(nextDay(ev.end || ev.start));
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + ev.uid + "@college-am");
    lines.push("DTSTAMP:" + stamp);
    lines.push("DTSTART;VALUE=DATE:" + start);
    lines.push("DTEND;VALUE=DATE:" + end);
    lines.push("SUMMARY:" + esc(ev.summary));
    if (ev.description) lines.push("DESCRIPTION:" + esc(ev.description));
    if (ev.url) lines.push("URL:" + ev.url);
    lines.push("TRANSP:TRANSPARENT");
    for (const days of ev.alarmDays ?? [7, 1]) {
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P" + days + "D");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:" + esc(ev.summary + " 还有 " + days + " 天"));
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join(CRLF) + CRLF;
}

export const __internal = { fold, esc, nextDay };
