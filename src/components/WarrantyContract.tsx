import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Search, ShieldAlert, BadgeInfo, Calendar, CheckSquare, ClipboardList, PenTool, Radio } from 'lucide-react';

interface ContractItem {
  id: string;
  customerName: string;
  deviceName: string;
  type: 'WARRANTY' | 'AMC';
  coverageType: string; // e.g. Premier Support Plus On-site
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RENEWAL REQ';
}

interface WarrantyContractProps {
  products: Product[];
  tabType: 'WARRANTY' | 'AMC';
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function WarrantyContract({ products, tabType, onShowToast }: WarrantyContractProps) {
  const [search, setSearch] = useState('');

  const contracts: ContractItem[] = useMemo(() => {
    return [
      {
        id: 'LNC-8021',
        customerName: 'Acme Corp',
        deviceName: 'ThinkPad X1 Carbon Gen 12 (430 units)',
        type: 'WARRANTY',
        coverageType: 'Premier On-Site Repair 24/7 Cover',
        startDate: '2023-01-15',
        endDate: '2026-01-15',
        status: 'ACTIVE',
      },
      {
        id: 'LNC-8022',
        customerName: 'Vertex Group',
        deviceName: 'Legion Pro 7i Core i9 (120 units)',
        type: 'WARRANTY',
        coverageType: 'Accidental Damage Protection (ADP)',
        startDate: '2024-02-01',
        endDate: '2027-02-01',
        status: 'ACTIVE',
      },
      {
        id: 'LNC-8023',
        customerName: 'Globex Inc',
        deviceName: 'Yoga Book Dual Screen leases',
        type: 'AMC',
        coverageType: 'Annual Maintenance Fleet Cover',
        startDate: '2023-05-10',
        endDate: '2024-05-10',
        status: 'RENEWAL REQ',
      },
      {
        id: 'LNC-8024',
        customerName: 'Soylent Corp',
        deviceName: 'ThinkCentre Tiny Desktop fleet',
        type: 'WARRANTY',
        coverageType: 'Depot Repair Standard Warranty',
        startDate: '2021-03-12',
        endDate: '2024-03-12',
        status: 'EXPIRED',
      },
      {
        id: 'LNC-8025',
        customerName: 'TechNova',
        deviceName: 'ThinkStation P620 custom towers (5 units)',
        type: 'AMC',
        coverageType: 'Mission-Critical 4hr Response AMC',
        startDate: '2022-09-01',
        endDate: '2025-09-01',
        status: 'ACTIVE',
      },
      {
        id: 'LNC-8026',
        customerName: 'CyberDyne Labs',
        deviceName: 'ThinkPad L14 secure systems fleet',
        type: 'AMC',
        coverageType: 'Standard SLA Server Cover',
        startDate: '2023-11-20',
        endDate: '2024-11-20',
        status: 'ACTIVE',
      },
      {
        id: 'LNC-8027',
        customerName: 'Hooli Inc',
        deviceName: 'Lenovo Cloud Fleet management software',
        type: 'AMC',
        coverageType: 'Cloud Software patch release license',
        startDate: '2023-08-15',
        endDate: '2024-08-15',
        status: 'ACTIVE',
      },
    ];
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const typeMatch = c.type === tabType;
      const textMatch = 
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      return typeMatch && textMatch;
    });
  }, [contracts, search, tabType]);

  const handleDispatch = (item: ContractItem) => {
    if (onShowToast) {
      onShowToast(`Onsite Technician Dispatch Requested: Lenovo Support engineer notified for account '${item.customerName}', targeting: ${item.deviceName}.`, 'success');
    } else {
      alert(`Onsite Technician Dispatch Requested: Lenovo Support engineer notified for account '${item.customerName}', targeting: ${item.deviceName}.`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black p-5">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">ACTIVE SUITE CONTRACTS</span>
          <span className="text-3xl font-black font-mono block mt-1 text-neutral-900">
            {contracts.filter(c => c.type === tabType && c.status === 'ACTIVE').length} Accounts
          </span>
          <span className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Guarding enterprise hardware workloads</span>
        </div>

        <div className="bg-white border-2 border-black p-5">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">RENEWAL AUDITS</span>
          <span className="text-3xl font-black font-mono block mt-1 text-red-600">
            {contracts.filter(c => c.type === tabType && (c.status === 'RENEWAL REQ' || c.status === 'EXPIRED')).length} Pending
          </span>
          <span className="text-[10px] font-mono text-medium text-red-400 uppercase mt-1">Needs urgent sales dispatch</span>
        </div>

        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">PREMIER TELEMETRY</span>
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-green-600">
            <Radio className="w-4 h-4 text-green-500 animate-pulse" />
            <span>CONTRACT GATEWAY SYNCED</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase mt-1">Updates live every 24h</span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border-2 border-black p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-3 mb-4 gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-black font-sans uppercase text-neutral-900 tracking-tight">
              {tabType === 'WARRANTY' ? 'Lenovo Hardware Warranty Register' : 'Annual Maintenance Contracts (AMC)'}
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase">
              Tracking corporate client lease parameters and Premier onsite warranties
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Coverages & Accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2 pl-7 text-[11px]"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-2.5 px-3 w-28">CONTRACT ID</th>
                <th className="py-2.5 px-3">CUSTOMER CLIENT</th>
                <th className="py-2.5 px-3">LEASED DEVICER DETAILS</th>
                <th className="py-2.5 px-3">WARRANTY/AMC TIER</th>
                <th className="py-2.5 px-3 w-40 text-center">DURATION TIMELINE</th>
                <th className="py-2.5 px-3 w-20 text-center">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredContracts.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-neutral-900">
                    #{item.id}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-neutral-900 font-sans">
                    {item.customerName}
                  </td>

                  <td className="py-3.5 px-3 text-neutral-700 font-medium">
                    {item.deviceName}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="bg-neutral-150 border border-neutral-350 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-neutral-600">
                      {item.coverageType}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-neutral-500">
                    <div className="text-[10px] font-semibold">{item.startDate}</div>
                    <div className="text-[9px] text-neutral-450 uppercase">to {item.endDate}</div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border ${
                      item.status === 'ACTIVE' ? 'border-green-600 text-green-700 bg-green-50' :
                      item.status === 'RENEWAL REQ' ? 'border-amber-600 text-amber-700 bg-amber-50 animate-pulse' :
                      'border-red-400 text-red-500 bg-red-50'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {item.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleDispatch(item)}
                          className="font-mono text-[9px] font-bold py-1 px-1.5 border border-black bg-black text-white hover:bg-neutral-850 uppercase"
                        >
                          DISPATCH TECH
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const message = `Sales Quote Triggered: AMC renewal contract emailed to finance admin at '${item.customerName}'`;
                            if (onShowToast) {
                              onShowToast(message, 'success');
                            } else {
                              alert(message);
                            }
                          }}
                          className="font-mono text-[9px] font-bold py-1 px-1.5 border border-red-600 bg-white text-red-600 hover:bg-red-50 uppercase flex items-center space-x-1"
                        >
                          <span>TRIGGER RENEW</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    NO ACTIVE COVERED CONTRACT LAYOUTS RECORDED.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
