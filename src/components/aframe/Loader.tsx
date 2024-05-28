"use client";
import dynamic from "next/dynamic";
import React from "react";

const LoadLibrary = dynamic(() => import("./LoadLibrary"), { ssr: false });

function Loader() {
  return <LoadLibrary />;
}

export default Loader;
