import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheckIcon } from './Icons';

// Change the store name here and it updates everywhere on this page.
const STORE_EN = 'Baby Dolna Store';
const STORE_BN = 'বেবি দোলনা স্টোর';

interface TermsTable {
  headers: [string, string];
  rows: [string, string][];
}

interface TermsSection {
  title: string;
  paragraph?: string;
  table?: TermsTable;
  bullets?: string[];
  note?: string;
}

interface TermsContent {
  pageTitle: string;
  subtitle: string;
  intro: string;
  sections: TermsSection[];
}

const CONTENT: Record<'en' | 'bn', TermsContent> = {
  en: {
    pageTitle: 'Terms & Conditions',
    subtitle: 'Simple, clear terms for every order',
    intro: `Please read these terms carefully before purchasing products from ${STORE_EN}. By ordering you agree to these terms.`,
    sections: [
      {
        title: 'Introduction',
        paragraph: `When you order products through our website, Facebook page, WhatsApp or phone, you and ${STORE_EN} enter into a purchase agreement. On this page the terms of the agreement are written in simple language.`,
      },
      {
        title: 'Definitions',
        table: {
          headers: ['Term', 'Meaning'],
          rows: [
            [`"We", "${STORE_EN}"`, `${STORE_EN} and its representatives`],
            ['"You", "Customer"', 'Anyone who is viewing, ordering or receiving the product'],
            ['"Products"', 'Any baby product we sell'],
            ['"Order"', 'The request you send to buy a product'],
          ],
        },
      },
      {
        title: 'When is the order confirmed',
        table: {
          headers: ['Step', 'Status'],
          rows: [
            ['You place an order on the website', 'This is a purchase request, not yet confirmed'],
            ['We confirm by calling your phone', 'Order confirmed'],
            ['The product is packed and sent', 'Order out for delivery'],
          ],
        },
        note: 'We reserve the right to cancel an order, by notifying you, if the stock is out or there is a clear mistake in the price. If an advance payment has been made, it will be fully refunded.',
      },
      {
        title: 'Price and payment',
        bullets: [
          'All prices shown on the website are in Bangladeshi taka (৳).',
          'Delivery charges are added separately according to the area and are shown before ordering.',
          'The price is not increased after the order is confirmed.',
          'Payment can be made by cash on delivery or bKash.',
        ],
      },
      {
        title: 'Delivery',
        table: {
          headers: ['Area', 'Approximate time'],
          rows: [
            ['Inside Dhaka City', '1–2 working days'],
            ['Outside Dhaka City', '2–3 working days'],
            ['Outside Dhaka district', '3–5 working days'],
          ],
        },
        bullets: [
          'The times above are approximate. We will inform you if there is a delay due to a natural calamity or the courier.',
          'It is your right to open the packet in front of the delivery person and verify the product while receiving it.',
        ],
      },
      {
        title: 'Product details and pictures',
        bullets: [
          'We try to keep the product descriptions as accurate as possible.',
          'The color in a picture may look slightly different from the real product because of lighting and your screen.',
        ],
      },
      {
        title: 'Customer responsibility',
        bullets: [
          'Give your correct name, mobile number and address.',
          'Do not place fake orders. They waste courier cost and time.',
          "Follow the manufacturer's instructions while using the product for your child.",
        ],
      },
      {
        title: 'Policy changes',
        paragraph:
          'We may change these Terms if necessary. However, for orders that are already confirmed, the terms in force at the time of the order will apply.',
      },
    ],
  },
  bn: {
    pageTitle: 'শর্তাবলী',
    subtitle: 'প্রতিটি অর্ডারের জন্য সহজ ও স্পষ্ট শর্ত',
    intro: `অনুগ্রহ করে ${STORE_BN} থেকে পণ্য কেনার আগে এই শর্তাবলী মনোযোগ দিয়ে পড়ুন। অর্ডার করার মাধ্যমে আপনি এই শর্তগুলোতে সম্মতি দিচ্ছেন।`,
    sections: [
      {
        title: 'ভূমিকা',
        paragraph: `আপনি যখন আমাদের ওয়েবসাইট, ফেসবুক পেজ, হোয়াটসঅ্যাপ বা ফোনের মাধ্যমে পণ্য অর্ডার করেন, তখন আপনার ও ${STORE_BN}-এর মধ্যে একটি ক্রয়চুক্তি তৈরি হয়। এই পেজে চুক্তির শর্তগুলো সহজ ভাষায় লেখা হয়েছে।`,
      },
      {
        title: 'সংজ্ঞা',
        table: {
          headers: ['শব্দ', 'অর্থ'],
          rows: [
            [`“আমরা”, “${STORE_BN}”`, `${STORE_BN} ও এর প্রতিনিধিগণ`],
            ['“আপনি”, “ক্রেতা”', 'যিনি পণ্যটি দেখছেন, অর্ডার করছেন বা গ্রহণ করছেন'],
            ['“পণ্য”', 'আমাদের বিক্রি করা যেকোনো বেবি প্রোডাক্ট'],
            ['“অর্ডার”', 'পণ্য কেনার জন্য আপনার পাঠানো অনুরোধ'],
          ],
        },
      },
      {
        title: 'অর্ডার কখন কনফার্ম হয়',
        table: {
          headers: ['ধাপ', 'অবস্থা'],
          rows: [
            ['আপনি ওয়েবসাইটে অর্ডার করলেন', 'এটি কেনার অনুরোধ, এখনো কনফার্ম হয়নি'],
            ['আমরা ফোনে কল করে নিশ্চিত করলাম', 'অর্ডার কনফার্ম'],
            ['পণ্য প্যাকেট করে পাঠানো হলো', 'অর্ডার ডেলিভারির পথে'],
          ],
        },
        note: 'স্টক শেষ হয়ে গেলে বা দামে স্পষ্ট ভুল থাকলে আপনাকে জানিয়ে অর্ডার বাতিল করার অধিকার আমরা সংরক্ষণ করি। অগ্রিম টাকা পরিশোধ করা থাকলে তা সম্পূর্ণ ফেরত দেওয়া হবে।',
      },
      {
        title: 'মূল্য ও পেমেন্ট',
        bullets: [
          'ওয়েবসাইটে দেখানো সব দাম বাংলাদেশি টাকায় (৳)।',
          'ডেলিভারি চার্জ এলাকা অনুযায়ী আলাদাভাবে যুক্ত হয় এবং অর্ডারের আগেই দেখানো হয়।',
          'অর্ডার কনফার্ম হওয়ার পর দাম বাড়ানো হয় না।',
          'ক্যাশ অন ডেলিভারি অথবা বিকাশের মাধ্যমে পেমেন্ট করা যাবে।',
        ],
      },
      {
        title: 'ডেলিভারি',
        table: {
          headers: ['এলাকা', 'আনুমানিক সময়'],
          rows: [
            ['ঢাকা সিটির ভেতরে', '১–২ কার্যদিবস'],
            ['ঢাকা সিটির বাইরে', '২–৩ কার্যদিবস'],
            ['ঢাকা জেলার বাইরে', '৩–৫ কার্যদিবস'],
          ],
        },
        bullets: [
          'উল্লেখিত সময় আনুমানিক। প্রাকৃতিক দুর্যোগ বা কুরিয়ারের কারণে দেরি হলে আমরা আপনাকে জানাব।',
          'পণ্য গ্রহণের সময় ডেলিভারি ম্যানের সামনে প্যাকেট খুলে পণ্য যাচাই করে নেওয়া আপনার অধিকার।',
        ],
      },
      {
        title: 'পণ্যের বিবরণ ও ছবি',
        bullets: [
          'পণ্যের বিবরণ যথাসম্ভব সঠিক রাখার চেষ্টা করি।',
          'আলো ও স্ক্রিনের কারণে ছবির রং বাস্তবের চেয়ে সামান্য আলাদা দেখাতে পারে।',
        ],
      },
      {
        title: 'ক্রেতার দায়িত্ব',
        bullets: [
          'সঠিক নাম, মোবাইল নম্বর ও ঠিকানা দিন।',
          'ভুয়া অর্ডার করবেন না, এতে কুরিয়ার খরচ ও সময় নষ্ট হয়।',
          'শিশুর জন্য পণ্য ব্যবহারের সময় প্রস্তুতকারকের নির্দেশনা মেনে চলুন।',
        ],
      },
      {
        title: 'শর্তাবলী পরিবর্তন',
        paragraph:
          'প্রয়োজনে আমরা এই শর্তাবলী পরিবর্তন করতে পারি। তবে ইতোমধ্যে কনফার্ম হওয়া অর্ডারের ক্ষেত্রে অর্ডারের সময় প্রচলিত শর্তই প্রযোজ্য হবে।',
      },
    ],
  },
};

