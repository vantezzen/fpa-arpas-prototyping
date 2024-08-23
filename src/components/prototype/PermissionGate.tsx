import React, { useEffect, useState } from "react";

function PermissionGate({ children }: { children: React.ReactNode }) {
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        await navigator.permissions.query({
          name: "accelerometer" as PermissionName,
        });
        await navigator.permissions.query({
          name: "magnetometer" as PermissionName,
        });
        setHasPermissions(true);
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };

    requestPermissions();
  }, []);

  return hasPermissions ? (
    <>{children}</>
  ) : (
    <div>Confirm permissions to continue</div>
  );
}

export default PermissionGate;
