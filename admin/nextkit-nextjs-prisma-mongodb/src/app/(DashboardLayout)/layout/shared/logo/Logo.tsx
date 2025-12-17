"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
const Logo = () => {
  return (
    <Link href={"/"}>
      <Image src={""} alt="logo" />
    </Link>
  );
};

export default Logo;