const toBnDigits = (n: number): string =>
  String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export const TermsPage: React.FC = () => {
  const { language, navigateToStore } = useStore();
  const t = CONTENT[language];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-amber-800 transition-colors font-medium cursor-pointer"
        >
          {language === 'bn' ? 'হোম' : 'Home'}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-bold">{t.pageTitle}</span>
      </nav>

      <header className="mb-6 border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-3">
          <ShieldCheckIcon size={28} className="text-amber-800" />
          <span>{t.pageTitle}</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">{t.subtitle}</p>
      </header>

      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-950 leading-relaxed">
        {t.intro}
      </div>

      <div className="space-y-8">
        {t.sections.map((section, idx) => (
          <section key={section.title} aria-labelledby={`terms-sec-${idx}`}>
            <h2
              id={`terms-sec-${idx}`}
              className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2.5"
            >
              <span className="w-7 h-7 shrink-0 rounded-lg bg-amber-700 text-white text-xs font-black flex items-center justify-center tabular-nums">
                {language === 'bn' ? toBnDigits(idx + 1) : idx + 1}
              </span>
              <span>{section.title}</span>
            </h2>

            {section.paragraph && (
              <p className="text-sm text-stone-700 leading-relaxed">{section.paragraph}</p>
            )}

            {section.table && (
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-100 text-stone-700">
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h} className="px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {section.table.rows.map(([a, b]) => (
                      <tr key={a}>
                        <td className="px-4 py-2.5 font-semibold text-stone-900 align-top">{a}</td>
                        <td className="px-4 py-2.5 text-stone-700 align-top">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.note && (
              <p className="mt-3 text-sm text-stone-700 leading-relaxed">{section.note}</p>
            )}

            {section.bullets && (
              <ul className={`space-y-2 text-sm text-stone-700 leading-relaxed ${section.table ? 'mt-3' : ''}`}>
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-stone-200">
        <button
          type="button"
          onClick={navigateToStore}
          className="px-4 py-2 rounded-xl bg-[#f27405] hover:bg-[#d96602] text-white text-sm font-bold transition-colors cursor-pointer"
        >
          {language === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Store'}
        </button>
      </div>
    </div>
  );
};
