import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Homepage() {
  return (
    <div className="p-12">
      <h1 className="text-4xl font-bold mb-6">Phase 2: Integrations-Analyse</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <Link href="/prototype">
            <Button>✅ THREE.js + WebXR Interactions</Button>
          </Link>
        </div>
      </div>

      <Link href="/compass">
        <Button>Compass Test</Button>
      </Link>
      <Link href="/benchmark">
        <Button>GPS benchmarking</Button>
      </Link>

      <div className="opacity-70">
        <h1 className="text-4xl font-bold mt-12">
          Phase 1: Technolgie-Analyse
        </h1>
        <Image
          src="/data/hiro.png"
          width={300}
          height={300}
          alt="Hiro Marker"
        />

        <h2 className="text-2xl mt-12 font-bold">Marker-based</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium">THREE.js</h2>

            <Link href="/three/arjs">
              <Button>✅ THREE.js + AR.js</Button>
            </Link>
            <Link href="/three/mindar">
              <Button>✅ THREE.js + MindAR</Button>
            </Link>
            <Link href="/three/webxr">
              <Button>✅ THREE.js + WebXR</Button>
            </Link>
            <Link href="/three/webxr-gps">
              <Button>❌ THREE.js + WebXR + GPS</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium">A-Frame</h2>

            <Link href="/aframe/ar">
              <Button>❌ A-Frame + AR.js</Button>
            </Link>
            <Link href="/aframe/xr">
              <Button>❌ A-Frame + WebXR</Button>
            </Link>
          </div>
        </div>

        <h2 className="text-2xl mt-12 font-bold">Location-based</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium">THREE.js</h2>

            <Link href="/three/arjs/location">
              <Button>❌ THREE.js + AR.js</Button>
            </Link>
            <a href="/raw/location.html">
              <Button>✅ A-Frame + AR.js (Raw)</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
