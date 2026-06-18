import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductCategory, TabType } from '../types';
import { Search, Filter, ShieldCheck, Box, Settings2, BarChart2, ExternalLink, Cpu } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  setActiveTab: (tab: TabType) => void;
  setSearchTermInTickets?: (search: string) => void;
}

export default function Products({ products, setActiveTab, setSearchTermInTickets }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Multi-toggle Categories
  const handleCategoryToggle = (category: ProductCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Dynamically extract model series & release years
  const models = useMemo(() => {
    const list = products.map(p => p.modelSeries);
    return ['ALL', ...Array.from(new Set(list))];
  }, [products]);

  const years = useMemo(() => {
    const list = products.map(p => p.releaseYear.toString());
    return ['ALL', ...Array.from(new Set(list))];
  }, [products]);

  // Filter Catalog
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelSeries.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = 
        selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);

      const matchesModel = 
        selectedModel === 'ALL' || 
        product.modelSeries === selectedModel;

      const matchesYear = 
        selectedYear === 'ALL' || 
        product.releaseYear.toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesModel && matchesYear;
    });
  }, [products, searchTerm, selectedCategories, selectedModel, selectedYear]);

  // Handle Dynamic Navigation Integrations
  const handleRelatedTickets = (productName: string) => {
    if (setSearchTermInTickets) {
      // Just extract a simple token from the laptop name, e.g. "ThinkPad" or "Legion"
      const token = productName.split(' ')[0];
      setSearchTermInTickets(token);
    }
    setActiveTab('TICKETS');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* 1. Left Section: FILTER & CATALOGUE */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border-2 border-black p-5"
      >
        <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
          <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-950 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-2" />
            FILTER & CATALOGUE
          </h2>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
              setSelectedModel('ALL');
              setSelectedYear('ALL');
            }}
            className="text-[10px] font-mono hover:underline text-neutral-500"
          >
            RESET
          </button>
        </div>

        {/* Local Search */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            LOCAL SEARCH
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Catalogue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2.5 pl-8"
            />
            <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Category list */}
        <div className="space-y-3 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
            CATEGORY
          </span>
          <div className="space-y-2 text-xs font-mono">
            {['Appliance', 'Electronics', 'Software', 'Services'].map((cat) => {
              const isChecked = selectedCategories.includes(cat as ProductCategory);
              return (
                <label key={cat} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat as ProductCategory)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold text-black' : ''}`}>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Model Series dropdown */}
        <div className="space-y-1.5 mb-5 border-t border-neutral-100 pt-4">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            MODEL SERIES
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 p-2 focus:border-black focus:outline-none"
          >
            {models.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Release Year dropdown */}
        <div className="space-y-1.5 mb-5 border-t border-neutral-100 pt-4">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            RELEASE YEAR
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 p-2 focus:border-black focus:outline-none"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Bottom stats boxes */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="border border-neutral-300 p-3 bg-neutral-50">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">TOTAL PRODUCTS</span>
            <span className="text-2xl font-black font-mono text-black">{filteredProducts.length}</span>
          </div>
          <div className="border border-neutral-300 p-3 bg-neutral-50 w-full">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase font-mono">COMMON ISSUES</span>
            <span className="text-2xl font-black font-mono text-black">10</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Right Section: Product Table Dashboard */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white border-2 border-black p-5"
      >
        <div className="border-b border-black pb-3 mb-4 flex justify-between items-center">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black font-sans uppercase text-neutral-900 tracking-tight">
              Product List
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase">
              Tracking fleet warranties, AMC packages and contract renewals
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400">
            {filteredProducts.length} SYSTEM STOCK
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-3 w-28">PRODUCT ID</th>
                <th className="py-3 px-3">NAME</th>
                <th className="py-3 px-3">CATEGORY</th>
                <th className="py-3 px-3 w-32 text-center">ACTIVE CUSTOMERS</th>
                <th className="py-3 px-3 w-32 text-center">WARRANTY COVERAGE</th>
                <th className="py-3 px-3 w-32 text-center">AMC COVERAGE</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  {/* Product ID */}
                  <td className="py-4 px-3 font-mono font-bold text-neutral-900">
                    #{product.id}
                  </td>

                  {/* Name details with series */}
                  <td className="py-4 px-3 font-bold text-neutral-900 font-sans">
                    <div>{product.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">
                      {product.modelSeries} • Release {product.releaseYear}
                    </div>
                  </td>

                  {/* Category with helper icon */}
                  <td className="py-4 px-3 text-neutral-600 font-medium">
                    <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 border border-neutral-300 font-mono text-[10px]">
                      {product.category}
                    </span>
                  </td>

                  {/* Active clients */}
                  <td className="py-4 px-3 text-center font-bold font-mono">
                    {product.activeCustomers}
                  </td>

                  {/* Warranty Coverage stats block */}
                  <td className="py-4 px-3 text-center">
                    <div className="inline-block border border-black px-2 py-1 bg-neutral-50 text-center font-mono">
                      <div className="text-[9px] text-neutral-400 uppercase font-bold">STATUS:</div>
                      <div className="text-[11px] font-black">{product.warrantyCoverage}% COVERED</div>
                    </div>
                  </td>

                  {/* AMC Coverage stats block */}
                  <td className="py-4 px-3 text-center">
                    <div className="inline-block border border-black px-2 py-1 bg-neutral-900 text-white text-center font-mono">
                      <div className="text-[9px] text-neutral-300 uppercase font-bold">STATUS:</div>
                      <div className="text-[11px] font-black">{product.amcCoverage}% COVERED</div>
                    </div>
                  </td>

                  {/* Actions exactly like image layout */}
                  <td className="py-4 px-3 text-right">
                    <div className="flex flex-col space-y-1.5 items-end">
                      <button
                        onClick={() => setActiveTab('ANALYTICS')}
                        className="font-mono text-[9px] font-bold py-1 px-2 border border-black bg-white hover:bg-neutral-100 uppercase flex items-center space-x-1"
                      >
                        <BarChart2 className="w-3 h-3 mr-1" />
                        <span>VIEW ANALYTICS</span>
                      </button>
                      
                      <button
                        onClick={() => handleRelatedTickets(product.name)}
                        className="font-mono text-[9px] font-bold py-1 px-2 border border-black bg-black text-white hover:bg-neutral-800 uppercase flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span>RELATED TICKETS</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    NO LENOVO PRODUCTS IN CATALOG MATCH WITH SPECIFIED FILTERS.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
