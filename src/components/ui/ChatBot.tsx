"use client";

// src/components/ui/ChatBot.tsx — Chat flotante (WhatsApp MVP)
// confidence: high
// Implementación: WhatsApp Business (no requiere backend) — clic abre chat con mensaje precargado
// Para producción: integrar Tawk.to, Crisp, o Dialogflow (placeholder estructura)
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const WHATSAPP_NUMBER = "5491112345678";
const PRESET_MESSAGES = [
  { id: "pedido", text: "Quiero hacer un pedido 📲" },
  { id: "reserva", text: "Quiero reservar mesa 📅" },
  { id: "consultar", text: "Tengo una consulta 💬" },
];

export function ChatBot() {
  const [open, setOpen] = useState(false);

  const handleSendMessage = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="fixed bottom-32 right-6 z-40">
      {/* Ventana de chat */}
      {open && (
        <div className="mb-4 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="bg-primary-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍣</span>
              <div>
                <span className="font-bold block">Sushi Bar Assistant</span>
                <span className="text-xs opacity-90">En línea · responde en ~5 min</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Mensajes preset */}
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-3">
              ¡Hola! 👋 ¿En qué puedo ayudarte? Elegí una opción:
            </p>
            {PRESET_MESSAGES.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSendMessage(msg.text)}
                className="w-full text-left p-3 bg-muted hover:bg-accent border border-border rounded-xl text-sm text-foreground transition-all hover:scale-[1.02]"
              >
                {msg.text}
              </button>
            ))}
            <div className="pt-2 text-center">
              <Link
                href="/reservas"
                onClick={() => setOpen(false)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                o reservá online →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        title="Asistente de Sushi Bar"
        className="bg-primary-700 text-white w-14 h-14 rounded-full shadow-xl hover:bg-primary-800 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring relative"
      >
        {open ? (
          <Icon emoji="✕" label="Cerrar chat" className="text-xl" />
        ) : (
          <>
            <Icon emoji="💬" label="Chat" className="text-xl" />
            {/* Notificación pulse (solo si no abierto) */}
            {!open && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-slow border-2 border-card"></span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
