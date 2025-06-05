import React, { useState } from "react";
import { useSidebar, useThemeStore } from "@/store";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Search, Users } from "lucide-react";
import { SiteLogo } from "@/components/svg";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import EmployeeSearchModal from "@/components/search/employee-search-modal";

const MenuBar = ({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (value: boolean) => void; }) => {
  return (
    <button
      className="relative group  disabled:cursor-not-allowed opacity-50"
      onClick={() => setCollapsed(!collapsed)}
    >
      <div>
        <div
          className={cn(
            "flex flex-col justify-between w-[20px] h-[16px] transform transition-all duration-300 origin-center overflow-hidden",
            {
              "-translate-x-1.5 rotate-180": collapsed,
            }
          )}
        >
          <div
            className={cn(
              "bg-card-foreground h-[2px] transform transition-all duration-300 origin-left delay-150",
              {
                "rotate-[42deg] w-[11px]": collapsed,
                "w-7": !collapsed,
              }
            )}
          ></div>
          <div
            className={cn(
              "bg-card-foreground h-[2px] w-7 rounded transform transition-all duration-300",
              {
                "translate-x-10": collapsed,
              }
            )}
          ></div>
          <div
            className={cn(
              "bg-card-foreground h-[2px] transform transition-all duration-300 origin-left delay-150",
              {
                "-rotate-[43deg] w-[11px]": collapsed,
                "w-7": !collapsed,
              }
            )}
          ></div>
        </div>
      </div>
    </button>
  );
};

type VerticalHeaderProps = {
  handleOpenSearch?: () => void; // Optionnel maintenant car on gère en interne
};

const VerticalHeader: React.FC<VerticalHeaderProps> = ({ handleOpenSearch }) => {
  const { collapsed, setCollapsed, subMenu, sidebarType } = useSidebar();
  const { layout } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");

  // État pour la modal de recherche d'employés
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  let LogoContent = null;
  let menuBarContent = null;
  let searchButtonContent = null;

  const MainLogo = (
    <Link href="/dashboard" className=" text-primary ">
      <SiteLogo className="h-7 w-7" />
    </Link>
  );

  // Nouveau bouton de recherche d'employés
  const EmployeeSearchButton = (
    <div>
      <button
        type="button"
        className="inline-flex gap-2 items-center text-default-600 text-sm hover:text-primary transition-colors"
        onClick={() => setIsSearchModalOpen(true)}
        title="Rechercher un employé"
      >
        <span>
          <Users className="h-4 w-4" />
        </span>
        <span className="md:block hidden">Rechercher un employé...</span>
      </button>
    </div>
  );

  // Ancien bouton de recherche (fallback)
  const SearchButton = (
    <div>
      <button
        type="button"
        className="inline-flex gap-2 items-center text-default-600 text-sm hover:text-primary transition-colors"
        onClick={() => {
          if (handleOpenSearch) {
            handleOpenSearch();
          } else {
            setIsSearchModalOpen(true);
          }
        }}
      >
        <span>
          <Search className="h-4 w-4" />
        </span>
        <span className="md:block hidden">Search...</span>
      </button>
    </div>
  );

  if (layout === "semibox" && !isDesktop) {
    LogoContent = MainLogo;
  }
  if (
    layout === "vertical" &&
    !isDesktop &&
    isMobile &&
    sidebarType === "module"
  ) {
    LogoContent = MainLogo;
  }
  if (layout === "vertical" && !isDesktop && sidebarType !== "module") {
    LogoContent = MainLogo;
  }

  // menu bar content condition
  if (isDesktop && sidebarType !== "module") {
    menuBarContent = (
      <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} />
    );
  }
  if (sidebarType === "module") {
    menuBarContent = (
      <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} />
    );
  }
  if (sidebarType === "classic") {
    menuBarContent = null;
  }
  if (subMenu && isDesktop) {
    menuBarContent = null;
  }

  // Configuration du bouton de recherche avec priorité à la recherche d'employés
  if (sidebarType === "module" && isMobile) {
    searchButtonContent = EmployeeSearchButton;
  }
  if (sidebarType === "classic" || sidebarType === "popover") {
    searchButtonContent = EmployeeSearchButton;
  }

  return (
    <>
      <div className="flex items-center md:gap-6 gap-3">
        {LogoContent}
        {menuBarContent}
        {searchButtonContent}
      </div>

      {/* Modal de recherche d'employés */}
      <EmployeeSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

export default VerticalHeader;