'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCartItems, removeFromCart } from '@/lib/data';
import { CartItem } from '@/lib/types';
import { useProductStore } from '@/lib/store';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { cart, removeFromCart: removeFromStoreCart, sessionId } = useProductStore();

  useEffect(() => {
    async function fetchCart() {
      const items = await getCartItems(sessionId);
      setCartItems(items);
    }
    fetchCart();
  }, [sessionId]);

  const handleRemove = async (cartItemId: string) => {
    const success = await removeFromCart(cartItemId, sessionId);
    if (success) {
      removeFromStoreCart(cartItemId);
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_title}</TableCell>
                  <TableCell>
                    {item.option1}, {item.option2}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{(item.price / 1000).toFixed(3)} VND</TableCell>
                  <TableCell>{(item.price * item.quantity / 1000).toFixed(3)} VND</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6">
            <p className="text-xl font-semibold">Subtotal: {(subtotal / 1000).toFixed(3)} VND</p>
            <Button className="mt-4" disabled>
              Proceed to Checkout (Coming Soon)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}