"use client";
import { Badge, Dropdown, Select, Table } from "flowbite-react";

import { TbDotsVertical } from "react-icons/tb";
import Image from "next/image";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ProductPerformance } from "@/app/components/dashboard/ProductPerformance";
const page = () => {
  const PerformersData = [
    {
      key: "performerData1",
      username: "Sunil Joshi",
      designation: "Web Designer",
      project: "Elite Admin",
      priority: "Low",
      color: "primary",
      bgcolor: "bg-primary text-white",
      budget: "3.9k",
    },
    {
      key: "performerData2",
      username: "John Deo",
      designation: "Web Developer",
      project: "Flexy Admin",
      priority: "Medium",
      color: "warning",
      bgcolor: "bg-warning text-white",
      budget: "24.5k",
    },
    {
      key: "performerData3",
      username: "Nirav Joshi",
      designation: "Web Manager",
      project: "Material Pro",
      priority: "High",
      color: "warning",
      budget: "12.8k",
    },
    {
      key: "performerData4",
      username: "Yuvraj Sheth",
      designation: "Project Manager",
      project: "Xtreme Admin",
      priority: "Low",
      color: "success",
      bgcolor: "bg-success text-white",
      budget: "4.8k",
    },
    {
      key: "performerData5",
      username: "Micheal Doe",
      designation: "Content Writer",
      project: "Helping Hands WP Theme",
      priority: "High",
      color: "error",
      bgcolor: "bg-error text-white",
      budget: "9.3k",
    },
  ];
  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:add-circle-outline",
      listtitle: "Add",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Edit",
    },
    {
      icon: "solar:trash-bin-minimalistic-outline",
      listtitle: "Delete",
    },
  ];
  return <ProductPerformance />;
};

export default page;
