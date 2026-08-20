import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const GOAL_ICONS: IoniconsName[] = [
  'flag-outline',
  'home-outline',
  'car-outline',
  'airplane-outline',
  'school-outline',
  'gift-outline',
  'medkit-outline',
  'phone-portrait-outline',
  'laptop-outline',
  'umbrella-outline',
];
