#!/usr/bin/env python3
"""
Vinmonopolet Explorer Troubleshooter
===================================
This script helps diagnose and fix issues with the Vinmonopolet Explorer web app.
"""

import os
import sys
import re
import json
from pathlib import Path
import urllib.parse

# ANSI color codes for prettier output
RESET = "\033[0m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"

def print_header(text):
    """Print a section header"""
    print(f"\n{BLUE}{'=' * 80}{RESET}")
    print(f"{BLUE}== {text.ljust(76)} =={RESET}")
    print(f"{BLUE}{'=' * 80}{RESET}\n")

def print_status(status, message):
    """Print status message"""
    if status == "ok":
        print(f"{GREEN}✓ {message}{RESET}")
    elif status == "warning":
        print(f"{YELLOW}⚠ {message}{RESET}")
    elif status == "error":
        print(f"{RED}✗ {message}{RESET}")
    elif status == "info":
        print(f"{CYAN}ℹ {message}{RESET}")

def fix_env_issues():
    """Create or update .env file with correct variables"""
    print_header("Checking Environment Variables")
    
    env_path = Path(".env")
    
    # Define the environment variables we need
    required_vars = {
        "DATABASE_URL": "prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiODYyZWIzYzAtNzAzNC00ZTllLThiMzUtMTAxZTVlN2E2NWM4IiwidGVuYW50X2lkIjoiMWU0MDU4N2JmYmVhNDAwOTY4Zjg0Yjk1NzUyMGVkYzEzNTllNDBmNDRiMTQ3NGQwMzNlZmI5NGZhMjU3NGQwYiIsImludGVybmFsX3NlY3JldCI6IjU5YTYyZjFjLTM4ZmItNGJjMy1iMDhiLWYzZDZiM2QwMTY1ZiJ9.NPanbAk1zaBuQscQjvquPFKLhsuRXF6E3NM1V3Y8fUA",
        "DIRECT_URL": "postgresql://neon_db_owner:npg_VmNs0LSkMfK7@ep-orange-thunder-a93lx16e-pooler.gwc.azure.neon.tech/neon_db?sslmode=require"
    }
    
    # Check if .env exists
    if env_path.exists():
        print_status("info", "Found existing .env file, checking content...")
        
        # Read existing env file
        existing_env = env_path.read_text()
        
        # Check for each required variable
        missing_vars = []
        for var, value in required_vars.items():
            if not re.search(f"^{var}=", existing_env, re.MULTILINE):
                missing_vars.append(var)
        
        if missing_vars:
            print_status("warning", f"Missing environment variables: {', '.join(missing_vars)}")
            
            # Append missing variables
            with open(env_path, "a") as f:
                f.write("\n# Added by troubleshooter\n")
                for var in missing_vars:
                    f.write(f"{var}={required_vars[var]}\n")
            
            print_status("ok", f"Added missing environment variables to .env file")
        else:
            print_status("ok", "All required environment variables exist in .env file")
    else:
        print_status("warning", "No .env file found, creating it...")
        
        # Create new env file
        with open(env_path, "w") as f:
            f.write("# Environment variables for Vinmonopolet Explorer\n")
            for var, value in required_vars.items():
                f.write(f"{var}={value}\n")
        
        print_status("ok", "Created .env file with required variables")
    
    return True

