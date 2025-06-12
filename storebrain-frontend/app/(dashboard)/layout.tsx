import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const layout = async ({ children }: { children: React.ReactNode }) => {
  console.log("Début session");
  const session = await auth();

  console.log(session);

  if (!session?.user) {
    console.log(session?.user);
    redirect("/auth/login");
  }

  // Plus besoin de getDictionary - on passe un objet vide ou les traductions en français
  const trans = {}; // ou remplacez par un objet avec vos traductions en français

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;