import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Profile() {
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("loading user");
          // load user
        } else {
          console.log("navigating to sign-in");
          navigate("/sign-in");
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  return (
    <div>
      <header>Home Page</header>
      <main>
        <button>Play Game</button>
      </main>
    </div>
  );
}

export default Profile;
