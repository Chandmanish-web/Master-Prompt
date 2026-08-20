import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { getChatbotHistory, sendChatbotMessage } from '../redux/chatbotSlice';
import LoadingSpinner from './ui/LoadingSpinner';

const ChatbotWidget = () => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chatbot);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open && messages.length === 0) dispatch(getChatbotHistory());
  }, [dispatch, open, messages.length]);

  const submit = async (event) => {
    event.preventDefault();
    const value = message.trim();
    if (!value || loading) return;
    setMessage('');
    await dispatch(sendChatbotMessage(value));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-cyan-300" /><span className="font-semibold">WorkTrack Assistant</span></div>
            <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && !loading && <p className="text-sm text-slate-500">Ask about leave, attendance, or workplace processes.</p>}
            {messages.map((item) => (
              <div key={item._id || `${item.createdAt}-${item.role}`} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${item.role === 'user' ? 'ml-auto bg-cyan-600 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                {item.text}
              </div>
            ))}
            {loading && <LoadingSpinner label="Thinking..." />}
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Ask a work question..." className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500" />
            <button type="submit" aria-label="Send message" disabled={loading || !message.trim()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
      <button type="button" aria-label={open ? 'Close assistant' : 'Open assistant'} onClick={() => setOpen((value) => !value)} className="ml-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition hover:bg-cyan-700">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
