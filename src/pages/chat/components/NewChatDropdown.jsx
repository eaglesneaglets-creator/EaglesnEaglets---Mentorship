import { useState, useRef, useEffect, useMemo } from 'react';
import { useContacts } from '../../../modules/chat/hooks/useChat';
import { Avatar } from './_shared';

export default function NewChatDropdown({ onSelect, onClose }) {
    const { data: contacts = [], isLoading } = useContacts();
    const [filter, setFilter] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const filtered = useMemo(() => {
        if (!filter.trim()) return contacts;
        const q = filter.toLowerCase();
        return contacts.filter((c) =>
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
        );
    }, [contacts, filter]);

    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach((c) => {
            const label = c.role === 'eagle' ? 'Mentors' : c.role === 'admin' ? 'Admins' : 'Eaglets';
            if (!groups[label]) groups[label] = [];
            groups[label].push(c);
        });
        return groups;
    }, [filtered]);

    return (
        <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-slate-100">
                <input
                    type="text"
                    autoFocus
                    placeholder="Search contacts..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
            <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="py-6 text-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([label, users]) => (
                        <div key={label}>
                            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => onSelect(u.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{u.first_name} {u.last_name}</p>
                                        <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="py-6 text-center">
                        <span className="material-symbols-outlined text-2xl text-slate-300">person_off</span>
                        <p className="text-xs text-slate-400 mt-1">No contacts found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
