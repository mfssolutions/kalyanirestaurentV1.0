export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  mrp: number;
  price: number;
  image: string;
  fallbackImage: string;
  isVeg: boolean;
  popular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}
