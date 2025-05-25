'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/lib/store';
import { getCartItems, removeFromCart, updateCartItemQuantity } from '@/lib/data';
import { CartItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionId } = useProductStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const items = await getCartItems(user?.id, user ? undefined : sessionId);
      setCartItems(items);
      setLoading(false);
    }
    fetchCart();
  }, [sessionId]);

  const handleRemove = async (cartItemId: string) => {
    const success = await removeFromCart(cartItemId);
    if (success) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setError('Failed to remove item from cart');
    }
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    const updatedItem = await updateCartItemQuantity(cartItemId, newQuantity);
    if (updatedItem === null && newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else if (updatedItem) {
      setCartItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? updatedItem : item))
      );
    } else {
      setError('Insufficient stock or error updating quantity');
      setTimeout(() => setError(null), 3000); // Clear error after 3s
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Your cart is empty.</p>
            <Button className="mt-4" onClick={() => router.push('/products')}>
              Shop Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{item.product_title}</h2>
                  <p className="text-sm text-gray-500">
                    {item.option1} / {item.option2}
                  </p>
                  <p className="text-sm font-medium">
                    {(item.price / 1000).toFixed(3)} VND x {item.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    Total: {((item.price * item.quantity) / 1000).toFixed(3)} VND
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {error && (
            <div className={cn('p-4 bg-red-100 text-red-700 rounded-md')}>
              {error}
            </div>
          )}
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">
                Total: {(totalPrice / 1000).toFixed(3)} VND
              </p>
              <Link className="mt-4 w-full" href="/checkout">
                <Button className="w-full" variant="outline">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}