def fix_search_functionality():
    """Fix the search button functionality"""
    print_header("Fixing Search Functionality")
    
    header_path = Path("src/components/Header.tsx")
    if not header_path.exists():
        print_status("error", f"Could not find {header_path}")
        return False
    
    header_content = header_path.read_text()
    
    # Check if the search button has onClick handler
    search_button_pattern = r'<Button\s+variant="ghost"\s+size="sm"\s+className="text-white[^"]+"[^>]*>\s*<Search'
    search_button_with_handler = r'<Button\s+variant="ghost"\s+size="sm"\s+className="text-white[^"]+"\s+onClick={[^}]+}[^>]*>\s*<Search'
    
    if re.search(search_button_pattern, header_content) and not re.search(search_button_with_handler, header_content):
        print_status("warning", "Search button has no onClick handler")
        
        # First, add state for search modal
        if "const [searchOpen, setSearchOpen] = useState(false)" not in header_content:
            header_content = header_content.replace(
                "const [menuOpen, setMenuOpen] = useState(false);", 
                "const [menuOpen, setMenuOpen] = useState(false);\n  const [searchOpen, setSearchOpen] = useState(false);"
            )
        
        # Now update the search button
        header_content = re.sub(
            r'(<Button\s+variant="ghost"\s+size="sm"\s+className="text-white[^"]+")([^>]*>)',
            r'\1 onClick={() => setSearchOpen(true)}\2',
            header_content
        )
        
        # Add a simple search modal at the end of the return statement
        if "SearchModal" not in header_content:
            search_modal = """
        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSearchOpen(false)}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-medium mb-4">Search Products</h3>
              <div className="flex">
                <input 
                  type="text"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none"
                  placeholder="Search for wines, spirits..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      window.location.href = `/?search=${encodeURIComponent(e.currentTarget.value)}`;
                      setSearchOpen(false);
                    }
                  }}
                />
                <button 
                  className="bg-wine-red hover:bg-wine-red-light text-white px-4 py-2 rounded-r-md"
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    window.location.href = `/?search=${encodeURIComponent(input.value)}`;
                    setSearchOpen(false);
                  }}
                >
                  <Search size={18} />
                </button>
              </div>
              <div className="mt-4 text-right">
                <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
        """
            
            # Find the closing header tag and insert the search modal before it
            header_content = header_content.replace(
                "</header>",
                f"{search_modal}\n      </header>"
            )
        
        # Save the updated file
        header_path.write_text(header_content)
        print_status("ok", "Added search functionality to the header")
    else:
        if re.search(search_button_with_handler, header_content):
            print_status("ok", "Search button already has onClick handler")
        else:
            print_status("warning", "Could not locate search button in header")
    
    return True

def fix_splash_screen():
    """Fix the splash screen/loader page"""
    print_header("Fixing Splash Screen")
    
    # Check for essential files
    splash_screen_path = Path("src/components/layout/SplashScreen.tsx")
    if not splash_screen_path.exists():
        print_status("warning", "SplashScreen component not found, skipping")
        return False
    
    app_page_path = Path("src/app/page.tsx")
    if not app_page_path.exists():
        print_status("error", "Main app page not found")
        return False
    
    # Check if splash screen is being used in page
    page_content = app_page_path.read_text()
    if "SplashScreen" not in page_content and "usePreloadData" not in page_content:
        print_status("warning", "Splash screen not being used in main page")
        
        # Let's modify the page to use splash screen
        modified_page = """// src/app/page.tsx - Fixed
'use client';

import React, { useRef, useState, useEffect } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Product } from '@/types';
import { usePreloadData } from '@/hooks/usePreloadData';
import SplashScreen from '@/components/layout/SplashScreen';
import ProductDetailsModal from '@/components/product/ProductDetailsModal';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Products and loading state from custom hook
  const { 
    products,
    loading,
    initialLoading,
    hasMore,
    loadMoreProducts,
    fetchRandomProducts,
    setInitialDataLoaded,
    updateFilters
  } = useProducts();
  
  // Preload data hook for splash screen
  const { 
    showSplashScreen, 
    preloadComplete, 
    preloadedData,
    preloadData
  } = usePreloadData({
    onProductsLoaded: (loadedProducts) => {
      // Handle preloaded products when splash screen is shown
      if (loadedProducts.length > 0) {
        setInitialDataLoaded(true);
      }
    }
  });
  
  // Load data when component mounts
  useEffect(() => {
    if (showSplashScreen) {
      // Start preloading data during splash screen
      preloadData();
    } else if (!initialLoading && products.length === 0) {
      // Only fetch if we don't already have products
      fetchRandomProducts();
    }
  }, [showSplashScreen, preloadData, fetchRandomProducts, initialLoading, products.length]);
  
  // Define loader ref with proper type
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Enhanced virtualization with skeleton page management
  const { 
    visibleWindow, 
    visibleSkeletonPages 
  } = useVirtualization({
    items: products,
    itemHeight: 350,
    columnCount: 3,
    skeletonPageSize: 12,
    totalSkeletonPages: 5
  });

  // If splash screen should be shown, return it
  if (showSplashScreen) {
    return (
      <SplashScreen 
        redirectPath="/" 
        loadingTime={5} 
        onPreload={preloadData}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-serif font-semibold mb-6 mt-4">Discover Fine Wines & Spirits</h1>
      
      <ProductGrid
        products={products}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setModalOpen(true);
        }}
        loaderRef={loaderRef}
        loading={loading}
        initialLoading={initialLoading}
        visibleWindow={visibleWindow}
        imageSize="small"
        useWebP={true}
      />
      
      {/* Product details modal */}
      <ProductDetailsModal
        product={selectedProduct}
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
"""
        
        # Save the updated file
        app_page_path.write_text(modified_page)
        print_status("ok", "Updated main page to use splash screen")
    else:
        print_status("ok", "Splash screen is already being used in main page")
    
    # Finally, check if usePreloadData hook needs fixing
    preload_hook_path = Path("src/hooks/usePreloadData.ts")
    if not preload_hook_path.exists():
        print_status("error", "usePreloadData hook not found")
        return False
    
    # Check for potential issues in the preload hook
    preload_hook_content = preload_hook_path.read_text()
    if "cache: 'no-store'" in preload_hook_content:
        # This can cause issues in Next.js 13+
        fixed_hook_content = preload_hook_content.replace(
            "cache: 'no-store'",
            "// Next.js 13+ syntax\ncache: 'no-cache'"
        )
        preload_hook_path.write_text(fixed_hook_content)
        print_status("ok", "Fixed cache setting in preload hook")
    
    return True

