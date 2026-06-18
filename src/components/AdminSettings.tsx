import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlaRule, TicketPriority } from '../types';
import { Settings, Shield, ShieldCheck, Mail, Sliders, Play, Trash, Plus, Search, Check, ChevronDown, Save, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface AdminSettingsProps {
  slaRules: SlaRule[];
  onAddSlaRule: (rule: SlaRule) => void;
  onUpdateSlaRule: (id: string, updated: SlaRule) => void;
  onToggleSlaRule: (id: string) => void;
  onDeleteSlaRule: (id: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminSettings({
  slaRules,
  onAddSlaRule,
  onUpdateSlaRule,
  onToggleSlaRule,
  onDeleteSlaRule,
  onShowToast,
}: AdminSettingsProps) {
  // Left Categories
  const categories = [
    { id: 'user', label: 'USER MANAGEMENT' },
    { id: 'roles', label: 'ROLES & PERMISSIONS' },
    { id: 'dept', label: 'DEPARTMENTS' },
    { id: 'sla', label: 'SLA RULES', active: true },
    { id: 'escalate', label: 'ESCALATION RULES' },
    { id: 'notify', label: 'NOTIFICATION SETTINGS' },
    { id: 'email', label: 'EMAIL TEMPLATES' },
    { id: 'sms', label: 'SMS TEMPLATES' },
    { id: 'api', label: 'API KEYS' },
    { id: 'integrate', label: 'INTEGRATIONS' },
  ];

  const [activeCategory, setActiveCategory] = useState('sla');
  const [slaSearchTerm, setSlaSearchTerm] = useState('');

  // Add/Edit Rule States
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleDept, setRuleDept] = useState('L1 Support');
  const [rulePriority, setRulePriority] = useState<TicketPriority>('CRITICAL');
  const [ruleResolutionTime, setRuleResolutionTime] = useState('4h');
  const [ruleNotification, setRuleNotification] = useState('[Notify L1 Team]');
  const [ruleCondition, setRuleCondition] = useState('Resolution Time');

  // Search Settings tree state
  const [settingsSearch, setSettingsSearch] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.label.toLowerCase().includes(settingsSearch.toLowerCase()));
  }, [settingsSearch]);

  // Filter SLA active rules table
  const filteredSlaRules = useMemo(() => {
    return slaRules.filter(rule => {
      const matchText = 
        rule.ruleName.toLowerCase().includes(slaSearchTerm.toLowerCase()) ||
        rule.id.toLowerCase().includes(slaSearchTerm.toLowerCase()) ||
        rule.department.toLowerCase().includes(slaSearchTerm.toLowerCase());
      return matchText;
    });
  }, [slaRules, slaSearchTerm]);

  // Handle Edit Action
  const handleEditClick = (rule: SlaRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.ruleName);
    setRuleDept(rule.department);
    setRulePriority(rule.priority);
    setRuleResolutionTime(rule.resolutionTime);
    setRuleNotification(rule.notification);
    setRuleCondition(rule.condition);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    if (editingRuleId) {
      // Save edits
      const updated: SlaRule = {
        id: editingRuleId,
        ruleName,
        department: ruleDept,
        condition: ruleCondition,
        priority: rulePriority,
        resolutionTime: ruleResolutionTime,
        notification: ruleNotification,
        status: 'ENABLED',
      };
      onUpdateSlaRule(editingRuleId, updated);
      if (onShowToast) {
        onShowToast(`SLA Rule ${editingRuleId} modified customized guidelines.`, 'success');
      } else {
        alert(`SLA Rule ${editingRuleId} modified.`);
      }
      setEditingRuleId(null);
    } else {
      // Create new
      const randomId = `SLA-${Math.floor(100 + Math.random() * 900)}`;
      const newRule: SlaRule = {
        id: randomId,
        ruleName,
        department: ruleDept,
        condition: ruleCondition,
        priority: rulePriority,
        resolutionTime: ruleResolutionTime,
        notification: ruleNotification,
        status: 'ENABLED',
      };
      onAddSlaRule(newRule);
      if (onShowToast) {
        onShowToast(`Success: ${randomId} SLA Rule registered.`, 'success');
      } else {
        alert(`Success: ${randomId} SLA Rule registered.`);
      }
    }

    // Reset Form
    setRuleName('');
  };

  const handleCancel = () => {
    setEditingRuleId(null);
    setRuleName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* 1. Left Section: SETTINGS CATEGORIES */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border-2 border-black p-5"
      >
        <div className="border-b border-black pb-2 mb-4">
          <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-950">
            SETTINGS CATEGORIES
          </h2>
        </div>

        {/* Categories search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search Categories..."
            value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2 pl-7 text-[11px]"
          />
          <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-neutral-400" />
        </div>

        {/* Tree List */}
        <div className="space-y-1 font-mono text-xs">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.id === 'sla') setActiveCategory('sla');
                else {
                  const msg = `Demo Action: '${cat.label}' settings category is accessible in Premier administration mode.`;
                  if (onShowToast) {
                    onShowToast(msg, 'info');
                  } else {
                    alert(msg);
                  }
                }
              }}
              className={`w-full text-left py-2 px-3 flex items-center justify-between border transition-all ${
                cat.id === activeCategory
                  ? 'bg-neutral-100 text-black border-black font-bold'
                  : 'text-neutral-500 border-transparent hover:text-black hover:bg-neutral-50'
              }`}
            >
              <span>{cat.label}</span>
              {cat.id === 'sla' && <span className="bg-black text-[9px] text-white px-1.5 py-0.5">ACTIVE</span>}
            </button>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-4 text-neutral-400">No match.</div>
          )}
        </div>
      </motion.div>

      {/* 2. Right Section: Active Rule tables & Form */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 space-y-6"
      >
        {/* Top Summary Widgets card */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="border border-black p-4 bg-white">
            <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">TOTAL ADMINS</span>
            <span className="text-3xl font-black font-mono mt-1 text-neutral-900 block">1,284</span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-1">Lenovo Fleet authorized agents</span>
          </div>
          <div className="border border-black p-4 bg-white">
            <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">ACTIVE SLA RULES</span>
            <span className="text-3xl font-black font-mono mt-1 text-black block">{slaRules.filter(r => r.status === 'ENABLED').length}</span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-1">Under strict warranty monitor</span>
          </div>
        </div>

        {/* SLA active list card */}
        <div className="bg-white border-2 border-black p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-3 mb-4 gap-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-black font-sans uppercase text-neutral-900 tracking-tight">Active SLA Rules</h3>
              <p className="font-mono text-[10px] text-neutral-400 uppercase">Manage automatic system alerts for response time thresholds</p>
            </div>

            {/* Quick Sla Search */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search Active SLA Rules..."
                value={slaSearchTerm}
                onChange={(e) => setSlaSearchTerm(e.target.value)}
                className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2 pl-7"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-2.5 px-3 w-20">RULE ID</th>
                  <th className="py-2.5 px-3">RULE NAME</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3 w-16 text-center">PRIORITY</th>
                  <th className="py-2.5 px-3 w-20 text-center">TIME limit</th>
                  <th className="py-2.5 px-3 text-center">NOTIFICATION</th>
                  <th className="py-2.5 px-3 w-20 text-center">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredSlaRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                      #{rule.id}
                    </td>

                    <td className="py-3 px-3 font-bold text-neutral-900 font-sans">
                      {rule.ruleName}
                    </td>

                    <td className="py-3 px-3 font-semibold text-neutral-600 font-mono text-[10px]">
                      {rule.department}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border ${
                        rule.priority === 'CRITICAL' ? 'border-red-700 text-white bg-red-700' :
                        rule.priority === 'HIGH' ? 'border-black text-white bg-black' :
                        'border-neutral-300 text-neutral-800 bg-neutral-100'
                      }`}>
                        {rule.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {rule.resolutionTime}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[10px] text-neutral-500">
                      {rule.notification}
                    </td>

                    {/* Status Toggle Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleSlaRule(rule.id)}
                        className={`font-mono text-[9px] font-bold px-2 py-0.5 border transition-all ${
                          rule.status === 'ENABLED'
                            ? 'border-green-600 text-green-700 bg-green-50'
                            : 'border-neutral-300 text-neutral-400 bg-neutral-50'
                        }`}
                      >
                        {rule.status}
                      </button>
                    </td>

                    {/* Actions edit / deactivate / enable */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center space-x-1.5 justify-end font-mono text-[10px]">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="font-bold hover:underline text-neutral-800"
                        >
                          EDIT
                        </button>
                        <span className="text-neutral-300">|</span>
                        <button
                          onClick={() => onToggleSlaRule(rule.id)}
                          className="text-neutral-500 hover:underline uppercase"
                        >
                          {rule.status === 'ENABLED' ? 'Deactivate' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSlaRules.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400 font-mono">
                      NO ACTIVE SLA TARGETS IN MEMORY PORT.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Rule Form panel at the bottom exactly like screenshot */}
        <div className="bg-white border-2 border-black p-5">
          <div className="border-b border-black pb-2 mb-4 flex justify-between items-center">
            <h3 className="text-base font-black font-sans uppercase">
              {editingRuleId ? `MODIFY SLA RULE #${editingRuleId}` : 'ADD/EDIT RULE'}
            </h3>
            {editingRuleId && (
              <button 
                onClick={handleCancel}
                className="text-[10px] font-mono hover:underline text-neutral-500 uppercase block"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
            {/* Rule Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., L2 Overclock bios inquiry reply window"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-neutral-50 border border-black focus:outline-none p-2 font-medium"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Priority Level</label>
                <select
                  value={rulePriority}
                  onChange={(e) => setRulePriority(e.target.value as TicketPriority)}
                  className="w-full bg-neutral-50 border border-black p-2 font-mono"
                >
                  <option value="CRITICAL">🔥 CRITICAL</option>
                  <option value="HIGH">⚡ HIGH</option>
                  <option value="MEDIUM">⚖️ MEDIUM</option>
                  <option value="LOW">💬 LOW</option>
                </select>
              </div>
            </div>

            {/* Department / Condition / TO / Time Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Department */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Department</label>
                <select
                  value={ruleDept}
                  onChange={(e) => setRuleDept(e.target.value)}
                  className="w-full bg-neutral-50 border border-black p-2 font-mono"
                >
                  <option value="L1 Support">L1 Support</option>
                  <option value="L2 Technical">L2 Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              {/* Notification selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Notification Node</label>
                <select
                  value={ruleNotification}
                  onChange={(e) => setRuleNotification(e.target.value)}
                  className="w-full bg-neutral-50 border border-black p-2 font-mono"
                >
                  <option value="[Notify L1 Team]">[Notify L1 Team]</option>
                  <option value="[Notify L2 Team]">[Notify L2 Team]</option>
                  <option value="[Notify Billing]">[Notify Billing]</option>
                  <option value="[Notify Enterprise]">[Notify Enterprise]</option>
                </select>
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Condition</label>
                <input
                  type="text"
                  required
                  value={ruleCondition}
                  onChange={(e) => setRuleCondition(e.target.value)}
                  className="w-full bg-neutral-50 border border-black p-2 font-mono"
                />
              </div>

              {/* Time Limit selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">Resolution Time</label>
                <select
                  value={ruleResolutionTime}
                  onChange={(e) => setRuleResolutionTime(e.target.value)}
                  className="w-full bg-neutral-50 border border-black p-2 font-mono"
                >
                  <option value="4h">4 Hours Standard</option>
                  <option value="24h">24 Hours Standard</option>
                  <option value="48h">48 Hours Standard</option>
                  <option value="72h">3 Days Standard</option>
                </select>
              </div>
            </div>

            {/* SLA text area */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">SLA Condition Description (ReadOnly reference)</label>
              <div className="bg-neutral-100 p-2 border border-neutral-300 font-mono text-[10px] text-neutral-600 uppercase">
                RESOLUTION TIME = "{ruleResolutionTime}" FOR PRIORITY Level "{rulePriority}" IN DEPARTMENT "{ruleDept}". TRIGGER DISPATCH {ruleNotification}.
              </div>
            </div>

            {/* Submission actions */}
            <div className="flex items-center space-x-2 pt-3 justify-end border-t border-neutral-150">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-black border border-neutral-300 hover:bg-neutral-50 font-mono uppercase text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono uppercase text-xs flex items-center space-x-1 border border-black font-bold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>{editingRuleId ? 'SAVE CHANGES' : 'ADD RULE'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
