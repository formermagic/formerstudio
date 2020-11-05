import { format } from "date-fns";

export default function Time({ timestamp }: { timestamp: number | null }) {
  if (!timestamp) {
    return <time>Never</time>;
  }

  const date = new Date(timestamp);
  const dateString = date.toISOString();
  return (
    <time dateTime={dateString}>{format(date, "mm/dd/yyyy hh:mm:ss")}</time>
  );
}
