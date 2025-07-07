export interface WrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export type WrapperType = 'sidebar' | 'modal' | 'drawer';