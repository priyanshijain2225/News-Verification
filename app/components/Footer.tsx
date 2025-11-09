import LogoEye from "./LogoEye";

export default function Footer() {
  return (
    <footer id="footer" className=" w-full bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Section: Logo + Description */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <LogoEye size={35} opacity={1} />
            <h2 className="text-2xl font-bold text-white">TruthLens</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            TruthLens is an AI-powered verification platform that combats
            misinformation across text, images, and video — ensuring
            authenticity in the age of information overload.
          </p>
        </div>

        {/* Middle Section: Navigation */}
        <div className="flex flex-col items-start md:items-center">
          <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: "About", href: "#about" },
              { label: "Features", href: "#features" },
              { label: "Sources", href: "#sources" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="hover:text-orange-400 transition-colors duration-200"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section: Contact + Social */}
        <div className="flex flex-col items-start md:items-end">
          <h3 className="text-white font-semibold mb-4 text-lg">Connect</h3>
          <p className="text-sm text-gray-400 mb-2">
            Email:{" "}
            <a
              href="mailto:team.truthlens@gmail.com"
              className="text-orange-400 hover:text-orange-300"
            >
              team.truthlens@gmail.com
            </a>
          </p>
          <div className="flex gap-4 mt-3">
            <a
              href="https://github.com/hemangjain17/TruthLens"
              target="_blank"
              className="hover:text-orange-400 transition-colors duration-200"
            >
              GitHub
            </a>
            <a
              href="https://www.youtube.com/watch?v=c5hm1IwJJZA"
              target="_blank"
              className="hover:text-orange-400 transition-colors duration-200"
            >
              YouTube
            </a>
            <a
              href="#"
              className="hover:text-orange-400 transition-colors duration-200"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TruthLens. All rights reserved.
      </div>
    </footer>
  );
}
