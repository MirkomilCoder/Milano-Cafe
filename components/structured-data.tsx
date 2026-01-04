"use client"

import { useEffect } from "react"

interface StructuredDataProps {
  data: Record<string, any>
}

/**
 * Component to inject structured data (JSON-LD) into the page
 * Used for SEO and rich snippets in Google Search
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [data])

  return null
}

/**
 * LocalBusiness Schema
 */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Milano Kafe",
  image: "https://milano-kafe.uz/milano.jpg",
  description: "Eng Yaxshi Kofе va Taomlari - Milano Kafe",
  url: "https://milano-kafe.uz",
  telephone: "+998-71-XXX-XX-XX",
  email: "info@milano-kafe.uz",
  address: {
    "@type": "PostalAddress",
    streetAddress: "",
    addressLocality: "Tashkent",
    addressRegion: "TK",
    postalCode: "100000",
    addressCountry: "UZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.2995,
    longitude: 69.2401,
  },
  areaServed: "UZ",
  servesCuisine: ["Uzbek", "Italian", "International"],
  priceRange: "$$",
  sameAs: [
    "https://www.facebook.com/milano-kafe",
    "https://www.instagram.com/milano-kafe",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "23:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "09:00",
      closes: "23:00",
    },
  ],
}

/**
 * Product Schema Generator
 */
export function generateProductSchema(product: any, baseUrl: string = "https://milano-kafe.uz") {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: product.image_url || `${baseUrl}/placeholder.jpg`,
    brand: {
      "@type": "Brand",
      name: "Milano Kafe",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "UZS",
      price: product.price,
      availability: product.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Milano Kafe",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
    },
  }
}

/**
 * BreadcrumbList Schema Generator
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl: string = "https://milano-kafe.uz") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Organization Schema
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Milano Kafe",
  url: "https://milano-kafe.uz",
  logo: "https://milano-kafe.uz/logo.png",
  sameAs: [
    "https://www.facebook.com/milano-kafe",
    "https://www.instagram.com/milano-kafe",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+998-71-XXX-XX-XX",
    email: "info@milano-kafe.uz",
  },
}

/**
 * FAQPage Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}
