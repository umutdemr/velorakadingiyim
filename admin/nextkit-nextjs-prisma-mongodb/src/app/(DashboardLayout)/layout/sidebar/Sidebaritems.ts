export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Ana Sayfa",
    children: [
      {
        name: "Gösterge Paneli",
        icon: "tabler:aperture",
        id: uniqueId(),
        url: "/",
      },
    ],
  },
  {
    heading: "YARDIMCI SERVİSLER",
    children: [
      {
        name: "Kategoriler",
        icon: "tabler:category",
        id: uniqueId(),
        url: "/utilities/categories",
      },

      {
        name: "Ürünler",
        icon: "tabler:table",
        id: uniqueId(),
        url: "/utilities/table",
      },
      {
        name: "Ürün Ekle", // <-- Yeni eklenen sayfa
        icon: "tabler:circle-plus",
        id: uniqueId(),
        url: "/utilities/product",
      },
      {
        name: "Siparişler", // <-- Yeni eklenen sayfa
        icon: "tabler:circle-plus",
        id: uniqueId(),
        url: "/utilities/orders",
      },
    ],
  },
  {
    heading: "Ekstra",
    children: [
      {
        name: "Profil",
        icon: "tabler:user-circle",
        id: uniqueId(),
        url: "/user-profile",
      },
      // {
      //   name: "Icons",
      //   icon: "tabler:mood-smile",
      //   id: uniqueId(),
      //   url: "/icons/tabler",
      // },
      // {
      //   name: "Sample Page",
      //   icon: "tabler:aperture",
      //   id: uniqueId(),
      //   url: "/sample-page",
      // },
    ],
  },
];

export default SidebarContent;
