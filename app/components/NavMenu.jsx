"use client";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./NavMenu.css"

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div
      style={{
      width: '100vw',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'Black', 
    }}>
        {session?.user?.name}
        <FontAwesomeIcon
        icon={faSignOutAlt}
          onClick={() => {
            signOut();
            redirect("/");
          }}
          className="sign-out-icon" 
        >
        </FontAwesomeIcon>
      </div>
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
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        color: 'white', 
      }}
    >
      <AuthButton />
    </div>
  );
}
