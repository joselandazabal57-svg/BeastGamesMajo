/**
 * Modal — base overlay modal.
 *
 * Used by: prize-reveal, game-over, confirm-reset, etc.
 *
 * Renders a dark backdrop + centered panel. Children go inside the panel.
 * Close on backdrop click can be disabled (closeOnBackdrop=false).
 */

'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Prevent closing by tapping the backdrop (e.g. forced result screens). */
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  closeOnBackdrop = true,
  children,
}: ModalProps) {
  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={[
              'fixed z-50 inset-x-4 mx-auto max-w-sm',
              'top-1/2 -translate-y-1/2',
              'rounded-2xl p-6 flex flex-col gap-4',
              'border border-white/10',
            ].join(' ')}
            style={{ background: 'var(--color-panel)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h2
                id="modal-title"
                className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-center"
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
