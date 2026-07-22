import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { fetchChats, fetchChatHistory, getOrCreateChat, sendMessage, setActiveChat } from '../redux/chatSlice';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat, messages, loading, sending, error } = useSelector((state) => state.chat);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (!chats.length) return;
    if (!activeChat) {
      dispatch(setActiveChat(chats[0]));
      dispatch(fetchChatHistory(chats[0]._id));
    }
  }, [activeChat, chats, dispatch]);

  useEffect(() => {
    if (!activeChat?._id) return;
    const timer = setInterval(() => {
      dispatch(fetchChatHistory(activeChat._id));
    }, 5000);

    return () => clearInterval(timer);
  }, [activeChat?._id, dispatch]);

  const handleSelectChat = (chat) => {
    dispatch(setActiveChat(chat));
    dispatch(fetchChatHistory(chat._id));
  };

  const handleStartAiChat = () => {
    dispatch(getOrCreateChat('ai-assistant'));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeChat?._id) return;

    await dispatch(sendMessage({ chatId: activeChat._id, text: draft.trim() }));
    setDraft('');
    dispatch(fetchChatHistory(activeChat._id));
  };

  const displayName = useMemo(() => {
    if (!activeChat?.participants) return 'Select a chat';
    return activeChat.participants
      .filter((participant) => participant._id !== user?.id)
      .map((participant) => participant.name)
      .join(', ') || 'AI Assistant';
  }, [activeChat, user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="mx-auto flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start">
        <aside className="w-full lg:w-[22rem] rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <button
              onClick={handleStartAiChat}
              className="rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
            >
              AI Assistant
            </button>
          </div>

          <div className="space-y-2">
            {chats.map((chat) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1]?.text || 'Start a conversation';
              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${activeChat?._id === chat._id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">
                      {chat.participants
                        ?.filter((participant) => participant._id !== user?.id)
                        .map((participant) => participant.name)
                        .join(', ') || 'AI Assistant'}
                    </p>
                    <span className="text-xs text-slate-500">{chat.messages?.length ? 'Active' : 'New'}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">{lastMessage}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-slate-600">Real-time conversation history is saved in MongoDB.</p>
          </div>

          {error && <p className="mb-4 text-sm text-rose-500">{error}</p>}

          <div className="mb-4 flex min-h-[360px] flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading messages...</p>
            ) : messages.length ? (
              messages.map((message, index) => (
                <div key={`${message.sentAt}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === user?.id ? 'ml-auto bg-brand-600 text-white' : 'bg-white text-slate-700'}`}>
                  <p>{message.text}</p>
                  <p className={`mt-1 text-xs ${message.sender === user?.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Write a message..."
            />
            <button
              type="submit"
              disabled={sending || !activeChat}
              className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Chat;
