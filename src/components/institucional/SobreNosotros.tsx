// src/components/institucional/SobreNosotros.tsx — Historia visual + misión + redes
// confidence: high
import Image from "next/image";
import Link from "next/link";

const timeline = [
  { year: "2018", label: "Nace Sushi Bar con pasión por el arte del sushi" },
  { year: "2019", label: "Apertura de la primera sucursal" },
  { year: "2021", label: "Lanzamento de delivery y pedidos online" },
  { year: "2024", label: "Reservas en vivo + promociones semanales" },
];

export function SobreNosotros() {
  return (
    <section className="py-16 bg-card border border-border rounded-2xl shadow-md mb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Quiénes Somos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Auténtico sushi fresco, hecho con pasión y ingredientes de la más alta calidad.
            Cada día traemos a tu mesa el sabor del Japón, desde 2018.
          </p>
        </div>

        {/* Timeline histórico */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {timeline.map((item) => (
            <div
              key={item.year}
              className="bg-muted/60 dark:bg-muted/50 rounded-xl p-4 text-center border border-border"
            >
              <div className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-1">
                {item.year}
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Misión + Redes sociales */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Nuestra Misión</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ofrecer sushi artesanal fresco cada día, creando momentos de conexión
              y bienestar a través de la gastronomía japonesa auténtica.
            </p>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://instagram.com/sushibar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Síguenos en Instagram"
            >
              <span className="text-2xl">📷</span>
              <span>Instagram</span>
            </Link>
            <Link
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Chat por WhatsApp"
            >
              <span className="text-2xl">💬</span>
              <span>WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
