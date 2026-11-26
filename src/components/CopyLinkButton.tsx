"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 bg-white text-orange-500 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition flex-shrink-0"
    >
      {copied ? (
        <><Check className="w-4 h-4 text-green-500" /> Copiado!</>
      ) : (
        <><Copy className="w-4 h-4" /> Copiar</>
      )}
    </button>
  );
}
