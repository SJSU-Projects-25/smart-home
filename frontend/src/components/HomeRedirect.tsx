/** Home page redirect component - client-side only. */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { StoreProvider } from "./StoreProvider";
import { getOverviewPath } from "../utils/roles";

function RedirectLogic() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (user) {
        const overviewPath = getOverviewPath(user.role);
        router.push(overviewPath);
      } else {
        router.push("/login");
      }
    }
  }, [mounted, user, router]);

  return null;
}

export function HomeRedirect() {
  return (
    <StoreProvider>
      <RedirectLogic />
    </StoreProvider>
  );
}
