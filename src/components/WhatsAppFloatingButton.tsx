import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChatBubbleIcon } from './Icons';

export const WhatsAppFloatingButton: React.FC = () => {
  const { siteConfig, language, isCartDrawerOpen, isCheckoutModalOpen } = useStore();

  if (isCartDrawerOpen || isCheckoutModalOpen) return null;

  const cleanNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(siteConfig.whatsappPrefillText)}`;

  return (
    <aside className="fixed bottom-18 right-4 md:bottom-6 md:right-6 z-40" aria-label="Support chat">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 rounded-full bg-[#f27405] hover:bg-[#d96602] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white cursor-pointer group"
        aria-label={language === 'bn' ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Chat on WhatsApp'}
      >
        <ChatBubbleIcon size={26} className="text-white group-hover:scale-110 transition-transform" />
      </a>
    </aside>
  );
};
