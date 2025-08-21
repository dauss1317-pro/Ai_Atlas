"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const changeLanguage = (lng) => {
    const query = searchParams.toString();
    router.push(`${pathname}?${query}`, { locale: lng });
  };

  return (
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={() => changeLanguage("en")}
        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("ms")}
        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
      >
        MS
      </button>
    </div>
  );
}
