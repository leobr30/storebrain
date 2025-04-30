import { AlertView } from "@/features/alert/components/alert-view";
import { getAlerts } from "@/features/alert/alert-actions";
import { getCompanies } from "../employee-area/employee-area-action";

const AlertPage = async () => {
  const alerts = await getAlerts();
  const companies = await getCompanies();
  return <AlertView alerts={alerts} companies={companies} />;
};

export default AlertPage;
