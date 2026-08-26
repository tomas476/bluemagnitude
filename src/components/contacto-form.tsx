"use client";

import * as React from "react";
import { CONTACTO, EMPRESA } from "@/content/site";

/**
 * Formulario sem backend: abre o WhatsApp ja preenchido, que e o canal real
 * destes clientes. O email fica como alternativa visivel para quem nao usa
 * WhatsApp. Nao ha envio silencioso nem promessa de resposta automatica.
 */
export function ContactoForm() {
  const [erro, setErro] = React.useState<string | null>(null);

  function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") ?? "").trim();
    const email = String(dados.get("email") ?? "").trim();
    const telefone = String(dados.get("telefone") ?? "").trim();
    const distrito = String(dados.get("distrito") ?? "");
    const tipo = String(dados.get("tipo") ?? "");

    if (!nome || !telefone || !distrito || !tipo) {
      setErro("Falta preencher o nome, o telefone, o distrito e o serviço.");
      return;
    }
    setErro(null);

    const texto = [
      `Olá, sou ${nome}.`,
      `Queria uma proposta para: ${tipo}.`,
      `Distrito: ${distrito}.`,
      `Telefone: ${telefone}.`,
      email ? `Email: ${email}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    window.open(
      `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={submeter} className="grid gap-[var(--s-sm)]">
      <div className="grid gap-[var(--s-sm)] sm:grid-cols-2">
        <label className="grid gap-[var(--s-xs)]">
          <span className="label">Nome</span>
          <input className="field" name="nome" type="text" autoComplete="name" required />
        </label>
        <label className="grid gap-[var(--s-xs)]">
          <span className="label">Telefone</span>
          <input className="field" name="telefone" type="tel" autoComplete="tel" required />
        </label>
      </div>

      <label className="grid gap-[var(--s-xs)]">
        <span className="label">Email</span>
        <input className="field" name="email" type="email" autoComplete="email" />
      </label>

      <div className="grid gap-[var(--s-sm)] sm:grid-cols-2">
        <label className="grid gap-[var(--s-xs)]">
          <span className="label">Distrito</span>
          <select className="field" name="distrito" defaultValue="" required>
            <option value="" disabled>
              Escolhe o distrito
            </option>
            {CONTACTO.distritos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-[var(--s-xs)]">
          <span className="label">Serviço</span>
          <select className="field" name="tipo" defaultValue="" required>
            <option value="" disabled>
              Escolhe o serviço
            </option>
            {CONTACTO.tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro ? (
        <p className="meta" role="alert" style={{ color: "#ffb4b4" }}>
          {erro}
        </p>
      ) : null}

      <button type="submit" className="btn mt-[var(--s-xs)] w-full sm:w-auto">
        Enviar por WhatsApp
      </button>

      <p className="meta">
        Preferes email? Escreve para{" "}
        <a href={`mailto:${EMPRESA.email}`} style={{ textDecoration: "underline" }}>
          {EMPRESA.email}
        </a>
        .
      </p>
    </form>
  );
}
