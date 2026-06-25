import { apiFetch } from "@/lib/api/fetchClient"

import {
  mockProducts,
  productFilterOptions,
} from "@/features/product/data/mockProductData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PRODUCT_MOCK !== "false"

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
    updatedAt:
      product.updatedAt ??
      product.modifiedAt ??
      product.registeredAt ??
      product.createdAt ??
      "",
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

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function getMockProducts(params = {}) {
  const page = Number(params.page ?? 1)
  const size = Number(params.size ?? 10)

  let items = mockProducts.map(normalizeProductItem)

  if (params.keyword) {
    const keyword = String(params.keyword).toLowerCase()

    items = items.filter((item) =>
      [item.code, item.name, item.category, item.manufacturer]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }

  if (params.category && params.category !== "전체") {
    items = items.filter((item) => item.category === params.category)
  }

  if (params.unit && params.unit !== "전체") {
    items = items.filter((item) => item.unit === params.unit)
  }

  if (params.activeStatus && params.activeStatus !== "전체") {
    const activeValue = params.activeStatus === "사용"

    items = items.filter((item) => item.isActive === activeValue)
  }

  const totalElements = items.length
  const totalPages = Math.max(Math.ceil(totalElements / size), 1)
  const start = (page - 1) * size
  const pagedItems = items.slice(start, start + size)

  return {
    items: pagedItems,
    pagination: {
      page,
      size,
      totalElements,
      totalPages,
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
  if (USE_MOCK) {
    return "품목 등록이 완료되었습니다."
  }

  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(toProductRequestPayload(form)),
  })
}

export async function deleteProduct(productId) {
  if (!productId) {
    throw new Error("삭제할 품목 ID가 없습니다.")
  }

  if (USE_MOCK) {
    return "품목 삭제가 완료되었습니다."
  }

  return apiFetch(`/api/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  })
}

export async function updateProduct(productId, form) {
  if (!productId) {
    throw new Error("수정할 품목 ID가 없습니다.")
  }

  if (USE_MOCK) {
    return "품목 수정이 완료되었습니다."
  }

  return apiFetch(`/api/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify(toProductRequestPayload(form)),
  })
}

export async function fetchProducts(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockProducts(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (key === "lowStockOnly") {
      return
    }

    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === false ||
      value === "전체"
    ) {
      return
    }

    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  const queryString = query.toString()
  const path = queryString ? `/api/products?${queryString}` : "/api/products"

  const data = await apiFetch(path, {
    cache: "no-store",
  })

  return normalizeProductResponse(data)
}

export async function fetchProductFilterOptions() {
  if (USE_MOCK) {
    return productFilterOptions
  }

  const data = await apiFetch("/api/products/filter-options", {
    cache: "no-store",
  })

  return normalizeProductFilterOptions(data)
}

export async function fetchProductById(productId) {
  if (!productId) {
    throw new Error("품목 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(100)

    const product = mockProducts.find((item) => item.id === Number(productId))

    if (!product) {
      throw new Error("품목 정보를 찾을 수 없습니다.")
    }

    return {
      ...normalizeProductItem(product),
      warehouseSettings: product.warehouseSettings?.map((setting) => ({
        ...setting,
      })),
    }
  }

  const data = await apiFetch(
    `/api/products/${encodeURIComponent(productId)}`,
    {
      cache: "no-store",
    },
  )

  return normalizeProductItem(data)
}
