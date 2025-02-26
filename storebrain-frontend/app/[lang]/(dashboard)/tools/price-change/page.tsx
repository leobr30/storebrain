import { getLastPriceUpdate } from "@/features/tools/actions";
import ToolView from "@/features/tools/components/tool-view";

const ToolsPage = async () => {
  const lastPriceUpdate = await getLastPriceUpdate();
  return <ToolView lastPriceUpdate={lastPriceUpdate} />;
};

export default ToolsPage;
