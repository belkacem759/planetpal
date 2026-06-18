import type { CareInstructions } from './database'

export type Params = Promise<{ [key: string]: string }>

export interface ProductImage {
  gallery: string[]
  main: string
}

// Data Transfer Object for products from the backend
export interface ProductDTO {
  care_instructions: CareInstructions | null
  category: {
    name: string
    slug: string
  } | null
  categoryId: string
  description: string | null
  difficulty_level: number
  id: string
  images: ProductImage | null
  is_plant: boolean
  name: string
  price: number
  slug: string
  stock_quantity: number
}

// Frontend Product type
export type Product = ProductDTO
