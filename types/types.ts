import type { CareInstructions } from './database'

export type Params = Promise<{ [key: string]: string }>

export interface ProductImage {
  main: string
  gallery: string[]
}

// Data Transfer Object for products from the backend
export interface ProductDTO {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  images: ProductImage | null
  stock_quantity: number
  care_instructions: CareInstructions | null
  difficulty_level: number
  is_plant: boolean
  category: {
    name: string
    slug: string
  } | null
  categoryId: string
}

// Frontend Product type
export type Product = ProductDTO
