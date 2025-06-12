import { AlertView } from "@/features/alert/components/alert-view";
import { getAlerts } from "@/features/alert/alert-actions";
import { getCompanies } from "../employee-area/employee-area-action";

// Forcer le rendu dynamique
export const dynamic = 'force-dynamic';

const AlertPage = async () => {
  try {
    const alerts = await getAlerts();
    const companies = await getCompanies();
    return <AlertView alerts={alerts} companies={companies} />;
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);

    // Retourner une page d'erreur ou des données par défaut
    return (
      <div className="p-4">
        <h1>Erreur de chargement</h1>
        <p>Une erreur est survenue lors du chargement des alertes.</p>
      </div>
    );
  }
};

export default AlertPage;