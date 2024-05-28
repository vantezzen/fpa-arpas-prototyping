"use client";
import NoSsr from "@/components/NoSsr";
import { Button } from "@/components/ui/button";
import Root from "@/components/webxr/ThreeGpsRoot";
import React, { useEffect } from "react";

export default function Home() {
  return (
    <NoSsr>
      <Root />
    </NoSsr>
  );
}
