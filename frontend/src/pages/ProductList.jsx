import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

// Category emoji icons map (fallback for categories without images)
const categoryIcons = {
    'electronics': '📱', 'mobiles': '📱', 'phones': '📞',
    'fashion': '👗', 'clothing': '👕', 'men': '👔', 'women': '👠',
    'home': '🏠', 'furniture': '🪑', 'appliances': '🔌',
    'beauty': '💄', 'health': '💊', 'grocery': '🛒',
    'sports': '⚽', 'toys': '🧸', 'books': '📚',
    'automotive': '🚗', 'garden': '🌿', 'baby': '👶',
    'food': '🍕', 'shoes': '👟', 'watches': '⌚',
    'jewelry': '💎', 'bags': '👜', 'accessories': '🎒',
};

const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
        if (lower.includes(key)) return icon;
    }
    return '🏷️';
};

// Gradient colors for category circles
const categoryColors = [
    'from-blue-400 to-blue-600',
    'from-pink-400 to-rose-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-orange-600',
    'from-purple-400 to-purple-600',
    'from-cyan-400 to-teal-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
];

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const categoryScrollRef = useRef();

    // Search & Filter State — read from URL params too
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const limit = 12;

    // Debounce search (500ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Sync URL search param
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch && urlSearch !== searchQuery) {
            setSearchQuery(urlSearch);
            setDebouncedSearch(urlSearch);
        }
    }, [searchParams]);

    // Reset on filter change
    useEffect(() => {
        setAllProducts([]);
        setPage(0);
        setHasMore(true);
    }, [debouncedSearch, selectedCategory]);

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => { const res = await api.getCategories(); return res.data; },
        staleTime: 30 * 60 * 1000,
    });

    // Fetch products
    const { data: pageData, isFetching } = useQuery({
        queryKey: ['products', debouncedSearch, selectedCategory, page],
        queryFn: async () => {
            const skip = page * limit;
            const params = { skip, limit };
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedCategory) params.category_id = selectedCategory;
            const res = await api.getProducts(params);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });

    // Accumulate products
    useEffect(() => {
        if (!pageData) return;
        if (pageData.length < limit) setHasMore(false);
        if (page === 0) {
            setAllProducts(pageData);
        } else {
            setAllProducts(prev => {
                const ids = new Set(prev.map(p => p.id));
                return [...prev, ...pageData.filter(p => !ids.has(p.id))];
            });
        }
    }, [pageData, page]);

    // Infinite scroll
    const lastRef = useCallback(node => {
        if (isFetching) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(p => p + 1);
        });
        if (node) observer.current.observe(node);
    }, [isFetching, hasMore]);

    const handleCategoryClick = (catId) => {
        setSelectedCategory(prev => prev === catId ? null : catId);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSearchParams({});
    };

    const scrollCategories = (dir) => {
        categoryScrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
    };

    const hasActiveFilters = debouncedSearch || selectedCategory;
    const selectedCatName = categories.find(c => c.id === selectedCategory)?.name;

    return (
        <div className="bg-gray-100 min-h-screen">

            {/* Category Icons Strip — Flipkart style */}
            {categories.length > 0 && (
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
                        {/* Scroll arrows */}
                        <button onClick={() => scrollCategories(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors hidden lg:flex">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button onClick={() => scrollCategories(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors hidden lg:flex">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>

                        <div ref={categoryScrollRef} className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide px-2 scroll-smooth">
                            {/* All Products */}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                            >
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 ${!selectedCategory
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-200 scale-105'
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                    }`}>
                                    {!selectedCategory ? '✨' : '🏪'}
                                </div>
                                <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight ${!selectedCategory ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    All
                                </span>
                            </button>

                            {categories.map((cat, i) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                                >
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 ${selectedCategory === cat.id
                                            ? `bg-gradient-to-br ${categoryColors[i % categoryColors.length]} shadow-lg scale-105`
                                            : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105'
                                        }`}>
                                        {getCategoryIcon(cat.name)}
                                    </div>
                                    <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight max-w-[70px] truncate ${selectedCategory === cat.id ? 'text-indigo-600' : 'text-gray-500'
                                        }`}>
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Page Search Bar (mobile-visible, also works as in-page filter) */}
                <div className="mb-6 sm:hidden">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        {hasActiveFilters ? (
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {selectedCatName || 'Search Results'}
                                </h2>
                                {!isFetching && (
                                    <span className="text-sm text-gray-400">
                                        ({allProducts.length} product{allProducts.length !== 1 ? 's' : ''})
                                    </span>
                                )}
                                {debouncedSearch && (
                                    <span className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">
                                        "{debouncedSearch}"
                                    </span>
                                )}
                            </div>
                        ) : (
                            <h2 className="text-lg font-bold text-gray-900">All Products</h2>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {/* Product Grid */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-200 ${isFetching && allProducts.length > 0 ? 'opacity-60' : 'opacity-100'}`}>
                    {allProducts.map((product, index) => {
                        if (allProducts.length === index + 1) {
                            return (
                                <div ref={lastRef} key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        }
                        return <ProductCard key={product.id} product={product} />;
                    })}
                </div>

                {/* Loading */}
                {isFetching && allProducts.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-100 border-t-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-gray-400">Loading products...</p>
                    </div>
                )}

                {/* Scroll loading */}
                {isFetching && allProducts.length > 0 && (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-indigo-100 border-t-indigo-600 mx-auto"></div>
                    </div>
                )}

                {/* End */}
                {!hasMore && allProducts.length > 0 && !isFetching && (
                    <p className="py-8 text-center text-sm text-gray-400">You've seen all products</p>
                )}

                {/* No results */}
                {!isFetching && allProducts.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            🔍
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try a different search or category.</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all">
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
