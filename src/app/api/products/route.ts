export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 50;
  
    const products = await prisma.products.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: 'insensitive' } } : {},
          category ? { category: { contains: category, mode: 'insensitive' } } : {},
          country ? { country: { contains: country, mode: 'insensitive' } } : {},
        ],
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });
  
    const total = await prisma.products.count({
      where: {
        AND: [
          search ? { name: { contains: search, mode: 'insensitive' } } : {},
          category ? { category: { contains: category, mode: 'insensitive' } } : {},
          country ? { country: { contains: country, mode: 'insensitive' } } : {},
        ],
      },
    });
  
    return NextResponse.json({ products, total, page, perPage });
  }