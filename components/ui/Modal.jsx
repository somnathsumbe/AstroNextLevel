'use client';

import { useEffect, useRef } from 'react';

export default function Modal({ open, title, onClose, children, actions, labelledBy = 'ui-modal-title' }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <div className="ui-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="ui-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}><header className="ui-modal-header"><h2 id={labelledBy}>{title}</h2><button ref={closeRef} type="button" className="ui-modal-close" onClick={onClose} aria-label="Close dialog"><i className="bi bi-x-lg" /></button></header><div className="ui-modal-body">{children}</div>{actions && <footer className="ui-modal-footer">{actions}</footer>}</section></div>;
}