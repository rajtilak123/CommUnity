export const PUBLIC_ROUTES = ["/login", "/auth/callback", "/ui-preview", "/test-db"] as const;

export const RESIDENT_ROUTE_PREFIXES = [
  "/dashboard",
  "/complaints",
  "/notices",
  "/notifications",
  "/facilities",
  "/profile",
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isResidentRoute(pathname: string): boolean {
  return RESIDENT_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedRoute(pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    return false;
  }

  if (pathname === "/") {
    return true;
  }

  return isAdminRoute(pathname) || isResidentRoute(pathname);
}

export function getHomePathForRole(role: "resident" | "admin"): string {
  return role === "admin" ? "/admin" : "/dashboard";
}
