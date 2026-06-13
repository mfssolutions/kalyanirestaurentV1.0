import React from "react";
import { MenuItem } from "../types";
import { ElegantImage } from "./ElegantImage";
import { ShoppingCart } from "lucide-react";

interface ItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-neutral-100 flex flex-col group h-full font-sans">
      {/* Square Sized Item Image on Top part */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 shrink-0">
        <ElegantImage
          src={item.image}
          fallback={item.fallbackImage}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Swiggy/Zomato Style Veg/Non-veg Indicator Tag */}
        <div className="absolute top-2.5 right-2.5 z-10 shadow-xs">
          {item.isVeg ? (
            <div className="w-[14px] h-[14px] border border-green-600 flex items-center justify-center p-[2px] bg-white rounded-xs" title="Veg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
            </div>
          ) : (
            <div className="w-[14px] h-[14px] border border-red-600 flex items-center justify-center p-[2px] bg-white rounded-xs" title="Non-Veg">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </div>
          )}
        </div>
      </div>

      {/* Item Info section with compact layout to avoid empty spacing */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[8px] sm:text-[9px] font-bold text-brand-green bg-brand-green/5 px-2 py-0.5 rounded uppercase tracking-wider font-display">
            {item.category}
          </span>
          <h3 className="font-bold text-neutral-900 group-hover:text-brand-green transition-colors mt-1 text-[11px] sm:text-xs md:text-sm leading-snug line-clamp-1 font-display">
            {item.name}
          </h3>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 mt-0.5 line-clamp-2 leading-tight">
            {item.description}
          </p>
        </div>

        {/* Pricing and Compact Action Row */}
        <div className="mt-2 pt-1.5 border-t border-neutral-100/80 flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-brand-green font-extrabold text-xs sm:text-sm md:text-base leading-none">
              ₹{item.price}
            </span>
            <span className="line-through text-neutral-400 text-[8px] sm:text-[9px] md:text-[10px] mt-0.5 leading-none">
              ₹{item.mrp}
            </span>
          </div>

          {/* Compact Cart Button placed side-by-side to save height */}
          <button
            onClick={() => onAddToCart(item)}
            className="bg-brand-yellow hover:bg-brand-yellow/85 active:scale-95 text-brand-green font-bold text-[9px] sm:text-[10px] md:text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all uppercase shrink-0 leading-none"
            title={`Add ${item.name} to Cart`}
          >
            <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
