/**
 * Knowledge Base Service untuk Memoright
 *
 * Layanan untuk mengelola basis pengetahuan dan dokumentasi
 * internal aplikasi.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"
import { PerformanceCache } from "@/lib/performance/performance-optimization"

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: Date
  updatedAt: Date
  version: number
  status: "draft" | "published" | "archived"
  viewCount: number
  helpfulCount: number
  unhelpfulCount: number
}

export interface KnowledgeCategory {
  id: string
  name: string
  description: string
  parentId?: string
  articleCount: number
}

export interface SearchOptions {
  query: string
  categories?: string[]
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult {
  articles: KnowledgeArticle[]
  total: number
  categories: {
    id: string
    name: string
    count: number
  }[]
  tags: {
    name: string
    count: number
  }[]
}

@Service("knowledgeBaseService")
export class KnowledgeBaseService {
  private initialized = false
  private articleCache: PerformanceCache<string, KnowledgeArticle>
  private categoryCache: PerformanceCache<string, KnowledgeCategory>

  constructor() {
    // Inisialisasi cache
    this.articleCache = new PerformanceCache<string, KnowledgeArticle>({
      ttl: 30 * 60 * 1000, // 30 menit
      namespace: "knowledge_articles",
    })

    this.categoryCache = new PerformanceCache<string, KnowledgeCategory>({
      ttl: 60 * 60 * 1000, // 1 jam
      namespace: "knowledge_categories",
    })
  }

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Preload kategori
      await this.getAllCategories()

      this.initialized = true
      logger.info("Knowledge base service initialized")
    } catch (error) {
      logger.error(
        "Failed to initialize knowledge base service",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  /**
   * Mendapatkan artikel berdasarkan ID
   */
  public async getArticle(id: string): Promise<KnowledgeArticle> {
    // Cek cache
    const cachedArticle = this.articleCache.get(id)
    if (cachedArticle) {
      return cachedArticle
    }

    try {
      const article = await apiClient.get<KnowledgeArticle>(`/api/knowledge/articles/${id}`)

      // Simpan ke cache
      this.articleCache.set(id, article)

      return article
    } catch (error) {
      logger.error(`Failed to get knowledge article: ${id}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mendapatkan semua artikel
   */
  public async getAllArticles(options?: {
    category?: string
    tag?: string
    status?: "draft" | "published" | "archived"
    limit?: number
    offset?: number
  }): Promise<{
    articles: KnowledgeArticle[]
    total: number
  }> {
    try {
      // Buat query params
      const params = new URLSearchParams()
      if (options?.category) {
        params.append("category", options.category)
      }
      if (options?.tag) {
        params.append("tag", options.tag)
      }
      if (options?.status) {
        params.append("status", options.status)
      }
      if (options?.limit) {
        params.append("limit", options.limit.toString())
      }
      if (options?.offset) {
        params.append("offset", options.offset.toString())
      }

      const result = await apiClient.get<{
        articles: KnowledgeArticle[]
        total: number
      }>(`/api/knowledge/articles?${params.toString()}`)

      // Simpan artikel ke cache
      for (const article of result.articles) {
        this.articleCache.set(article.id, article)
      }

      return result
    } catch (error) {
      logger.error("Failed to get knowledge articles", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mencari artikel
   */
  public async searchArticles(options: SearchOptions): Promise<SearchResult> {
    try {
      // Buat query params
      const params = new URLSearchParams()
      params.append("query", options.query)

      if (options.categories && options.categories.length > 0) {
        for (const category of options.categories) {
          params.append("category", category)
        }
      }

      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          params.append("tag", tag)
        }
      }

      if (options.limit) {
        params.append("limit", options.limit.toString())
      }

      if (options.offset) {
        params.append("offset", options.offset.toString())
      }

      const result = await apiClient.get<SearchResult>(`/api/knowledge/search?${params.toString()}`)

      // Simpan artikel ke cache
      for (const article of result.articles) {
        this.articleCache.set(article.id, article)
      }

      return result
    } catch (error) {
      logger.error("Failed to search knowledge articles", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mendapatkan semua kategori
   */
  public async getAllCategories(): Promise<KnowledgeCategory[]> {
    try {
      const categories = await apiClient.get<KnowledgeCategory[]>("/api/knowledge/categories")

      // Simpan kategori ke cache
      for (const category of categories) {
        this.categoryCache.set(category.id, category)
      }

      return categories
    } catch (error) {
      logger.error("Failed to get knowledge categories", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mendapatkan kategori berdasarkan ID
   */
  public async getCategory(id: string): Promise<KnowledgeCategory> {
    // Cek cache
    const cachedCategory = this.categoryCache.get(id)
    if (cachedCategory) {
      return cachedCategory
    }

    try {
      const category = await apiClient.get<KnowledgeCategory>(`/api/knowledge/categories/${id}`)

      // Simpan ke cache
      this.categoryCache.set(id, category)

      return category
    } catch (error) {
      logger.error(`Failed to get knowledge category: ${id}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Membuat artikel baru
   */
  public async createArticle(
    article: Omit<
      KnowledgeArticle,
      "id" | "createdAt" | "updatedAt" | "version" | "viewCount" | "helpfulCount" | "unhelpfulCount"
    >,
  ): Promise<KnowledgeArticle> {
    try {
      const newArticle = await apiClient.post<KnowledgeArticle>("/api/knowledge/articles", article)

      // Simpan ke cache
      this.articleCache.set(newArticle.id, newArticle)

      return newArticle
    } catch (error) {
      logger.error("Failed to create knowledge article", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Memperbarui artikel
   */
  public async updateArticle(
    id: string,
    article: Partial<
      Omit<
        KnowledgeArticle,
        "id" | "createdAt" | "updatedAt" | "version" | "viewCount" | "helpfulCount" | "unhelpfulCount"
      >
    >,
  ): Promise<KnowledgeArticle> {
    try {
      const updatedArticle = await apiClient.put<KnowledgeArticle>(`/api/knowledge/articles/${id}`, article)

      // Perbarui cache
      this.articleCache.set(id, updatedArticle)

      return updatedArticle
    } catch (error) {
      logger.error(
        `Failed to update knowledge article: ${id}`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Menghapus artikel
   */
  public async deleteArticle(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/knowledge/articles/${id}`)

      // Hapus dari cache
      this.articleCache.delete(id)
    } catch (error) {
      logger.error(
        `Failed to delete knowledge article: ${id}`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Menandai artikel sebagai membantu
   */
  public async markArticleAsHelpful(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/knowledge/articles/${id}/helpful`)

      // Hapus dari cache untuk memaksa refresh
      this.articleCache.delete(id)
    } catch (error) {
      logger.error(
        `Failed to mark knowledge article as helpful: ${id}`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Menandai artikel sebagai tidak membantu
   */
  public async markArticleAsUnhelpful(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/knowledge/articles/${id}/unhelpful`)

      // Hapus dari cache untuk memaksa refresh
      this.articleCache.delete(id)
    } catch (error) {
      logger.error(
        `Failed to mark knowledge article as unhelpful: ${id}`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    this.articleCache.clear()
    this.categoryCache.clear()
    this.initialized = false
  }
}

