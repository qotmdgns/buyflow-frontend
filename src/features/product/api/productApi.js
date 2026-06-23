import {
  mockProducts,
  productFilterOptions,
} from "@/features/product/data/mockProductData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PRODUCT_MOCK !== "false"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")

const PRODUCT_API_BASE_URL = `${API_BASE_URL}/api/products`

function normalizeProductItem(product) {
  return {
    ...product,
    id: product.id ?? product.productId,
    code: product.code ?? product.productNo,
    name: product.name ?? product.productName,
    category: product.category ?? product.categoryName ?? "",
    spec: product.spec ?? product.specification ?? "",
    unit: product.unit ?? "",
    manufacturer: product.manufacturer ?? product.companyName ?? "",
    description: product.description ?? "",
    unitPrice: product.unitPrice ?? 0,
    safetyStock: product.safetyStock ?? 0,
    currentStock: product.currentStock ?? 0,
    isActive: product.isActive ?? product.useYn !== "N",
    registeredAt: product.registeredAt ?? product.createdAt ?? "",
  }
}

function withAllOption(values = []) {
  const uniqueValues = Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  )

  return ["전체", ...uniqueValues.filter((value) => value !== "전체")]
}

function normalizeProductFilterOptions(data = {}) {
  const rawData = data.data ?? data

  return {
    categories: withAllOption(
      rawData.categories ?? rawData.categoryNames ?? [],
    ),
    units: withAllOption(rawData.units ?? []),
    activeStatuses: rawData.activeStatuses ?? ["전체", "사용", "미사용"],
  }
}

function normalizeProductResponse(data) {
  if (Array.isArray(data)) {
    const items = data.map(normalizeProductItem)

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

  const rawItems = data.items ?? data.content ?? []
  const items = rawItems.map(normalizeProductItem)

  return {
    items,
    pagination: {
      page: data.pagination?.page ?? data.page ?? (data.number ?? 0) + 1,
      size: data.pagination?.size ?? data.size ?? items.length,
      totalElements:
        data.pagination?.totalElements ?? data.totalElements ?? items.length,
      totalPages: Math.max(
        data.pagination?.totalPages ?? data.totalPages ?? 1,
        1,
      ),
    },
  }
}

function toProductRequestPayload(form) {
  const isActive =
    form.isActive !== undefined
      ? form.isActive
      : form.useYn
        ? form.useYn !== "N"
        : true

  return {
    productNo: (form.code ?? form.productNo ?? "").trim(),
    productName: (form.name ?? form.productName ?? "").trim(),

    companyName: (form.companyName ?? form.manufacturer ?? "").trim(),
    bizRegNo: (form.bizRegNo ?? "").trim(),

    categoryName: form.category ?? form.categoryName ?? "",
    parentCategory: (form.parentCategory ?? "").trim(),

    spec: (form.spec ?? "").trim(),
    unit: form.unit ?? "",

    unitPrice:
      form.unitPrice === "" ||
      form.unitPrice === null ||
      form.unitPrice === undefined
        ? 0
        : Math.max(0, Number(form.unitPrice) || 0),

    origin: (form.origin ?? "").trim(),
    description: (form.description ?? "").trim(),
    competingProduct: form.competingProduct === "Y" ? "Y" : "N",

    validStartDate: form.validStartDate || null,
    validEndDate: form.validEndDate || null,

    isActive,
    useYn: isActive ? "Y" : "N",
  }
}

export async function createProduct(form) {
  const response = await fetch(PRODUCT_API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toProductRequestPayload(form)),
  })

  if (!response.ok) {
    throw new Error("품목 등록에 실패했습니다.")
  }

  return response.text()
}

export async function deleteProduct(productId) {
  const response = await fetch(`${PRODUCT_API_BASE_URL}/${productId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("품목 삭제에 실패했습니다.")
  }

  return response.text()
}

export async function updateProduct(productId, form) {
  const response = await fetch(`${PRODUCT_API_BASE_URL}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toProductRequestPayload(form)),
  })

  if (!response.ok) {
    throw new Error("품목 수정에 실패했습니다.")
  }

  return response.text()
}

export async function fetchProducts(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockProducts(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    // 현재 PRODUCTS 기본 CRUD 단계에서는 lowStockOnly만 서버로 보내지 않음
    if (key === "lowStockOnly") {
      return
    }

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

  return normalizeProductFilterOptions(await response.json())
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

  return normalizeProductItem(await response.json())
}
