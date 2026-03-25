import { apiClient } from '@api';

const StoreService = {
    // Categories
    getCategories: () => apiClient.get('/store/categories/'),

    // Products
    getProducts: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/store/products/${query}`);
    },
    getProductDetail: (id) => apiClient.get(`/store/products/${id}/`),
    createProduct: (data) => apiClient.post('/store/products/', data),
    updateProduct: (id, data) => apiClient.patch(`/store/products/${id}/`, data),
    deleteProduct: (id) => apiClient.delete(`/store/products/${id}/`),

    // Cart
    getCart: () => apiClient.get('/store/cart/'),
    addToCart: (data) => apiClient.post('/store/cart/items/', data),
    updateCartItem: (id, data) => apiClient.patch(`/store/cart/items/${id}/`, data),
    removeFromCart: (id) => apiClient.delete(`/store/cart/items/${id}/`),

    // Orders
    getOrders: () => apiClient.get('/store/orders/'),
    getOrderDetail: (id) => apiClient.get(`/store/orders/${id}/`),
    createOrder: (data) => apiClient.post('/store/orders/', data),
    cancelOrder: (id) => apiClient.post(`/store/orders/${id}/cancel/`, {}),
};

export default StoreService;
