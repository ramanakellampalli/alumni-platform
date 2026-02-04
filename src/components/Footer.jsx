import { Server, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-green-400" />
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-white">OhYeah Software Pvt Ltd</h2>
            <p className="text-xs text-gray-400 leading-snug max-w-md">
              We build clean, scalable, and delightful software experiences. Turning ideas into reliable products.
            </p>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <a
            href="https://ohyeahsaas.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 font-medium flex items-center gap-1 transition hover:text-white"
          >
            https://ohyeahsaas.com <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-[11px] text-gray-500 mt-1">© {new Date().getFullYear()} OhYeah Software Pvt Ltd</span>
        </div>
      </div>
    </footer>
  );
}
