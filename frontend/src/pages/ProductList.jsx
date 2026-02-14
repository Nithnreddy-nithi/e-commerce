import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const limit = 8; // Items per page

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const skip = page * limit;
            const response = await api.getProducts({ skip, limit }); // Pass params object

            const newProducts = response.data;

            if (newProducts.length < limit) {
                setHasMore(false);
            }

            setProducts(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewProducts];
            });
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        if (hasMore) {
            fetchProducts();
        }
    }, [fetchProducts]); // Fetch when page changes

    // Infinite Scroll Observer
    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);


    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Latest Products</h2>

                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product, index) => {
                        if (products.length === index + 1) {
                            return (
                                <div ref={lastElementRef} key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        } else {
                            return <ProductCard key={product.id} product={product} />;
                        }
                    })}
                </div>

                {loading && (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading more products...</p>
                    </div>
                )}

                {!hasMore && products.length > 0 && (
                    <p className="py-8 text-center text-gray-500">You have reached the end of the list.</p>
                )}

                {!loading && products.length === 0 && (
                    <p className="mt-4 text-gray-500">No products found.</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;
