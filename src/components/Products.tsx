import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Product, TabType } from '../types';
import { Search, Filter, BarChart2, ExternalLink, ShieldCheck, Wrench, Box } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  setActiveTab: (tab: TabType) => void;
  setSearchTermInTickets?: (search: string) => void;
}

export default function Products({ products, setActiveTab, setSearchTermInTickets }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('ALL');

  // Dynamically extract models
  const models = useMemo(() => {
    const list = products.map(p => p.model).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [products]);

  // Filter Catalog
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModel = 
        selectedModel === 'ALL' || 
        product.model === selectedModel;

      return matchesSearch && matchesModel;
    });
  }, [products, searchTerm, selectedModel]);

  // Handle Dynamic Navigation Integrations
  const handleRelatedTickets = (productName: string) => {
    if (setSearchTermInTickets) {
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
              setSelectedModel('ALL');
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
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2.5 pl-8"
            />
            <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Model Series dropdown */}
        <div className="space-y-1.5 mb-5 border-t border-neutral-100 pt-4">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            MODEL
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

        {/* Bottom stats boxes */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="border border-neutral-300 p-3 bg-neutral-50">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">CATALOG SIZE</span>
            <span className="text-2xl font-black font-mono text-black">{filteredProducts.length}</span>
          </div>
          <div className="border border-neutral-300 p-3 bg-neutral-50 w-full">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">ACTIVE USERS</span>
            <span className="text-2xl font-black font-mono text-black">
              {filteredProducts.reduce((sum, p) => sum + p.activeCustomers, 0)}
            </span>
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
              Product Catalog
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase">
              Global hardware and service products offered on Lenovo Enterprise Support
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400">
            {filteredProducts.length} PRODUCTS IN CATALOG
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-3">PRODUCT</th>
                <th className="py-3 px-3">MODEL</th>
                <th className="py-3 px-3">DESCRIPTION</th>
                <th className="py-3 px-3 text-center">BASE WARRANTY</th>
                <th className="py-3 px-3 text-center">ACTIVE CUSTOMERS</th>
                <th className="py-3 px-3 text-center">WARRANTY COV.</th>
                <th className="py-3 px-3 text-center">AMC COV.</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  {/* Product Details */}
                  <td className="py-4 px-3 font-bold text-neutral-900 font-sans">
                    <div className="flex items-center space-x-3">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-10 h-10 object-cover border border-neutral-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-100 border border-neutral-300 flex items-center justify-center">
                          <Box className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <div>{product.name}</div>
                        <div className="text-[9px] text-neutral-400 font-mono font-normal">ID: #{product.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  {/* Model */}
                  <td className="py-4 px-3 font-mono font-semibold text-neutral-800">
                    {product.model}
                  </td>

                  {/* Description */}
                  <td className="py-4 px-3 text-neutral-600 max-w-xs font-normal truncate">
                    {product.description || 'No description provided.'}
                  </td>

                  {/* Base Warranty Days */}
                  <td className="py-4 px-3 text-center font-mono font-semibold">
                    {product.baseWarrantyDays} days
                  </td>

                  {/* Active Customers */}
                  <td className="py-4 px-3 text-center font-bold font-mono">
                    {product.activeCustomers}
                  </td>

                  {/* Warranty Coverage stats block */}
                  <td className="py-4 px-3 text-center">
                    <div className="inline-block border border-black px-2 py-1 bg-neutral-50 text-center font-mono text-[10px]">
                      <div className="font-black">{product.activeCustomers > 0 ? `${product.warrantyCoverage}%` : '0%'}</div>
                    </div>
                  </td>

                  {/* AMC Coverage stats block */}
                  <td className="py-4 px-3 text-center">
                    <div className="inline-block border border-black px-2 py-1 bg-neutral-900 text-white text-center font-mono text-[10px]">
                      <div className="font-black">{product.activeCustomers > 0 ? `${product.amcCoverage}%` : '0%'}</div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-3 text-right">
                    <div className="flex flex-col space-y-1.5 items-end">
                      <button
                        onClick={() => setActiveTab('ANALYTICS')}
                        className="font-mono text-[9px] font-bold py-1 px-2 border border-black bg-white hover:bg-neutral-100 uppercase flex items-center space-x-1"
                      >
                        <BarChart2 className="w-3 h-3 mr-1" />
                        <span>ANALYTICS</span>
                      </button>
                      
                      <button
                        onClick={() => handleRelatedTickets(product.name)}
                        className="font-mono text-[9px] font-bold py-1 px-2 border border-black bg-black text-white hover:bg-neutral-800 uppercase flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span>TICKETS</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 font-mono">
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
