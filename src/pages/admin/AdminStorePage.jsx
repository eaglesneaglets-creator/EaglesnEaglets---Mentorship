import { useState } from 'react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../modules/store/hooks/useStore';
import AdminProductForm from '../../modules/store/components/AdminProductForm';
import toast from 'react-hot-toast';

const AdminStorePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data: productsData, isLoading } = useProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const products = productsData?.data ?? [];

    const handleSubmit = (data) => {
        if (editingProduct) {
            updateProduct.mutate({ id: editingProduct.id, data }, {
                onSuccess: () => { toast.success('Product updated!'); setShowForm(false); setEditingProduct(null); },
                onError: (err) => toast.error(err.message || 'Update failed'),
            });
        } else {
            createProduct.mutate(data, {
                onSuccess: () => { toast.success('Product created!'); setShowForm(false); },
                onError: (err) => toast.error(err.message || 'Create failed'),
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
            onSuccess: () => toast.success('Product archived'),
            onError: (err) => toast.error(err.message || 'Archive failed'),
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
                        <p className="text-slate-500 text-sm mt-0.5">{products.length} products</p>
                    </div>
                    <button
                        onClick={() => { setEditingProduct(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        New Product
                    </button>
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

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
                            <p className="text-slate-400 mt-2">No products yet. Create your first product.</p>
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
                                    {products.map((p) => (
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
                                            <td className="px-5 py-3 text-right font-semibold text-slate-900">₦{Number(p.price).toLocaleString()}</td>
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
