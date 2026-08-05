'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const triggerId = `faq-trigger-${index}`;

        return (
          <div key={item.question} className={`ap-faq-item ${isOpen ? 'is-open' : ''}`}>
            <h3>
              <button
                type="button"
                id={triggerId}
                className="ap-faq-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span className="ap-faq-sign" aria-hidden="true">
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                </span>
              </button>
            </h3>

            <div className="ap-faq-panel" id={panelId} role="region" aria-labelledby={triggerId}>
              <div>
                <p className="ap-faq-answer">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