def check_db_connection():
    """Check database connection"""
    print_header("Checking Database Connection")
    
    # Create a test script to check database connection
    test_script = """
// db-test.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const count = await prisma.products.count();
    console.log(`Connection successful! Found ${count} products.`);
    return true;
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
"""
    
    # Write test script
    with open("db-test.js", "w") as f:
        f.write(test_script)
    
    print_status("info", "Created database test script")
    print_status("info", "You can run 'node db-test.js' to test database connectivity")
    
    # Check if schema.prisma file needs updating
    schema_path = Path("prisma/schema.prisma")
    if schema_path.exists():
        schema_content = schema_path.read_text()
        
        # Check if datasource configuration is correct
        datasource_pattern = r'datasource\s+db\s+\{[^}]*\}'
        datasource_match = re.search(datasource_pattern, schema_content, re.DOTALL)
        
        if datasource_match:
            datasource_block = datasource_match.group(0)
            
            # Check if directUrl is specified
            if "directUrl" not in datasource_block:
                print_status("warning", "directUrl is missing in schema.prisma")
                
                # Fix datasource block
                new_datasource = """datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}"""
                
                schema_content = re.sub(datasource_pattern, new_datasource, schema_content, flags=re.DOTALL)
                schema_path.write_text(schema_content)
                print_status("ok", "Updated schema.prisma with directUrl")
            else:
                print_status("ok", "schema.prisma already has directUrl configured")
        else:
            print_status("error", "Could not locate datasource block in schema.prisma")
    else:
        print_status("error", "schema.prisma file not found")
    
    return True

def main():
    """Main function to run all diagnostics and fixes"""
    print(f"\n{MAGENTA}Vinmonopolet Explorer Troubleshooter{RESET}")
    print(f"{MAGENTA}================================={RESET}\n")
    
    print("This script will attempt to fix common issues in the Vinmonopolet Explorer app.")
    
    # Run all fix functions
    env_fixes = fix_env_issues()
    search_fixes = fix_search_functionality()
    splash_fixes = fix_splash_screen()
    db_checks = check_db_connection()
    
    # Final report
    print_header("Troubleshooting Summary")
    
    if all([env_fixes, search_fixes, splash_fixes, db_checks]):
        print_status("ok", "All issues have been addressed")
    else:
        print_status("warning", "Some issues could not be fully resolved")
    
    print(f"\n{CYAN}Next steps:{RESET}")
    print("1. Restart your development server")
    print("2. Run 'npx prisma generate' to update Prisma client")
    print("3. Test the app to see if issues are resolved")
    print("4. If issues persist, check the development console for errors")
    
    print(f"\n{GREEN}Troubleshooting completed!{RESET}\n")

if __name__ == "__main__":
    main()