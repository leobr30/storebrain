import { getClosingDay } from "@/features/closing-day/action";
import ClosingDayView from "@/features/closing-day/components/closing-day-view";

export default async function ClosingDayPage() {
    const closingDay = await getClosingDay();
  return <ClosingDayView closingDay={closingDay} />;
}
