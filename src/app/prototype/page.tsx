"use client";
import NoSsr from "@/components/NoSsr";
import Root from "@/components/prototype/Prototype";
import React, { useEffect } from "react";

export default function PrototypePage() {
  return (
    <NoSsr>
      <Root />
    </NoSsr>
  );
}
