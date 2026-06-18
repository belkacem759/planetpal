'use client';

import { GrowingPlant } from '@/components/animated/growing-plant';
import { Header } from '@/components/layouts/header';
import { ProductGridInfo } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useCategoriesQuery, useProductsQuery } from '@/hooks';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Heart, Leaf, Recycle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {

  // Data fetching
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: products, isLoading: productsLoading } = useProductsQuery({
    limit: 12,
  });

  const featuredProducts = products?.data || [];

  return (
    <div className="min-h-screen">
      <Header />
      <motion.section
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >

        {/* Growing plants decoration */}
        <div className="absolute left-8 bottom-8 hidden lg:block">
          <GrowingPlant delay={500} size="lg" />
        </div>
        <div className="absolute right-12 top-16 hidden lg:block">
          <GrowingPlant delay={1000} size="md" />
        </div>
        <div className="absolute left-1/4 top-12 hidden md:block">
          <GrowingPlant delay={1500} size="sm" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
              </motion.div>
              <motion.h1
                animate={{ opacity: 1, scale: 1 }}
                className="text-6xl font-bold text-foreground bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.3, duration: 0.8, stiffness: 100, type: "spring" }}
              >
                PlanetPal
              </motion.h1>
              <motion.div
                animate={{
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Heart className="h-8 w-8 text-red-500 ml-2" />
              </motion.div>
            </motion.div>

            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl text-foreground/80 mb-2 font-medium"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              🌱 Your Eco-Friendly Adventure Starts Here! 🌍
            </motion.p>

            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Discover amazing eco-friendly products that make sustainability fun and stylish!
            </motion.p>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <Link href="/shop">
                    🛍️ Shop Now
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      className="ml-2"
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 shadow-lg hover:shadow-xl"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/about">
                    🌿 Learn More
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 bg-background relative overflow-hidden"
        id="features"
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ margin: "-100px", once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {/* Decorative plants */}
        <div className="absolute right-4 top-8 hidden lg:block">
          <GrowingPlant delay={2000} size="sm" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Why Choose PlanetPal? ✨
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Because saving the planet should be fun! 🎉</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  rotate: 12,
                  scale: 1.1
                }}
              >
                <motion.div
                  transition={{ duration: 0.6 }}
                  whileHover={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                >
                  <Leaf className="h-10 w-10 text-green-600" />
                </motion.div>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                🌿 100% Eco-Friendly
              </motion.h3>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                All our products are sustainably sourced and environmentally responsible. Mother Earth approved! 🌍
              </p>
            </motion.div>

            <motion.div
              className="text-center group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  rotate: 12,
                  scale: 1.1
                }}
              >
                <motion.div
                  transition={{ duration: 1, ease: "easeInOut" }}
                  whileHover={{
                    rotate: 360
                  }}
                >
                  <Recycle className="h-10 w-10 text-blue-600" />
                </motion.div>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                ♻️ Recyclable Packaging
              </motion.h3>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                Our packaging is 100% recyclable and made from recycled materials. Zero waste, maximum awesome! 📦
              </p>
            </motion.div>

            <motion.div
              className="text-center group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  rotate: 12,
                  scale: 1.1
                }}
              >
                <motion.div
                  transition={{ duration: 0.6 }}
                  whileHover={{
                    scale: [1, 1.1, 1],
                    y: [0, -5, 0]
                  }}
                >
                  <Globe className="h-10 w-10 text-purple-600" />
                </motion.div>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                🌍 Global Impact
              </motion.h3>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                Every purchase contributes to environmental conservation efforts worldwide. You're a planet hero! 🦸‍♀️
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className="py-16 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-950 relative overflow-hidden"
        id="categories"
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ margin: "-100px", once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {/* Decorative elements */}
        <div className="absolute left-8 top-16 hidden lg:block">
          <GrowingPlant delay={2500} size="md" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
            🛍️ Shop by Category 🛍️
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Find your perfect eco-friendly match! 💚</p>

          {categoriesLoading ? (
            <div className="flex justify-center">
              <Spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories?.slice(0, 4).map((category: any, index: number) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  key={category.id}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.02,
                    transition: { damping: 17, stiffness: 400, type: "spring" },
                    y: -8
                  }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-card border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 h-full">
                    <Link href={`/categories/${category.slug}`}>
                      <CardHeader className="text-center pb-2">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-3"
                          transition={{ duration: 0.6 }}
                          whileHover={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                            y: [0, -5, 0]
                          }}
                        >
                          <Sparkles className="h-6 w-6 text-green-600" />
                        </motion.div>
                        <motion.div
                          transition={{ damping: 17, stiffness: 400, type: "spring" }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <CardTitle className="text-lg group-hover:text-green-600 transition-colors duration-300">
                            {category.name}
                          </CardTitle>
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground text-center group-hover:text-foreground/80 transition-colors duration-300">
                          {category.description}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <motion.div
              transition={{ damping: 17, stiffness: 400, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl"
                variant="outline"
              >
                <Link href="/shop">
                  🌟 View All Categories
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section
        className="py-16 bg-background relative overflow-hidden"
        id="products"
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ margin: "-100px", once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            ⭐ Featured Products ⭐
          </motion.h2>
          <motion.p
            className="text-center text-muted-foreground mb-12 text-lg"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Handpicked eco-friendly favorites! 💚
          </motion.p>
          {productsLoading ? (
            <div className="flex justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <ProductGridInfo
                  products={featuredProducts || []}
                />
              </motion.div>
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  transition={{ damping: 17, stiffness: 400, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    <Link href="/shop">
                      🛍️ View All Products
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        className="ml-2"
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-700 dark:via-blue-700 dark:to-purple-700 text-white relative overflow-hidden"
        id="cta"
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ margin: "-100px", once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              animate={{
                y: [0, i === 0 ? -20 : i === 1 ? -15 : i === 2 ? -10 : -25, 0],
                ...(i === 1 && { x: [0, 10, 0] }),
                ...(i === 2 && { rotate: [0, 180, 360] }),
                scale: [1, i === 0 ? 1.1 : i === 1 ? 1.2 : i === 3 ? 0.8 : 1, 1],
                ...(i !== 1 && i !== 2 && { opacity: [i === 0 ? 0.3 : 0.2, i === 0 ? 0.6 : 0.5, i === 0 ? 0.3 : 0.2] })
              }}
              className={`absolute bg-white/10 rounded-full ${i === 0 ? 'top-10 left-10 w-20 h-20' :
                i === 1 ? 'top-32 right-20 w-16 h-16' :
                  i === 2 ? 'bottom-20 left-1/4 w-12 h-12' :
                    'bottom-32 right-1/3 w-24 h-24'
                }`}
              key={i}
              transition={{
                delay: i * 0.5,
                duration: i === 0 ? 4 : i === 1 ? 3.5 : i === 2 ? 5 : 4.5,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          ))}
        </div>

        {/* Decorative plants */}
        <div className="absolute left-8 bottom-8 hidden lg:block">
          <GrowingPlant delay={1000} size="lg" />
        </div>
        <div className="absolute right-8 top-8 hidden lg:block">
          <GrowingPlant delay={1500} size="md" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <motion.h2
              animate={{ scale: [1, 1.02, 1] }}
              className="text-5xl font-bold mb-6"
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            >
              🌍 Ready to Make a Difference? 🌱
            </motion.h2>
            <motion.p
              className="text-xl mb-8 text-green-100 dark:text-green-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 0.9, y: 0 }}
            >
              Join thousands of eco-conscious shoppers making sustainable choices every day.
              Together, we're growing a greener future! 💚
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <motion.div
                transition={{ damping: 17, stiffness: 400, type: "spring" }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="group bg-white text-green-600 hover:bg-green-50 shadow-2xl hover:shadow-3xl px-8 py-4 text-lg font-semibold"
                  size="lg"
                  variant="secondary"
                >
                  <Link className="flex items-center gap-2" href="/shop">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    Start Shopping Now
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Heart className="h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-white/80"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 0.8 }}
              >
                <span className="text-sm">🌟 Free shipping on orders over $50</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
