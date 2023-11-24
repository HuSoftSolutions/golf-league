// hoc/withAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth"; // assuming useAuth is exported from hooks/useAuth.js

export default function withAuth(Component, authorization) {
  return function AuthenticatedComponent(props) {
		const { user, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
			if(!router) return;

			

      if (user === false) {
        // If user is explicitly set to false, it means authentication check is done and user is not authenticated
        router.push("/");
      } else if (
        user &&
        authorization !== null &&
        !user?.admin
      ) {
        // User is authenticated but doesn't have admin role
        router.push("/");
      }
      // If user is undefined/null, the authentication check is still in progress, so we do nothing
    }, [user, router, signInWithGoogle, isSigningIn]);

    // Render the component only if the user is authenticated and has the admin role
    if (user) {
      return <Component {...props} />;
    } else {
      // User is not authenticated or doesn't have the admin role, render nothing
      return null;
    }
  };
}
