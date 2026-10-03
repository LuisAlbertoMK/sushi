"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ProductoForm } from "./ProductoForm";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
}

export function NuevoProductoModal({ categorias }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-ring transition"
      >
        + Nuevo producto
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo producto"
        description="Completá los datos para crear un nuevo producto."
      >
        <ProductoForm categorias={categorias} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
