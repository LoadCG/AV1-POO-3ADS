import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = request.nextUrl;

  // Se o usuário tentar acessar a página de login tendo uma sessão ativa
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Rotas protegidas gerais
  const rotasProtegidas = ["/dashboard", "/aeronaves", "/funcionarios"];
  const isRotaProtegida = rotasProtegidas.some(route => pathname === route || pathname.startsWith(route + "/"));

  if (isRotaProtegida) {
    if (!session) {
      // Redireciona para o login se não autenticado
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Se for rota de funcionários, exige nível ADMINISTRADOR
    if (pathname.startsWith("/funcionarios")) {
      if (session.nivelPermissao !== "ADMINISTRADOR") {
        // Redireciona para o dashboard se não tiver permissão
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|skyforge_logo.svg).*)"],
};
