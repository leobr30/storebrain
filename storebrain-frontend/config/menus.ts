
import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  Mail,
  Users,
  User,
  Device,
  Docs,
  DocsCheck,
  Stacks,
  Settings
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[]
  nested?: MenuItemProps[]
  onClick: () => void;


}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      child: [
        {
          title: "Analytics",
          href: "/dashboard",
          icon: Graph,
        },
        {
          title: "Ecommerce",
          href: "/ecommerce",
          icon: Cart,
        },
        {
          title: "Project ",
          href: "/project",
          icon: ClipBoard,
        },
      ],
    },
    {
      title: "Application",
      icon: Application,
      child: [
        {
          title: "chat",
          icon: Messages,
          href: "/chat",
        },
        {
          title: "email",
          icon: Envelope,
          href: "/email",
        },
        {
          title: "kanban",
          icon: Monitor,
          href: "/kanban",
        },
        {
          title: "task",
          icon: ListFill,
          href: "/task",
        },
        {
          title: "calendar",
          icon: Calendar,
          href: "/calendar",
        },

        {
          title: "project",
          icon: ClipBoard,
          href: "/projects",
        },
      ],
    },
    {
      title: "Components",
      icon: Components,
      megaMenu: [
        {
          title: "Base Ui",
          icon: Flag,
          child: [
            {
              title: "accordion",
              icon: "heroicons:information-circle",
              href: "/accordion",
            },
            {
              title: "alert",
              icon: "heroicons:information-circle",
              href: "/alert",
            },
            {
              title: "avatar",
              icon: "heroicons:information-circle",
              href: "/avatar",
            },
            {
              title: "badge",
              icon: "heroicons:cube",
              href: "/badge",
            },
            {
              title: "breadcrumb",
              icon: "heroicons:cube",
              href: "/breadcrumb",
            },
            {
              title: "Button",
              icon: "heroicons:cube",
              href: "/button",
            },

            {
              title: "Card",
              icon: "heroicons:cube",
              href: "/card",
            },
            {
              title: "carousel",
              icon: "heroicons:information-circle",
              href: "/carousel",
            },
            {
              title: "color",
              icon: "heroicons:information-circle",
              href: "/color",
            },
            {
              title: "combobox",
              icon: "heroicons:cube",
              href: "/combobox",
            },
            {
              title: "command",
              icon: "heroicons:cube",
              href: "/command",
            },
            {
              title: "Dropdown",
              icon: "heroicons:cube",
              href: "/dropdown",
            },
            {
              title: "Dialog",
              icon: "heroicons:cube",
              href: "/dialog",
            },
            {
              title: "kbd",
              icon: "heroicons:information-circle",
              href: "/kbd",
            },
            {
              title: "pagination",
              icon: "heroicons:cube",
              href: "/pagination",
            },
            {
              title: "popover",
              icon: "heroicons:information-circle",
              href: "/popover",
            },
            {
              title: "progress",
              icon: "heroicons:information-circle",
              href: "/progress",
            },
            {
              title: "sheet",
              icon: "heroicons:cube",
              href: "/sheet",
            },
            {
              title: "skeleton",
              icon: "heroicons:cube",
              href: "/skeleton",
            },
            {
              title: "tabs",
              icon: "heroicons:cube",
              href: "/tabs",
            },
            {
              title: "toast",
              icon: "heroicons:information-circle",
              href: "/toast",
            },
            {
              title: "tooltip",
              icon: "heroicons:information-circle",
              href: "/tooltip",
            },
            {
              title: "typography",
              icon: "heroicons:information-circle",
              href: "/typography",
            },
          ],
        },
        {
          title: "Advanced Ui",
          icon: Book,
          child: [
            {
              title: "affix",
              icon: "heroicons:cube",
              href: "/affix",
            },
            {
              title: "calender",
              icon: "heroicons:information-circle",
              href: "/calendar-page",
            },
            {
              title: "steps",
              icon: "heroicons:information-circle",
              href: "/steps",
            },
            {
              title: "timeline",
              icon: "heroicons:cube",
              href: "/timeline",
            },
            {
              title: "tour",
              icon: "heroicons:cube",
              href: "/tour",
            },
            {
              title: "tree",
              icon: "heroicons:information-circle",
              href: "/tree",
            },
            {
              title: "watermark",
              icon: "heroicons:cube",
              href: "/watermark",
            },
          ],
        },
      ],
    },

    {
      title: "Forms",
      icon: Stacks2,
      megaMenu: [
        {
          title: "Form Elements",
          icon: Note,
          child: [
            {
              title: "checkbox",
              href: "/checkbox",
            },
            {
              title: "file uploader",
              href: "/file-uploader",
            },
            {
              title: "input",
              href: "/input",
            },
            {
              title: "input-group",
              href: "/input2",
            },
            {
              title: "input-mask",
              href: "/input-mask",
            },
            {
              title: "radio",
              href: "/radio",
            },
            {
              title: "Range Slider",
              href: "/slider",
            },
            {
              title: "rating",
              href: "/rating",
            },
            {
              title: "Select",
              href: "/form-select",
            },
            {
              title: "React Select",
              href: "/react-select",
            },
            {
              title: "switch",
              href: "/switch",
            },
            {
              title: "textarea",
              href: "/textarea",
            },
            {
              title: "Form Wizard",
              href: "/form-wizard",
            },
            {
              title: "Form Layout",
              href: "/form-layout",
            },
            {
              title: "Use Controller",
              href: "/validation-controller",
            },
            {
              title: "Use Form",
              href: "/validation-useform",
            },
          ],
        },
      ],
    },
    {
      title: "Pages",
      icon: Files,
      megaMenu: [
        {
          title: "Authentication",
          icon: Sheild,
          child: [
            {
              title: "Sign In 01",
              href: "/auth/login",
            },
            {
              title: "Sign In 02",
              href: "/auth/login2",
            },
            {
              title: "Sign In 03",
              href: "/auth/login3",
            },
            {
              title: "Sign In 04",
              href: "/auth/login4",
            },
            {
              title: "Sign In 05",
              href: "/auth/login5",
            },
            {
              title: "Sign Up 01",
              href: "./auth/register",
            },
            {
              title: "Sign Up 02",
              href: "/auth/register2",
            },
            {
              title: "Sign Up 03",
              href: "/auth/register3",
            },
            {
              title: "Sign Up 04",
              href: "/auth/register4",
            },
            {
              title: "Sign Up 05",
              href: "/auth/register5",
            },
            {
              title: "Forget Password 01",
              href: "/auth/forgot",
            },
            {
              title: "Forget Password 02",
              href: "/auth/forgot2",
            },
            {
              title: "Forget Password 03",
              href: "/auth/forgot3",
            },
            {
              title: "Forget Password 04",
              href: "/auth/forgot4",
            },
            {
              title: "Forget Password 05",
              href: "/auth/forgot5",
            },
            {
              title: "Lock Screen 01",
              href: "/auth/lock",
            },
            {
              title: "Lock Screen 02",
              href: "/auth/lock2",
            },
            {
              title: "Lock Screen 03",
              href: "/auth/lock3",
            },
            {
              title: "Lock Screen 04",
              href: "/auth/lock4",
            },
            {
              title: "Lock Screen 05",
              href: "/auth/lock5",
            },
            {
              title: "Two-Step 01",
              href: "/auth/verify",
            },
            {
              title: "Two-Step 02",
              href: "/auth/verify2",
            },
            {
              title: "Two-Step 03",
              href: "/auth/verify3",
            },
            {
              title: "Two-Step 04",
              href: "/auth/verify4",
            },
            {
              title: "Two-Step 05",
              href: "/auth/verify5",
            },
            {
              title: "Password Create 01",
              href: "/auth/create-password",
            },
            {
              title: "Password Create 02",
              href: "/auth/create-password2",
            },
            {
              title: "Password Create 03",
              href: "/auth/create-password3",
            },
            {
              title: "Password Create 04",
              href: "/auth/create-password4",
            },
            {
              title: "Password Create 05",
              href: "/auth/create-password5",
            },
          ],
        },
        {
          title: "Error",
          icon: Error,
          child: [
            {
              title: "Error 401",
              href: "/error-page/401",
            },
            {
              title: "Error 403",
              href: "/error-page/403",
            },
            {
              title: "Error 404",
              href: "/error-page/404",
            },
            {
              title: "Error 419",
              href: "/error-page/419",
            },
            {
              title: "Error 429",
              href: "/error-page/429",
            },
            {
              title: "Error 500",
              href: "/error-page/500",
            },
            {
              title: "Error 503",
              href: "/error-page/503",
            },
          ],
        },
        {
          title: "Utility",
          icon: Diamond,
          child: [
            {
              title: "Blank Page",
              href: "/blank",
            },
            {
              title: "Comming Soon",
              href: "/utility/comming-soon",
            },
            {
              title: "Under Maintinance",
              href: "/utility/maintinance",
            },
            {
              title: "create Invoice",
              href: "/create-invoice",
            },
            {
              title: "iunvoice-details",
              href: "/invoice-details",
            },
            {
              title: "iunvoice-list",
              href: "/invoice-list",
            },
          ],
        },
        {
          title: "Email Template",
          icon: Mail,
          child: [
            {
              title: "Advanced",
              href: "/reactemail-welcome-advanced",
            },
            {
              title: "Basic",
              href: "/reactemail-basic-welcome",
            },

            {
              title: "Reset Password 1",
              href: "/react-email/auth/reset-password-1",
            },
            {
              title: "Reset Password 2",
              href: "/react-email/auth/reset-password-2",
            },
            {
              title: "Verify Email",
              href: "/react-email/auth/verify-email",
            },
            {
              title: "Verify Otp",
              href: "/react-email/auth/verify-otp",
            },

            {
              title: "Shop",
              href: "/react-email/ecommerce/shop",
            },
            {
              title: "Shopping Cart",
              href: "/react-email/ecommerce/shopping-cart",
            },
            {
              title: "Corporate",
              href: "/react-email/corporate",
            },
            {
              title: "Agency",
              href: "/react-email/agency",
            },
            {
              title: "Blog",
              href: "/react-email/blog",
            },
            {
              title: "Photography",
              href: "/react-email/photography",
            },
          ],
        },
      ],
    },
    {
      title: "Tables",
      icon: Grid,
      child: [
        {
          title: "Simple Table",
          href: "/simple-table",
          icon: BarLeft,
        },
        {
          title: "tailwindui table",
          href: "/tailwindui-table",
          icon: BarLeft,
        },
        {
          title: "Data Table",
          href: "/data-table",
          icon: BarTop,
        },
      ],
    },
    {
      title: "Diagram",
      icon: Chart,
      child: [
        {
          title: "Overview",
          href: "/diagram/reactflow/overview",
          icon: "heroicons:information-circle",
        },
        {
          title: "Organization Tree",
          href: "/diagram/reactflow/organization-tree",
          icon: "heroicons:information-circle",
        },
        {
          title: "Update Node",
          href: "/diagram/reactflow/updating",
          icon: "heroicons:information-circle",
        },
        {
          title: "Add Node",
          href: "/diagram/reactflow/add-node",
          icon: "heroicons:information-circle",
        },
        {
          title: "Horizontal Flow",
          href: "/diagram/reactflow/horizontal-flow",
          icon: "heroicons:information-circle",
        },
        {
          title: "Dagree Tree",
          href: "/diagram/reactflow/dagree-tree",
          icon: "heroicons:information-circle",
        },
        {
          title: "Download Diagram",
          href: "/diagram/reactflow/download-diagram",
          icon: "heroicons:information-circle",
        },
        {
          title: "With Minimap",
          href: "/diagram/reactflow/with-minimap",
          icon: "heroicons:information-circle",
        },
        {
          title: "With Background",
          href: "/diagram/reactflow/with-background",
          icon: "heroicons:information-circle",
        },
        {
          title: "Panel Position",
          href: "/diagram/reactflow/panel-position",
          icon: "heroicons:information-circle",
        },
      ],
    },
    {
      title: "Chart",
      icon: ChartArea,
      megaMenu: [
        {
          title: "Apex Chart",
          icon: ChartBar,
          child: [
            {
              title: "Line",
              href: "/charts-appex-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-appex-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Column",
              href: "/charts-appex-column",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-appex-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Combo/Mixed",
              href: "/charts-appex-combo",
              icon: "heroicons:information-circle",
            },
            {
              title: "Range Area",
              href: "/charts-appex-range",
              icon: "heroicons:information-circle",
            },
            {
              title: "Timeline",
              href: "/charts-appex-timeline",
              icon: "heroicons:information-circle",
            },
            {
              title: "Funnel",
              href: "/charts-appex-funnel",
              icon: "heroicons:information-circle",
            },
            {
              title: "Candle Stick",
              href: "/charts-appex-candlestick",
              icon: "heroicons:information-circle",
            },
            {
              title: "Boxplot",
              href: "/charts-appex-boxplot",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-appex-pie",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radar",
              href: "/charts-appex-radar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Polar Area",
              href: "/charts-appex-polararea",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radial Bars",
              href: "/charts-appex-radialbars",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bubble",
              href: "/charts-appex-bubble",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-appex-scatter",
              icon: "heroicons:information-circle",
            },
            {
              title: "Heatmap",
              href: "/charts-appex-heatmap",
              icon: "heroicons:information-circle",
            },
            {
              title: "Treemap",
              href: "/charts-appex-treemap",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "Re Chart",
          icon: PretentionChartLine,
          child: [
            {
              title: "Line",
              href: "/charts-rechart-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-rechart-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-rechart-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-rechart-scatter",
              icon: "heroicons:information-circle",
            },
            {
              title: "Composed",
              href: "/charts-rechart-composed",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-rechart-pie",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radar",
              href: "/charts-rechart-radar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radial Bar",
              href: "/charts-rechart-radialbar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tree Map",
              href: "/charts-rechart-treemap",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "chart js",
          icon: PretentionChartLine2,
          child: [
            {
              title: "Bar",
              href: "/charts-chartjs-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Line",
              href: "/charts-chartjs-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-chartjs-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Other",
              href: "/charts-chartjs-other",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scales",
              href: "/charts-chartjs-scales",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scale Options",
              href: "/charts-chartjs-scaleoptions",
              icon: "heroicons:information-circle",
            },
            {
              title: "Legend",
              href: "/charts-chartjs-legend",
              icon: "heroicons:information-circle",
            },
            {
              title: "Title",
              href: "/charts-chartjs-title",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tooltip",
              href: "/charts-chartjs-tooltip",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scriptable Options",
              href: "/charts-chartjs-scriptable",
              icon: "heroicons:information-circle",
            },
            {
              title: "Animations",
              href: "/charts-chartjs-animations",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "unovis",
          icon: PretentionChartLine,
          child: [
            {
              title: "Line",
              href: "/charts-unovis-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-unovis-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-unovis-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-unovis-scatter",
              icon: "heroicons:information-circle",
            },
          ],
        },
      ],
    },
    {
      title: "Maps",
      icon: Map,
      child: [
        {
          title: "Vector",
          icon: Pointer,
          href: "/maps-vector",
        },
        {
          title: "React Leaflet",
          icon: Map2,
          href: "/map-react-leaflet",
        },

        {
          title: "Leaflet Map",
          icon: ChartBar,
          href: "/map-unovis-leaflet",
        },
        {
          title: "Leaflet Flow",
          icon: ChartArea,
          href: "/map-unovis-flow",
        },
        {
          title: "Leaflet Advance",
          icon: Graph,
          href: "/map-unovis-advance",
        },
      ],
    },
    {
      title: "Icons",
      icon: Icons,
      child: [
        {
          title: "Hero Icons",
          icon: Heroicon,
          href: "/icons-iconify",
        },
        {
          title: "Lucide Icons",
          icon: LucideIcon,
          href: "/icons-lucide",
        },
        {
          title: "Custom Icons",
          icon: CustomIcon,
          href: "/icons-custom",
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [

    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Analyse",
        icon: Graph,
        href: "/analyze",
        requiredPermission: { action: 'manage', subject: 'all' },
        child: [
          {
            title: "Analyse 1",
            href: "/analyze1",
            icon: Graph,
          },
        ],
      },
      {
        title: "Esp.Salarié",
        icon: User,
        child: [
          {
            title: "Accueil",
            href: "/employee-area/home",
          },
          
          {
            title: "RDV du lundi",
            href: "/employee-area/monday-appointments",
          },

          {
            title: "RDV Annuel",
            href: "/employee-area/RDVAnnuel",
          },
          // {
          //   title: "Emplois",
          //   href: "/employee-area/job",
          // },
          // {
          //   title: "Intégrations",
          //   href: "/employee-area/integration",
          // },
        ]
      },
      {
        title: "Outils",
        icon: Stacks2,
        requiredPermission: { action: 'manage', subject: 'all' },
        child: [
          {
            title: 'Changement prix',
            href: "/tools/price-change",
          },
          {
            title: 'Equilibrage',
            href: "/tools/balance",
          },
          {
            title: 'OneRP',
            href: "/tools/onerp",
          },
        ]
      },
      {
        title: "Configuration",
        icon: Settings,
        requiredPermission: { action: 'manage', subject: 'all' },
        child: [
          {
            title: 'Documents',
            href: "/configuration/documents",
          },
          {
            title: 'Quizz',
            href: "/configuration/quizz",
          },
          {
            title: 'Intégration',
            href: "/configuration/integration",
          },

          {
            title: 'Formation',
            href: "/configuration/formation",
          },
        ]
      },
      // {
      //   title: "Site Internet",
      //   icon: DashBoard,
      //   child: [
      //     {
      //       title: "Produits",
      //       href: "/website/products",
      //     },
      //   ]
      // }
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]