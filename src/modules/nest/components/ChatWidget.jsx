const ChatWidget = () => {
    // Placeholder for real-time chat
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">forum</span>
                    Nest Chat
                </h3>
                <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full border border-white bg-slate-300" />
                    <div className="w-6 h-6 rounded-full border border-white bg-slate-400" />
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Message Received */}
                <div className="flex gap-2 items-end">
                    <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0" />
                    <div className="bg-slate-100 p-2.5 rounded-2xl rounded-bl-none text-xs text-slate-700 max-w-[85%]">
                        Welcome to the nest chat! We will integrate real-time messaging here soon.
                    </div>
                </div>

                {/* Message Sent */}
                <div className="flex gap-2 items-end flex-row-reverse">
                    <div className="bg-primary/10 p-2.5 rounded-2xl rounded-br-none text-xs text-slate-800 max-w-[85%]">
                        Sounds great! 🦅
                    </div>
                </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-100">
                <div className="relative">
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-xs focus:ring-primary focus:border-primary"
                        placeholder="Type a message..."
                        type="text"
                    />
                    <button className="absolute right-1 top-1 p-1 text-primary hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
