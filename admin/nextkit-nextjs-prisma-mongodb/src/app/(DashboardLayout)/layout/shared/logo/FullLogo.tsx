"use client";
import React from "react";
import Image from "next/image";
import Logo from "/public/images/logos/dark-logo.svg";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      {/* Dark Logo   */}
      <Link href="/">
        <span
          className="
      text-2xl font-bold tracking-wide cursor-pointer
      text-black-400
      hover:text-yellow-400
      transition-colors duration-300
      dark:text-yellow-400
      dark:hover:text-black
    "
        >
          Velora Giyim
        </span>
      </Link>{" "}
      {/* Light Logo  */}
      <Image
        src={Logo}
        alt="logo"
        className="hidden dark:block rtl:scale-x-[-1]"
      />
    </Link>
  );
};

export default FullLogo;
