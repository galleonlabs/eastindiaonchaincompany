import React from "react";
import logo from "../assets/logo.png";

const Loading: React.FC = () => (
  <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm  justify-center mb-32 mt-16  text-center">
    <img src={logo} className="h-8 w-8 animate-spin flex mx-auto" alt="loading" />
    <p className="mt-4 text-xl text-theme-pan-navy">Loading...</p>
  </div>
);

export default Loading;
