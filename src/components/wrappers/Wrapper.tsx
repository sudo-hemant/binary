'use client';

import { WrapperProps, WrapperType } from './WrapperTypes';
import { SidebarWrapper } from './SidebarWrapper';

interface WrapperComponentProps extends WrapperProps {
  type?: WrapperType;
}

export function Wrapper({ 
  type = 'sidebar', 
  ...props 
}: WrapperComponentProps) {
  switch (type) {
    case 'sidebar':
      return <SidebarWrapper {...props} />;
    
    // Future implementations
    // case 'modal':
    //   return <ModalWrapper {...props} />;
    // case 'drawer':
    //   return <DrawerWrapper {...props} />;
    
    default:
      return <SidebarWrapper {...props} />;
  }
}