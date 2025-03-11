// high-price-checker.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHighPrices() {
  try {
    console.log('Connecting to database...');
    
    // Find all products with price above 50,000
    const highPricedProducts = await prisma.products.findMany({
      where: {
        price: {
          gt: 50000
        }
      },
      orderBy: {
        price: 'desc'
      },
      select: {
        product_id: true,
        name: true,
        price: true,
        category: true
      }
    });
    
    console.log(`Found ${highPricedProducts.length} products with price above 50,000`);
    
    // Log the high-priced products
    if (highPricedProducts.length > 0) {
      console.table(highPricedProducts);
    }
    
    // Check for NULL prices
    const nullPriceProducts = await prisma.products.count({
      where: {
        price: null
      }
    });
    
    console.log(`Products with NULL price: ${nullPriceProducts}`);
    
    // Get price distribution
    const priceStats = await prisma.$queryRaw`
      SELECT 
        MIN(price) as min_price, 
        MAX(price) as max_price, 
        AVG(price) as avg_price,
        COUNT(*) as total_count,
        SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) as null_count,
        SUM(CASE WHEN price > 50000 THEN 1 ELSE 0 END) as high_price_count
      FROM products
    `;
    
    console.log('Price statistics:');
    console.log(priceStats[0]);
    
    // Check for price type in schema
    const schemaInfo = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'products' AND column_name = 'price'
    `;
    
    console.log('Price column schema:');
    console.log(schemaInfo);
    
    // Get the top 10 most expensive products
    const topExpensive = await prisma.products.findMany({
      where: {
        price: {
          not: null
        }
      },
      orderBy: {
        price: 'desc'
      },
      take: 10,
      select: {
        product_id: true,
        name: true,
        price: true,
        category: true
      }
    });
    
    console.log('Top 10 most expensive products:');
    console.table(topExpensive);

  } catch (error) {
    console.error('Error checking high prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHighPrices();