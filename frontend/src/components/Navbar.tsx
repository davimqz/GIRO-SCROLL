import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Logo from "../assets/logo/giro_logo.png";
export default function Navbar() {
  const { authenticated, user, login, logout } = usePrivy();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#fbf7f1] shadow z-50">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

          {/* ESQUERDA */}
          <div className="flex items-center gap-3">
            <img src={Logo} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-lg">Giro</span>
          </div>

          {/* CENTRO */}
          <ul className="flex items-center gap-10 text-sm font-medium">
            <li className="cursor-pointer text-black">Home</li>
            <li className="cursor-pointer text-black">Sobre Nós</li>
            <li className="cursor-pointer text-black">Planos</li>
          </ul>

          {/* DIREITA */}
          <div>
            {!authenticated ? (
              <button
                onClick={login}
                className="px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm"
              >
                Login
              </button>
            ) : (
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm"
              >
                {user?.wallet?.address
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : "Logout"}
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Spacer para empurrar o conteúdo */}
      
    </>
  );
}
