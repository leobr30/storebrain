import { getLastBalance } from "@/features/tools/balance/actions";
import { BalanceView } from "@/features/tools/balance/components/balance-view";

const BalancePage = async () => {
  const lastBalance = await getLastBalance();  
  return <BalanceView lastBalance={lastBalance} />;
};

export default BalancePage;
