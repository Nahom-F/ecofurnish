"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        signOut();
        router.push("/");
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
