
import { ReactNode } from "react";

export const metadata = {
    title: "Esp.Salarié",
  };
  
  type Props = {
    children: ReactNode
  }
  const Layout = ({ children }:Props) => {
    return <>
    {children}    
    </>;
  };
  
  export default Layout;