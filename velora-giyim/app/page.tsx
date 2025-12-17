import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import InspirationGallery from "./components/InspirationGallery";

export default function HomePage() {
  return (
    <div className="bg-[#fefcfb] text-gray-900">
      <Hero />
      <ProductGrid />
      <InspirationGallery />

       <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50">
       <link
       href="https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css"
       rel="stylesheet"
       />

       <a
        href="https://wa.me/905427139714?text=Merhaba%20Velora%20ekibi%2C%20sitedeki%20bir%20%C3%BCr%C3%BCn%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
        target="_blank"
        className="w-12 h-12 rounded-full bg-green-500 shadow-lg flex items-center justify-center hover:scale-110 transition"
        >
       <i className="ri-whatsapp-line text-white text-2xl"></i>
       </a>
        <a
          href="https://instagram.com/velora__giyim"
          target="_blank"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 shadow-lg flex items-center justify-center hover:scale-110 transition"
        >
          <i className="ri-instagram-line text-white text-2xl"></i>
        </a>

      </div>
    </div>
  );
}
