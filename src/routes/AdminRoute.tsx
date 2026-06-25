import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

export default function AdminRoute() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted) {
          setAllowed(user.admin);
        }
      })
      .catch(() => {
        if (mounted) {
          setAllowed(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
