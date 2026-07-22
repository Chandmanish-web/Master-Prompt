import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ title, description, children, footer, onClose, size = 'max-w-3xl' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className={`w-full ${size} rounded-[2rem] bg-white p-6 shadow-2xl`}> 
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
