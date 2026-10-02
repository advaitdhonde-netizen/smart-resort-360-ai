import React, { useState } from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { InventoryItem } from '../../../types';
import {
  Package,
  Plus,
  Minus,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Send,
  Search,
  History,
  ShoppingCart,
  X,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const {
    inventoryItems,
    addInventoryStock,
    removeInventoryStock,
    adjustInventoryQuantity,
    reorderInventoryItem,
  } = useResortOS();
  const { isLight } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedItemHistory, setSelectedItemHistory] = useState<InventoryItem | null>(null);

  // Quick Action Modal (+ / - / Adjust)
  const [actionModal, setActionModal] = useState<{
    item: InventoryItem;
    type: 'ADD' | 'REMOVE' | 'ADJUST' | 'REORDER';
  } | null>(null);
  const [actionAmount, setActionAmount] = useState<number>(10);
  const [actionNotes, setActionNotes] = useState('');

  // AI Inventory Assistant
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockCount = inventoryItems.filter(
    (i) => i.currentStock <= i.reorderLevel || i.status === 'Low Stock'
  ).length;

  const handleActionConfirm = () => {
    if (!actionModal) return;
    const { item, type } = actionModal;

    if (type === 'ADD') {
      addInventoryStock(item.id, actionAmount, actionNotes || 'Restock shipment received');
    } else if (type === 'REMOVE') {
      removeInventoryStock(item.id, actionAmount, actionNotes || 'Departmental requisition');
    } else if (type === 'ADJUST') {
      adjustInventoryQuantity(item.id, actionAmount, actionNotes || 'Audit count adjustment');
    } else if (type === 'REORDER') {
      reorderInventoryItem(item.id);
    }

    setActionModal(null);
    setActionAmount(10);
    setActionNotes('');
  };

  const handleRunInventoryAi = (promptText?: string) => {
    const q = (promptText || aiQuery).trim().toLowerCase();
    if (!q) return;

    setAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      if (q.includes('need restocking') || q.includes('reorder') || q.includes('low')) {
        const belowReorder = inventoryItems.filter((i) => i.currentStock <= i.reorderLevel);
        if (belowReorder.length > 0) {
          const listStr = belowReorder
            .map(
              (i) =>
                `• ${i.name}: ${i.currentStock} ${i.unit} remaining (Reorder threshold: ${i.reorderLevel} ${i.unit}, Recommended PO: ${i.reorderQuantity} ${i.unit} from ${i.supplier})`
            )
            .join('\n');
          setAiResponse(
            `${belowReorder.length} item(s) are currently at or below their reorder level:\n\n${listStr}\n\nClick the "Reorder" button next to any item to generate a purchase confirmation.`
          );
        } else {
          setAiResponse('All inventory categories are currently healthy and above their reorder thresholds.');
        }
      } else if (q.includes('coffee')) {
        const coffeeItem = inventoryItems.find((i) => i.name.toLowerCase().includes('coffee'));
        if (coffeeItem) {
          setAiResponse(
            `We currently have ${coffeeItem.currentStock} ${coffeeItem.unit} of ${coffeeItem.name} in stock. The minimum buffer is ${coffeeItem.minThreshold} ${coffeeItem.unit} and reorder level is ${coffeeItem.reorderLevel} ${coffeeItem.unit}. Stock status: ${coffeeItem.status}. Unit cost: ₹${coffeeItem.unitCost}/kg.`
          );
        } else {
          setAiResponse('Coffee is tracked under Beverages & Coffee.');
        }
      } else if (q.includes('water') || q.includes('mineral')) {
        const waterItem = inventoryItems.find((i) => i.name.toLowerCase().includes('water'));
        if (waterItem) {
          setAiResponse(
            `Packaged Mineral Water (1L): ${waterItem.currentStock} bottles remaining (Status: ${waterItem.status}). Minimum required is ${waterItem.minThreshold} bottles. Suggested reorder: ${waterItem.reorderQuantity} bottles from ${waterItem.supplier}.`
          );
        }
      } else if (q.includes('out of stock')) {
        const outItems = inventoryItems.filter((i) => i.currentStock === 0);
        if (outItems.length > 0) {
          setAiResponse(`Items currently at zero stock:\n${outItems.map((i) => `• ${i.name}`).join('\n')}`);
        } else {
          setAiResponse('Zero items are completely out of stock today! 2 items are flagged as Low Stock.');
        }
      } else {
        setAiResponse(
          `Inventory Audit Summary:\n• Total tracked SKUs: ${inventoryItems.length}\n• Healthy items in stock: ${inventoryItems.length - lowStockCount}\n• Items needing replenishment: ${lowStockCount} (Mineral Water & Filter Coffee)\n• Total inventory valuation: ₹${inventoryItems
            .reduce((sum, i) => sum + i.currentStock * i.unitCost, 0)
            .toLocaleString('en-IN')}`
        );
      }
      setAiLoading(false);
    }, 350);
  };

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      {/* 1. Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial tracking-wide">
            07. Inventory & Supply Chain Management
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            STOCK TRACKING · CONSUMPTION REQUISITIONS · AUTOMATED REORDER RECOMMENDATIONS
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-3 py-1 border rounded ${isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/5 border-white/10'}`}>
            Tracked Items: <strong>{inventoryItems.length}</strong>
          </span>
          {lowStockCount > 0 && (
            <span className="px-3 py-1 border rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockCount} Reorder Recommended</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. AI Inventory Assistant Card */}
      <div
        className={`p-5 border space-y-3.5 ${
          isLight ? 'bg-[#EEECE4] border-[#8F6834] shadow-sm' : 'bg-white/[0.03] border-[#c8aa6e]/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <Bot className={`w-4 h-4 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
            AI Inventory Assistant · Instant Stock Intelligence
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            "Which items need restocking?",
            "How much coffee do we have?",
            "Which items are out of stock?",
            "Which items should be reordered?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiQuery(prompt);
                handleRunInventoryAi(prompt);
              }}
              className={`text-[11px] px-2.5 py-1 border rounded transition-colors cursor-pointer ${
                isLight
                  ? 'bg-[#F0EEE7] border-[#D0CCC0] hover:border-[#8F6834]'
                  : 'bg-white/[0.04] border-white/10 hover:border-[#c8aa6e]/60 text-neutral-300'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunInventoryAi();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask about inventory, consumption, water bottles, coffee, or reorder levels..."
            className={`flex-1 p-2 text-xs font-mono border focus:outline-none ${
              isLight
                ? 'bg-[#F0EEE7] border-[#D0CCC0] focus:border-[#8F6834]'
                : 'bg-white/[0.04] border-white/10 focus:border-[#c8aa6e] text-white'
            }`}
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className={`px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'bg-[#18251F] text-white hover:bg-[#26332D] disabled:opacity-50'
                : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] disabled:opacity-50'
            }`}
          >
            {aiLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </button>
        </form>

        {aiResponse && (
          <div
            className={`p-3.5 border rounded text-xs font-mono whitespace-pre-line leading-relaxed animate-fadeIn ${
              isLight ? 'bg-[#E5E2D6] border-[#8F6834]' : 'bg-white/[0.05] border-[#c8aa6e]'
            }`}
          >
            {aiResponse}
          </div>
        )}
      </div>

      {/* 3. Search and Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Linens & Bedding', 'Beverages & Coffee', 'Kitchen & Dining Staples', 'Guest Toiletries', 'Housekeeping Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 border transition-colors cursor-pointer ${
                filterCategory === cat
                  ? isLight
                    ? 'bg-[#18251F] text-white border-[#18251F] font-bold'
                    : 'bg-white/15 text-white border-white/20 font-bold'
                  : isLight
                  ? 'border-[#D0CCC0] bg-[#F0EEE7] text-[#4D5C4D]'
                  : 'border-white/10 text-neutral-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item, SKU, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 pr-3 py-1 text-xs font-mono border ${
              isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10 text-white'
            }`}
          />
        </div>
      </div>

      {/* 4. Inventory Items Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.reorderLevel;
          return (
            <div
              key={item.id}
              className={`p-4 border rounded flex flex-col justify-between space-y-3 transition-all ${
                isLow
                  ? isLight
                    ? 'bg-[#E7E4DC] border-amber-500 shadow-sm'
                    : 'bg-amber-500/[0.05] border-amber-500/40'
                  : isLight
                  ? 'bg-[#EEECE4] border-[#D0CCC0]'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-inherit">
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{item.name}</div>
                    <div className="text-[10px] font-mono text-neutral-500">SKU: {item.sku} · {item.category}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded border ${
                      item.currentStock === 0
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                        : isLow
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.currentStock === 0 ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>

                {/* Stock Level Details */}
                <div className="py-2.5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500">Current Stock:</span>
                    <span className="text-lg font-bold font-mono">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span>Min Buffer: {item.minThreshold} {item.unit}</span>
                    <span>Reorder Level: {item.reorderLevel} {item.unit}</span>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.currentStock / (item.reorderLevel * 2)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-neutral-500">Unit Cost:</span>
                    <span className="font-semibold">₹{item.unitCost} / {item.unit}</span>
                  </div>

                  <div className="text-[10px] text-neutral-500 truncate">
                    Supplier: {item.supplier}
                  </div>
                </div>

                {isLow && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-700 dark:text-amber-300 font-semibold flex items-center justify-between">
                    <span>REORDER RECOMMENDED</span>
                    <span>+{item.reorderQuantity} {item.unit}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Add, Remove, Adjust, Reorder */}
              <div className="pt-2 border-t border-inherit space-y-2">
                <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setActionModal({ item, type: 'ADD' });
                      setActionAmount(10);
                    }}
                    className={`py-1.5 border rounded cursor-pointer transition-colors text-center ${
                      isLight ? 'bg-[#F0EEE7] hover:bg-[#DCD9CC] border-[#D0CCC0]' : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title="Add Stock (+)"
                  >
                    + Add
                  </button>

                  <button
                    onClick={() => {
                      setActionModal({ item, type: 'REMOVE' });
                      setActionAmount(5);
                    }}
                    className={`py-1.5 border rounded cursor-pointer transition-colors text-center ${
                      isLight ? 'bg-[#F0EEE7] hover:bg-[#DCD9CC] border-[#D0CCC0]' : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title="Remove Stock (-)"
                  >
                    - Take
                  </button>

                  <button
                    onClick={() => {
                      setActionModal({ item, type: 'ADJUST' });
                      setActionAmount(item.currentStock);
                    }}
                    className={`py-1.5 border rounded cursor-pointer transition-colors text-center ${
                      isLight ? 'bg-[#F0EEE7] hover:bg-[#DCD9CC] border-[#D0CCC0]' : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title="Adjust Quantity"
                  >
                    Adjust
                  </button>

                  <button
                    onClick={() => {
                      setActionModal({ item, type: 'REORDER' });
                      setActionAmount(item.reorderQuantity);
                    }}
                    className={`py-1.5 border rounded cursor-pointer font-bold transition-colors text-center ${
                      isLow
                        ? isLight
                          ? 'bg-[#18251F] text-white hover:bg-[#26332D]'
                          : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                        : isLight
                        ? 'border-[#D0CCC0] hover:bg-[#DCD9CC]'
                        : 'border-white/10 text-neutral-300'
                    }`}
                  >
                    Reorder
                  </button>
                </div>

                {item.transactions && item.transactions.length > 0 && (
                  <button
                    onClick={() => setSelectedItemHistory(item)}
                    className="w-full text-[10px] font-mono text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    <span>View Transaction History ({item.transactions.length})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal (+ Add, - Take, Adjust, Reorder Confirmation) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 border space-y-4 ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <h3 className="text-base font-editorial font-bold">
                {actionModal.type === 'ADD' && `Add Stock: ${actionModal.item.name}`}
                {actionModal.type === 'REMOVE' && `Remove Stock: ${actionModal.item.name}`}
                {actionModal.type === 'ADJUST' && `Adjust Stock Count: ${actionModal.item.name}`}
                {actionModal.type === 'REORDER' && `Confirm Reorder PO: ${actionModal.item.name}`}
              </h3>
              <button onClick={() => setActionModal(null)} className="cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-inherit rounded flex justify-between">
                <span>Current Quantity:</span>
                <span className="font-bold">{actionModal.item.currentStock} {actionModal.item.unit}</span>
              </div>

              {actionModal.type === 'REORDER' ? (
                <div className="space-y-2">
                  <p className="leading-relaxed">
                    Confirm placing a replenishment purchase order for <strong>{actionModal.item.reorderQuantity} {actionModal.item.unit}</strong> from <strong>{actionModal.item.supplier}</strong>.
                  </p>
                  <div className="flex justify-between font-bold">
                    <span>Estimated PO Cost:</span>
                    <span>₹{(actionModal.item.reorderQuantity * actionModal.item.unitCost).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 font-semibold">
                      {actionModal.type === 'ADJUST' ? 'New Total Quantity' : 'Quantity'} ({actionModal.item.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(parseInt(e.target.value) || 0)}
                      className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold">Reason / Department Note</label>
                    <input
                      type="text"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="e.g. Received shipment, Kitchen requisition, Monthly physical audit"
                      className={`w-full p-2 border ${isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.04] border-white/10'}`}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleActionConfirm}
                  className={`flex-1 py-2 font-bold uppercase tracking-wider cursor-pointer border ${
                    isLight ? 'bg-[#18251F] text-white hover:bg-[#26332D]' : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f]'
                  }`}
                >
                  {actionModal.type === 'REORDER' ? 'Confirm Purchase Order' : 'Apply Stock Change'}
                </button>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className={`px-4 py-2 uppercase border cursor-pointer ${isLight ? 'border-[#D0CCC0]' : 'border-white/10'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {selectedItemHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg p-6 border space-y-4 max-h-[80vh] overflow-y-auto ${
              isLight ? 'bg-[#EEECE4] border-[#8F6834] text-[#18251F]' : 'bg-[#090b10] border-white/20 text-white'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <div>
                <h3 className="text-base font-editorial font-bold">Transaction History</h3>
                <div className="text-xs font-mono text-neutral-500">{selectedItemHistory.name}</div>
              </div>
              <button onClick={() => setSelectedItemHistory(null)} className="cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {selectedItemHistory.transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 border rounded flex justify-between items-center ${
                    isLight ? 'bg-[#F0EEE7] border-[#D0CCC0]' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div>
                    <div className="font-bold">
                      {tx.action === 'ADD_STOCK' && `+${tx.amount} Added`}
                      {tx.action === 'REMOVE_STOCK' && `-${tx.amount} Removed`}
                      {tx.action === 'ADJUST_QUANTITY' && `Adjusted to ${tx.amount}`}
                      {tx.action === 'REORDER' && `+${tx.amount} Reordered`}
                    </div>
                    <div className="text-[11px] text-neutral-500">{tx.notes}</div>
                  </div>
                  <div className="text-right text-[10px] text-neutral-500">
                    <div>{tx.timestamp}</div>
                    <div>By: {tx.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
