"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
const ACTIVE_ROUTE = "py-1 px-2 text-gray-300 bg-gray-700";
const INACTIVE_ROUTE =
  "py-1 px-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700";

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session?.user?.name} <br />
        <button
          onClick={() => {
            signOut();
            redirect("/");
          }}
        >
          Sign Out
        </button>
      </>
    );
  }
  if (!session) {
    return redirect("/");
  }
  console.log(session);
}
export default function NavMenu() {
  const pathname = usePathname();
  return (
    <div style={{ "width": "90vw",fontWeight: "bold"}}>
      <AuthButton />
    </div>
  );
}
