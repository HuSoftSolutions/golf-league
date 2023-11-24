import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import React, { use, useState } from "react";
import { FaBars } from "react-icons/fa";

function Navbar({ style, children }) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getRoutes = () => {
    const routes = [
      // { path: "/", label: "HOME" },
      // More public routes...
    ];
    if (user) {
      if (user.roles?.includes("admin")) {
        routes.push({ path: "/admin", label: "ADMIN" });
        // routes.push({ path: "/register", label: "New Tournament" });
      }
      if (user?.business_id) {
        routes.push({
          path: `/location/${user.business_id}`,
          label: user.business_id,
        });
      } else {
        if (!user?.isAnonymous)
          routes.push({ path: `/account/${user.uid}`, label: "PROFILE" });
      }
    }
    return routes;
  };

  return (
    <nav className="text-sm uppercase">
      <div
        className={`flex items-end justify-start flex-wrap ${
          style === "light"
            ? "bg-white text-primary-800"
            : "bg-primary-800 text-white"
        } p-4`}
      >
        <Link
          href="/"
          className={`hidden text-2xl md:flex mr-4 font-black  bg-clip-text bg-gradient-to-r ${
            style === "light" ? "text-primary-800" : "text-white"
          } animate-gradient font-bruno-ace-sc`}
        >
          GOLF LEAGUE
        </Link>

        <div className="cursor-default hidden md:flex items-end flex-shrink-0 flex-grow  mr-6 mb-1">
          {getRoutes(user).map((route, index) => (
            <Link key={index} href={route.path}>
              <span className=" cursor-pointer block mt-4 lg:inline-block md:mt-0 hover:text-primary-300 mr-4">
                {route.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          {/* Desktop menu */}
          <div className="text-sm flex items-end select-none mb-1">
            {user && !user.isAnonymous ? (
              <>
                <p className="block mt-4 md:inline-block md:mt-0 text-primary-300 mr-4">
                  Welcome, {user.displayName}!
                </p>
                <button
                  onClick={signOut}
                  className="cursor-pointer block mt-4 lg:inline-block md:mt-0 uppercase hover:text-primary-300 mr-4"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className={`inline-block text-sm px-4 py-2 leading-none rounded ${
                  style === "light"
                    ? "bg-white text-primary-800"
                    : "bg-primary-800 text-white"
                } border-white hover:border-transparent hover:text-primary-500 hover:bg-white mt-4 md:mt-0`}
              >
                SIGN IN WITH GOOGLE
              </button>
            )}
          </div>
        </div>

        <div className="flex md:hidden w-full justify-between">
          <h1
            className={`text-2xl font-bruno-ace-sc flex mr-4 font-black ${
              style === "light"
                ? "bg-white text-primary-800"
                : "bg-primary-800 text-white"
            } animate-gradient`}
          >
            GOLF LEAGUE
          </h1>
          {/* Hamburger menu */}
          <button
            onClick={handleToggle}
            className={`flex items-center px-3 py-2 border rounded ${
              style === "light"
                ? "bg-white text-primary-800"
                : "bg-primary-800 text-white"
            }`}
          >
            <FaBars />
          </button>
        </div>

        {isOpen && (
          <div className="w-full block md:hidden mb-1">
            {/* Mobile menu */}
            <div className="text-sm lg:flex-grow select-none">
              {getRoutes(user).map((route, index) => (
                <Link key={index} href={route.path}>
                  <span
                    className={`block mt-4 lg:inline-block md:mt-0 ${
                      style === "light"
                        ? "bg-white text-primary-800"
                        : "bg-primary-800 text-white"
                    } mr-4 py-2 px-4 cursor-pointer`}
                  >
                    {route.label}
                  </span>
                </Link>
              ))}
              {user && !user.isAnonymous ? (
                <div className="flex justify-between items-end">
                  <p
                    className={`block mt-4 lg:inline-block md:mt-0 ${
                      style === "light"
                        ? "bg-white text-primary-800"
                        : "bg-primary-800 text-white"
                    } mr-4`}
                  >
                    Welcome, {user.displayName}!
                  </p>
                  <button
                    onClick={signOut}
                    className="cursor-pointer border-red-400 p-1 rounded block lg:inline-block md:mt-0 text-red-800 font-bold bg-red-100 hover:bg-red-300"
                  >
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className={`inline-block text-sm px-4 py-2 leading-none rounded ${
                    style === "light"
                      ? "bg-white text-primary-800"
                      : "bg-primary-800 text-white"
                  } border-white hover:border-transparent hover:text-primary-500 hover:bg-white mt-4 md:mt-0`}
                >
                  SIGN IN WITH GOOGLE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {children && (
        <div className="flex items-center justify-center text-white bg-primary-600 py-2">
          {children ? children : null}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
