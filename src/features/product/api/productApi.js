import {
  mockProducts,
  productFilterOptions,
} from "@/features/product/data/mockProductData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PRODUCT_MOCK !== "false"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")

const PRODUCT_API_BASE_URL = `${API_BASE_URL}/api/products`

function normalizeProductResponse(data) {
  // 백엔드 ProductController의 getProducts()는 현재 List<Product>를 반환함
  // 즉, 응답 형태가 [{ productId, productNo, productName, ... }] 배열임
  if (Array.isArray(data)) {
    const items = data.map((product) => ({
      ...product,

      // 프론트 테이블이 사용하는 필드명으로 변환
      id: product.productId,
      code: product.productNo,
      name: product.productName,
      category: product.categoryName,

      // 백엔드 PRODUCTS 테이블에는 현재재고/안전재고/사용여부/등록일이 없거나
      // 응답에 포함되지 않을 수 있으므로 기본값 처리
      currentStock: product.currentStock ?? 0,
      safetyStock: product.safetyStock ?? 0,
      isActive: product.isActive ?? true,
      registeredAt:
        product.registeredAt ?? product.createdAt ?? product.createdDate ?? "",
    }))

    return {
      items,
      pagination: {
        page: 1,
        size: items.length,
        totalElements: items.length,
        totalPages: 1,
      },
    }
  }

  // 혹시 나중에 백엔드가 { items, pagination } 형태로 바뀌는 경우
  if (data?.items && data?.pagination) {
    return data
  }

  // Spring Pageable 형태로 바뀌는 경우
  if (data?.content) {
    const items = data.content.map((product) => ({
      ...product,
      id: product.productId,
      code: product.productNo,
      name: product.productName,
      category: product.categoryName,
      currentStock: product.currentStock ?? 0,
      safetyStock: product.safetyStock ?? 0,
      isActive: product.isActive ?? true,
      registeredAt:
        product.registeredAt ?? product.createdAt ?? product.createdDate ?? "",
    }))

    return {
      items,
      pagination: {
        page: (data.number ?? 0) + 1,
        size: data.size ?? items.length,
        totalElements: data.totalElements ?? items.length,
        totalPages: Math.max(data.totalPages ?? 1, 1),
      },
    }
  }

  return {
    items: [],
    pagination: {
      page: 1,
      size: 15,
      totalElements: 0,
      totalPages: 1,
    },
  }
}

export async function fetchProducts(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockProducts(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === false || value === "전체") {
      return
    }

    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  const response = await fetch(
    `${PRODUCT_API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`,
    {
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("품목 목록을 불러오지 못했습니다.")
  }

  return normalizeProductResponse(await response.json())
}

export async function fetchProductFilterOptions() {
  if (USE_MOCK) {
    return productFilterOptions
  }

  const response = await fetch(`${PRODUCT_API_BASE_URL}/filter-options`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("품목 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function fetchProductById(productId) {
  if (USE_MOCK) {
    await wait(100)

    const product = mockProducts.find((item) => item.id === Number(productId))

    if (!product) {
      throw new Error("품목 정보를 찾을 수 없습니다.")
    }

    return {
      ...product,
      warehouseSettings: product.warehouseSettings?.map((setting) => ({
        ...setting,
      })),
    }
  }

  const response = await fetch(`${PRODUCT_API_BASE_URL}/${productId}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("품목 상세 정보를 불러오지 못했습니다.")
  }

  return response.json()
}
