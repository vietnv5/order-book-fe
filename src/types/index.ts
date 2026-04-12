import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export * from './order';
export * from './customer';
export * from './product';
export * from './shipper';
export * from './shop';
