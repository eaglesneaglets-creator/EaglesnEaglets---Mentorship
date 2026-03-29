/**
 * useGuestCart — localStorage-based cart for unauthenticated users.
 * Mirrors the shape of the API cart so CartPage can use both interchangeably.
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'guest_cart';

const readCart = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const writeCart = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useGuestCart = () => {
    const [items, setItems] = useState(() => readCart());

    // Sync across tabs
    useEffect(() => {
        const handler = (e) => {
            if (e.key === STORAGE_KEY) setItems(readCart());
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const addItem = useCallback((product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            let next;
            if (existing) {
                next = prev.map((i) =>
                    i.product_id === product.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            } else {
                next = [
                    ...prev,
                    {
                        id: product.id, // use product id as item id for guests
                        product_id: product.id,
                        product_name: product.name,
                        product_slug: product.slug,
                        unit_price: product.price,
                        primary_image: product.images?.[0]?.image_url ?? null,
                        quantity,
                    },
                ];
            }
            writeCart(next);
            return next;
        });
    }, []);

    const updateItem = useCallback((productId, quantity) => {
        setItems((prev) => {
            const next = quantity < 1
                ? prev.filter((i) => i.product_id !== productId)
                : prev.map((i) => i.product_id === productId ? { ...i, quantity } : i);
            writeCart(next);
            return next;
        });
    }, []);

    const removeItem = useCallback((productId) => {
        setItems((prev) => {
            const next = prev.filter((i) => i.product_id !== productId);
            writeCart(next);
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        writeCart([]);
        setItems([]);
    }, []);

    const total = items.reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return { items, total, itemCount, addItem, updateItem, removeItem, clearCart };
};
