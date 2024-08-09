"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./NavMenu.css";
import { CircularProgress, Box } from "@mui/material";

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
        }}
      >
        {session?.user?.name}
        <FontAwesomeIcon
          icon={faSignOutAlt}
          onClick={() => {
            signOut();
            redirect("/");
          }}
          className="sign-out-icon"
        />
      </div>
    );
  }
  if (!session) {
    return redirect("/");
  }
  console.log(session);
}

export default function NavMenu() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate CSS loading with a timeout
    const timer = setTimeout(() => setLoading(false), 200); 

    return () => clearTimeout(timer); 
  }, []);

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
        position: 'relative',
        marginBottom: "1rem",
      }}
    >
      {loading ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'inherit',
            color:"black",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <AuthButton />
      )}
    </div>
  );
}
