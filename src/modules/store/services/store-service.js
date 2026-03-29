import { apiClient } from '@api';

/**
 * Build a multipart FormData from product data + image files.
 * Non-file fields go as form fields; files go under "images".
 */
function buildProductFormData(data, images = []) {
    const formData = new FormData();
    const fields = ['name', 'description', 'category_id', 'price', 'stock_quantity', 'status'];
    for (const key of fields) {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            formData.append(key, data[key]);
        }
    }
    for (const file of images) {
        formData.append('images', file);
    }
    return formData;
}

const StoreService = {
    // Categories
    getCategories: () => apiClient.get('/store/categories/'),

    // Products
    getProducts: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/store/products/${query}`);
    },
    getProductDetail: (id) => apiClient.get(`/store/products/${id}/`),
    getProductBySlug: (slug) => apiClient.get(`/store/products/by-slug/${slug}/`),

    createProduct: ({ data, images = [] }) => {
        const formData = buildProductFormData(data, images);
        return apiClient.upload('/store/products/', formData);
    },

    updateProduct: (id, { data, images = [] }) => {
        const formData = buildProductFormData(data, images);
        return apiClient.upload(`/store/products/${id}/`, formData, { method: 'PATCH' });
    },

    deleteProduct: (id) => apiClient.delete(`/store/products/${id}/`),

    // Standalone image upload for existing products
    uploadProductImages: (productId, images) => {
        const formData = new FormData();
        for (const file of images) {
            formData.append('images', file);
        }
        return apiClient.upload(`/store/products/${productId}/images/`, formData);
    },

    deleteProductImage: (productId, imageId) =>
        apiClient.delete(`/store/products/${productId}/images/${imageId}/`),

    // Cart
    getCart: () => apiClient.get('/store/cart/'),
    addToCart: (data) => apiClient.post('/store/cart/items/', data),
    updateCartItem: (id, data) => apiClient.patch(`/store/cart/items/${id}/`, data),
    removeFromCart: (id) => apiClient.delete(`/store/cart/items/${id}/`),

    // Guest checkout (no auth required)
    guestCheckout: (data) => apiClient.post('/store/guest-checkout/', data, { skipAuth: true }),
    getGuestOrderDetail: (id) => apiClient.get(`/store/guest-orders/${id}/`, { skipAuth: true }),

    // Orders
    getOrders: () => apiClient.get('/store/orders/'),
    getOrderDetail: (id) => apiClient.get(`/store/orders/${id}/`),
    createOrder: (data) => apiClient.post('/store/orders/', data),
    cancelOrder: (id) => apiClient.post(`/store/orders/${id}/cancel/`, {}),

    // Admin Orders
    getAdminOrders: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/store/admin/orders/${query}`);
    },
    getAdminOrderDetail: (id) => apiClient.get(`/store/admin/orders/${id}/`),
    updateAdminOrderStatus: (id, data) => apiClient.patch(`/store/admin/orders/${id}/update-status/`, data),

    // Payment (MM-20)
    // Initialize a Paystack transaction — returns { authorization_url, reference }
    initializePayment: (orderId) =>
        apiClient.post(`/store/orders/${orderId}/initialize-payment/`, {}, { skipAuth: true }),

    // Verify order payment status after Paystack redirect — skipAuth for guest orders
    verifyPayment: (orderId) =>
        apiClient.post(`/store/orders/${orderId}/verify/`, {}, { skipAuth: true }),
};

export default StoreService;
