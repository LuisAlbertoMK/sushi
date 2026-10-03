"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CategoriaForm } from "./CategoriaForm";

export function NuevaCategoriaModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-ring transition"
      >
        + Nueva categoría
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva categoría"
        description="Completá los datos para crear una nueva categoría."
      >
        <CategoriaForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
