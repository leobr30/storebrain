import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";

import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/lib/auth";

const layout = async ({ children, params: { lang } }: { children: React.ReactNode; params: { lang: any } }) => {
  const session = await auth();

  console.log(session);


  if (!session?.user) {
    console.log(session?.user);
    redirect("/auth/login");

    
  }

  const trans = await getDictionary(lang);
  console.log(trans);

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
