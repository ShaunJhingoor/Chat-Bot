"use client";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";

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
