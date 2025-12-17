"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, User, ShoppingBag, Heart } from "lucide-react"; // ✅ Search kaldırıldı, Heart eklendi
import { apiFetch } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

function buildCategoryTree(categories: Category[]) {
  const map = new Map<string, Category & { children: Category[] }>();
  const roots: (Category & { children: Category[] })[] = [];

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  map.forEach((cat) => {
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) parent.children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
}

function mapParentSlug(slug: string) {
  switch (slug) {
    case "alt-giyim":
      return "altgiyim";
    case "ust-giyim":
      return "ustgiyim";
    case "dis-giyim":
      return "disgiyim";
    case "takim":
      return "takim";
    default:
      return slug;
  }
}

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<
    (Category & { children: Category[] })[]
  >([]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    apiFetch<{ data: Category[] }>("/category")
      .then((res) => setCategories(buildCategoryTree(res.data)))
      .catch(console.error);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-[68px] flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Menü"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="font-serif text-2xl tracking-widest">
            VELORA
          </Link>

          <div className="flex gap-4 items-center">
            {/* ✅ Favoriler */}
            <Link
              href="/favorites"
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Favoriler"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* ✅ Login */}
            <Link
              href="/login"
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Giriş yap"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-gray-100"
              aria-label="Sepet"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] px-1 rounded-full">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[9999] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside
            className="relative bg-white w-[85%] md:w-[45%] h-full p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md mb-4"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Mobil hızlı linkler */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-3 font-semibold hover:bg-neutral-50 text-center"
              >
                Favoriler
              </Link>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-3 font-semibold hover:bg-neutral-50 text-center"
              >
                Giriş yap
              </Link>
            </div>

            {categories.map((cat) => (
              <div key={cat.id} className="mb-6">
                <h3 className="text-sm font-semibold tracking-widest mb-3">
                  {cat.name}
                </h3>

                <ul className="space-y-2">
                  {cat.children.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/${mapParentSlug(cat.slug)}/${sub.slug}`}
                        onClick={() => setOpen(false)}
                        className="block py-2 text-[15px] hover:text-[#B39B4C]"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      )}
    </>
  );
}
