// src/components/DebugStateMonitor.tsx
// This component helps detect and fix state issues
import { useEffect } from 'react';

interface DebugStateMonitorProps {
  products: any[];
  loading: boolean;
  initialLoading: boolean;
  productTransitionState: 'loading' | 'loaded';
  setProductTransitionState: (state: 'loading' | 'loaded') => void;
  setInitialLoading: (loading: boolean) => void;
  showSplashScreen: boolean;
}

export function DebugStateMonitor({
  products,
  loading,
  initialLoading,
  productTransitionState,
  setProductTransitionState,
  setInitialLoading,
  showSplashScreen
}: DebugStateMonitorProps) {
  // Monitor for invalid loading states and fix them
  useEffect(() => {
    // Only monitor when splash screen is gone
    if (showSplashScreen) return;
    
    // If we have products but still in loading state, fix it
    if (products.length > 0 && productTransitionState === 'loading') {
      console.warn('Invalid state detected: Products loaded but still in loading state');
      
      // Schedule a fix
      setTimeout(() => {
        console.log('Fixing product state: forcing transition to loaded');
        setProductTransitionState('loaded');
      }, 100);
    }
    
    // If we have products but still in initialLoading state, fix it
    if (products.length > 0 && initialLoading) {
      console.warn('Invalid state detected: Products loaded but still in initialLoading state');
      
      // Schedule a fix
      setTimeout(() => {
        console.log('Fixing initial loading state: setting to false');
        setInitialLoading(false);
      }, 100);
    }
    
    // If we're not loading but transition state is still loading, fix it
    if (!loading && !initialLoading && productTransitionState === 'loading') {
      console.warn('Invalid state detected: Not loading but transition state is still loading');
      
      // Schedule a fix
      setTimeout(() => {
        console.log('Fixing transition state: setting to loaded');
        setProductTransitionState('loaded');
      }, 100);
    }
  }, [
    products.length, 
    loading, 
    initialLoading, 
    productTransitionState, 
    setProductTransitionState, 
    setInitialLoading,
    showSplashScreen
  ]);
  
  // Return null - this is a utility component
  return null;
}