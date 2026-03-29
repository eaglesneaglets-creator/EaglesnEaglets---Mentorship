import { useState } from 'react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../modules/store/hooks/useStore';
import AdminProductForm from '../../modules/store/components/AdminProductForm';

const AdminStorePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [resultModal, setResultModal] = useState(null); // { type: 'success'|'error', message }
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: productsData, isLoading, error, refetch } = useProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const products = productsData?.data ?? [];

    const filteredProducts = products.filter((p) => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = ({ data, images }) => {
        if (editingProduct) {
            updateProduct.mutate({ id: editingProduct.id, data, images }, {
                onSuccess: () => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setResultModal({ type: 'success', message: 'Product updated successfully!' });
                },
                onError: (err) => {
                    setResultModal({ type: 'error', message: err.message || 'Failed to update product.' });
                },
            });
        } else {
            createProduct.mutate({ data, images }, {
                onSuccess: () => {
                    setShowForm(false);
                    setResultModal({ type: 'success', message: 'Product created successfully!' });
                },
                onError: (err) => {
                    setResultModal({ type: 'error', message: err.message || 'Failed to create product.' });
                },
            });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = (id, name) => {
        if (!window.confirm(`Archive "${name}"?`)) return;
        deleteProduct.mutate(id, {
            onSuccess: () => setResultModal({ type: 'success', message: `"${name}" has been archived.` }),
            onError: (err) => setResultModal({ type: 'error', message: err.message || 'Failed to archive product.' }),
        });
    };

    const STATUS_BADGE = {
        published: 'bg-emerald-100 text-emerald-700',
        draft: 'bg-slate-100 text-slate-600',
        archived: 'bg-red-100 text-red-600',
    };

    return (
        <DashboardLayout variant="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Store Management</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {filteredProducts.length === products.length
                                ? `${products.length} products`
                                : `${filteredProducts.length} of ${products.length} products`}
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingProduct(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        New Product
                    </button>
                </div>

                {/* Search + Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-700 min-w-36"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Product Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="font-bold text-slate-900 text-lg mb-4">
                                {editingProduct ? 'Edit Product' : 'New Product'}
                            </h2>
                            <AdminProductForm
                                product={editingProduct}
                                onSubmit={handleSubmit}
                                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                                isLoading={createProduct.isPending || updateProduct.isPending}
                            />
                        </div>
                    </div>
                )}

                {/* Result Modal (Success / Error feedback) */}
                {resultModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                            <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                resultModal.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                            }`}>
                                <span className={`material-symbols-outlined text-2xl ${
                                    resultModal.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    {resultModal.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${
                                resultModal.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                            }`}>
                                {resultModal.type === 'success' ? 'Success' : 'Error'}
                            </h3>
                            <p className="text-slate-600 text-sm mb-5">{resultModal.message}</p>
                            <button
                                onClick={() => setResultModal(null)}
                                className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${
                                    resultModal.type === 'success'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400">Loading products...</div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-red-300">cloud_off</span>
                            <p className="text-red-500 font-medium mt-2">Failed to load products</p>
                            <p className="text-slate-400 text-sm mt-1">{error.message}</p>
                            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
                            <p className="text-slate-400 mt-2">No products yet. Create your first product.</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                            <p className="text-slate-400 mt-2">No products match your search.</p>
                            <button
                                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                                className="mt-3 text-primary text-sm hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Product</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Category</th>
                                        <th className="text-right px-5 py-3 font-semibold text-slate-600">Price</th>
                                        <th className="text-right px-5 py-3 font-semibold text-slate-600">Stock</th>
                                        <th className="text-center px-5 py-3 font-semibold text-slate-600">Status</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.primary_image ? (
                                                        <img src={p.primary_image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="material-symbols-outlined text-slate-400 text-base">shopping_bag</span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-slate-900">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">{p.category_name ?? '—'}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-slate-900">₵{Number(p.price).toLocaleString()}</td>
                                            <td className="px-5 py-3 text-right text-slate-600">{p.stock_quantity}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                                        <span className="material-symbols-outlined text-base text-slate-500">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                        <span className="material-symbols-outlined text-base text-slate-400 hover:text-red-500">archive</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminStorePage;