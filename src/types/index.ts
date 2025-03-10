// src/types/index.ts

/**
 * Product type definition
 * Represents a single wine or spirit product
 */
export type Product = {
    product_id: string;
    name: string;
    category: string | null;
    country: string | null;
    price: number | null;
    district: string | null;
    sub_district: string | null;
    producer: string | null;
    varetype: string | null;
    lukt: string | null;
    smak: string | null;
    farge: string | null;
    metode: string | null;
    inneholder: string | null;
    emballasjetype: string | null;
    korktype: string | null;
    utvalg: string | null;
    grossist: string | null;
    transportor: string | null;
    imageSmall: string;
    imageMain: string;
  };
  
  /**
   * Product pagination information
   * Contains details about pagination state
   */
  export type PaginationInfo = {
    total: number;          // Total number of products matching the query
    page: number;           // Current page number
    limit: number;          // Number of items per page
    pages: number;          // Total number of pages
    hasMore: boolean;       // Whether there are more pages to load
  };
  
  /**
   * Filter options for products
   * Contains all possible filtering criteria
   */
  export type ProductFilters = {
    search: string;                // Search term
    countries: string[];           // Selected countries
    categories: string[];          // Selected categories
    priceRange: [number, number];  // Min and max price
  };
  
  /**
   * Sort options for products
   * Defines how products should be sorted
   */
  export type ProductSort = {
    field: 'name' | 'price' | 'country' | 'category';  // Field to sort by
    order: 'asc' | 'desc';                             // Sort direction
  };
  
  /**
   * Loading state type
   * Represents the loading state of products
   */
  export type LoadingState = 'loading' | 'loaded';
  
  /**
   * Visibility window for virtual rendering
   * Defines which items should be rendered in a virtualized list
   */
  export type VisibleWindow = {
    start: number;  // Start index of visible window
    end: number;    // End index of visible window
  };
  
  /**
   * Virtual item representation for virtualization
   * Contains metadata about a virtualized item
   */
  export type VirtualItem = {
    index: number;   // Original index in the items array
    start: number;   // Start position in pixels
    end: number;     // End position in pixels
    size: number;    // Size in pixels
    visible: boolean; // Whether the item is currently visible
  };
  
  /**
   * Options for virtualization hook
   * Configuration for virtualized rendering
   */
  export type VirtualizationOptions<T> = {
    items: T[];            // Array of items to virtualize
    itemHeight?: number;   // Height of each item in pixels
    overscan?: number;     // Number of items to render outside visible area
  };
  
  /**
   * API response for product data
   * Shape of the response from the products API
   */
  export type ProductResponse = {
    products: Product[];
    pagination: PaginationInfo;
  };
  
  /**
   * Error response type
   * Shape of API error responses
   */
  export type ErrorResponse = {
    error: string;
    message?: string;
  };
  
  /**
   * Preload data options
   * Configuration for data preloading
   */
  export type PreloadOptions = {
    splashScreenDuration?: number;
    onProductsLoaded?: (products: Product[]) => void;
  };
  
/**
 * Debug state monitor props
 * Props for the debug state monitoring component
 */
export type DebugStateMonitorProps = {
    products: Product[];
    // Remove the loading prop which isn't being passed
    // loading: boolean;  
    initialLoading: boolean;
    loadingState: LoadingState;
    setLoadingState: (state: LoadingState) => void;
    setInitialLoading: (loading: boolean) => void;
    showSplashScreen: boolean;
  };