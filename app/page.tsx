"use client";

import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Option", href: "/option" },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a133a] via-[#2a215a] to-[#18122b] flex flex-col">
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="rounded-full border-2 border-[#766CF5] w-8 h-8 flex items-center justify-center">
            <span className="text-[#766CF5] font-bold text-xl">⌥</span>
          </div>
          <span className="text-white font-bold text-2xl tracking-widest">MOOD</span>
        </div>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-white font-medium hover:text-[#766CF5] transition">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-8">
          <span className="text-[#766CF5]">M</span>onad
          <br />
          <span className="text-[#766CF5]">O</span>ption
          <br />
          <span className="text-[#766CF5]">O</span>rderbook
          <br />
          <span className="text-[#766CF5]">D</span>ex
          <br />
        </h1>
      </main>
    </div>
  );
}
