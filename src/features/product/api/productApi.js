import {
  mockProducts,
  productFilterOptions,
} from "@/features/product/data/mockProductData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PRODUCT_MOCK !== "false"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function getMockProducts(params) {
  const {
    page = 1,
    size = 10,
    itemCode = "",
    itemName = "",
    category = "전체",
    unit = "전체",
    activeStatus = "전체",
    lowStockOnly = false,
  } = params

  const filteredProducts = mockProducts.filter((product) => {
    const matchesItemCode = !itemCode || includesKeyword(product.code, itemCode)
    const matchesItemName = !itemName || includesKeyword(product.name, itemName)
    const matchesCategory = category === "전체" || product.category === category
    const matchesUnit = unit === "전체" || product.unit === unit
    const matchesActiveStatus =
      activeStatus === "전체" ||
      (activeStatus === "사용" && product.isActive) ||
      (activeStatus === "미사용" && !product.isActive)

    const matchesLowStock =
      !lowStockOnly || product.currentStock < product.safetyStock

    return (
      matchesItemCode &&
      matchesItemName &&
      matchesCategory &&
      matchesUnit &&
      matchesActiveStatus &&
      matchesLowStock
    )
  })

  const totalElements = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredProducts.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function normalizeProductResponse(data) {
  // Spring Boot List<Product>
  if (Array.isArray(data)) {
    const items = data.map((product) => ({
      ...product,

      // 프론트가 기대하는 이름
      id: product.productId,
      code: product.productNo,
      name: product.productName,
      category: product.categoryName,

      // 화면용 기본값
      safetyStock: product.safetyStock ?? 0,
      currentStock: product.currentStock ?? 0,
      isActive: product.isActive ?? true,
      registeredAt: product.registeredAt ?? "",
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

  // Mock 구조
  if (Array.isArray(data.items) && data.pagination) {
    return data
  }

  // Pageable 구조
  return {
    items: data.content ?? [],
    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 10,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
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

    query.set(
      key,
      key === "page" ? String(Number(value) - 1) : String(value),
    )
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?${query.toString()}`,
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/filter-options`,
    {
      cache: "no-store",
    },
  )

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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${productId}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("품목 상세 정보를 불러오지 못했습니다.")
  }

  return response.json()
}
