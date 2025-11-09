"use client";
import LogoEye from "./LogoEye";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-orange-50 z-50">
      <div className="animate-pulse mb-3">
        <LogoEye size={80} />
      </div>
      <h1 className="text-2xl font-bold text-orange">TruthLens</h1>
    </div>
  );
}
