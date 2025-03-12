// src/utils/bigint-serializer.ts
export function serializeBigInt(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'bigint') {
      return Number(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(serializeBigInt);
    }
    
    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data).map(
          ([key, value]) => [key, serializeBigInt(value)]
        )
      );
    }
    
    return data;
  }