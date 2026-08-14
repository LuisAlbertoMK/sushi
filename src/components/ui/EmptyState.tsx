// src/components/ui/EmptyState.tsx — Empty states ilustrados con SVG + copy cálido
// confidence: high
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "cart" | "promos" | "menu" | "pedidos" | "reservas" | "search";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const illustrations = {
  cart: "🛒",
  promos: "🎁",
  menu: "🍣",
  pedidos: "📋",
    reservas: "📅",
    search: "🔍",
};

const defaults = {
  cart: {
    title: "Tu carrito está vacío",
    description: "Explorá nuestro menú y agregá delicias",
    actionLabel: "Ver Menú",
    actionHref: "/menu",
  },
  promos: {
    title: "No hay promociones ahora",
    description: "Pronto tendremos nuevas ofertas y novedades 💫",
    actionLabel: "Ver Menú",
    actionHref: "/menu",
  },
  menu: {
    title: "Próximamente nuevas delicias",
    description: "Estamos preparando algo especial para vos 👨‍🍳",
    actionLabel: "Ver todas las categorías",
    actionHref: "/menu",
  },
  pedidos: {
    title: "No hay pedidos todavía",
    description: "Compartí nuestro menú con amigos y comenzá a recibir pedidos",
    actionLabel: "Ver Dashboard",
    actionHref: "/admin/dashboard",
  },
  reservas: {
    title: "No hay reservas todavía",
    description: "Cuando los clientes reserven, aparecerán aquí",
    actionLabel: "Ver Dashboard",
    actionHref: "/admin/dashboard",
  },
  search: {
    title: "Pedido no encontrado",
    description: "Verificá que el número sea correcto o contactá al mostrador",
    actionLabel: "Buscar otro pedido",
    actionHref: "/pedidos/track",
  },
};

export function EmptyState({ type, title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  const def = defaults[type];
  const illustration = illustrations[type];

  return (
    <div
      className={cn(
        "text-center py-12 bg-card border border-border rounded-xl",
        className
      )}
    >
      <span className="text-6xl mb-4 block" aria-hidden="true">
        {illustration}
      </span>
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title || def.title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description || def.description}
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-primary-700 dark:bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {actionLabel || def.actionLabel}
        </Link>
      )}
    </div>
  );
}
