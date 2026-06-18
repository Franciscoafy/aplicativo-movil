import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Definimos las rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher(['/login(.*)', '/sign-up(.*)', '/'])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Evitar interceptar archivos internos de Next.js, archivos estáticos o APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/trpc')
  ) {
    return
  }

  // Proteger todas las demás rutas
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ejecutar el middleware en todas las rutas de la aplicación
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
