import React from 'react';
import { Phone, Star, User } from 'lucide-react';

const CONTACTS = [
    { name: "John Doe", active: true },
    { name: "Sarah Smith", active: false },
    { name: "Mom", active: false, favorite: true },
];

const ContactsPanel = () => {
    return (
        <div className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-white/80 uppercase tracking-widest text-xs font-bold">Quick Dial</h3>
                <Phone size={16} className="text-white/50" />
            </div>

            <div className="flex flex-col gap-3">
                {CONTACTS.map((contact, idx) => (
                    <div key={idx} className="glass-panel-light p-3 flex items-center justify-between btn-automotive hover:bg-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <div>
                                <div className="font-medium text-white">{contact.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{contact.active ? 'Available' : 'Mobile'}</div>
                            </div>
                        </div>
                        {contact.favorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactsPanel;
