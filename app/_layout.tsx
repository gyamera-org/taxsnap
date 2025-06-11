import { Slot } from 'expo-router';

import { RootProvider } from '@/context/root-provider';

import '../global.css';

export default function Layout() {
  return (
    <RootProvider>
      <Slot />
    </RootProvider>
  );
}
