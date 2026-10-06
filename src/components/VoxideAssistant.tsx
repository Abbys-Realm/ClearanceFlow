import React, { useState } from 'react';
import { VoxideClient, VoxideWidget } from '@voxide/react';
import { Bot, Send, X } from 'lucide-react';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('usage_limit')) {
      console.warn('[ClearanceFlow AI] Voxide cloud trial limit reached. Using built-in AASTU guidance.');
      return;
    }
    originalError.apply(console, args);
  };
}

const ai = new VoxideClient({
  publicKey: "vox_pub_ab472f45f0ed2f70bfd6f50f3967df0af1d3fd1505d35ed8",
});

const AASTU_FAQ: Record<string, string> = {
  library: "Library Clearance: Central Library Desk 2. Return overdue books and clear penalties.",
  dorm: "Dormitory: Proctor Office Block 06/12. Room key handover and mattress inspection.",
  cafeteria: "Cafeteria: Meal coupon barcode reconciliation at Student Dining Complex.",
  department: "Academic Department: Submit capstone thesis hardcover and code archive.",
  finance: "Cost-Sharing: Present signed MoE Form-CS/2026 voucher at Finance Window 2.",
  qr: "QR Certificate: Unlocks automatically once all 6 stations are 100% approved by officers.",
};

export function VoxideAssistant() {
  const [showBuiltinChat, setShowBuiltinChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AASTU Clearance Assistant. Ask me about Library dues, Dorm keys, Thesis submission, Cost-sharing, or the Final Registrar QR Pass.' }
  ]);

  const handleSend = () => {
    const q = chatInput.trim().toLowerCase();
    if (!q) return;
    setMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    let reply = "Please check station requirements or visit the designated office during working hours (8:30 AM – 5:00 PM).";
    for (const [k, v] of Object.entries(AASTU_FAQ)) {
      if (q.includes(k)) { reply = v; break; }
    }
    setTimeout(() => setMessages(prev => [...prev, { sender: 'ai', text: reply }]), 300);
  };

  return (
    <>
      <VoxideWidget client={ai} />
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowBuiltinChat(!showBuiltinChat)}
          className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Bot className="w-4 h-4 text-blue-200" />
          <span>Clearance Help FAQ</span>
        </button>
      </div>

      {showBuiltinChat && (
        <div className="fixed bottom-20 left-6 z-50 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <span className="font-bold text-sm">ClearanceFlow Assistant</span>
            <button onClick={() => setShowBuiltinChat(false)}><X className="w-4 h-4 text-white" /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs max-h-64">
            {messages.map((m, i) => (
              <div key={i} className={`p-2.5 rounded-xl ${m.sender === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border-none outline-hidden"
            />
            <button onClick={handleSend} className="px-3 py-2 bg-blue-600 text-white rounded-xl"><Send className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}
    </>
  );
}
