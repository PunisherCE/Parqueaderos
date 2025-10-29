declare module 'expo-barcode-generator' {
  import { ComponentType } from 'react';

  interface BarcodeProps {
    value: string;
    options?: {
      format?: string;
      background?: string;
      lineColor?: string;
      width?: number;
      height?: number;
    };
    rotation?: number;
  }

  export const Barcode: ComponentType<BarcodeProps>;
}