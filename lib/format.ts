export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Kutilmoqda",
    confirmed: "Tasdiqlangan",
    preparing: "Tayyorlanmoqda",
    ready: "Tayyor",
    completed: "Yakunlangan",
    cancelled: "Bekor qilingan",
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}
