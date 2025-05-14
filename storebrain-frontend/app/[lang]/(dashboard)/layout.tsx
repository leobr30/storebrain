import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";

import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/lib/auth";

const layout = async ({ children, params: { lang } }: { children: React.ReactNode; params: { lang: any } }) => {
  console.log("Début session");
  const session = await auth();

  console.log(session);


  if (!session?.user) {
    console.log(session?.user);
    redirect("/auth/login");

    
  }

  const trans = await getDictionary(lang);

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
