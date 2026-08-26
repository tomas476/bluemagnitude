type ConexaoLeve = { saveData?: boolean; effectiveType?: string };

/**
 * Decide se o cliente pediu (ou precisa de) a versao leve: movimento reduzido,
 * poupanca de dados ou rede fraca. No servidor devolve true, para o primeiro
 * render nunca montar video.
 */
export function prefersLightweight(): boolean {
  if (typeof window === "undefined") return true;

  const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduzido) return true;

  const nav = navigator as Navigator & { connection?: ConexaoLeve };
  const ligacao = nav.connection;
  if (!ligacao) return false;
  if (ligacao.saveData) return true;
  const tipo = ligacao.effectiveType ?? "";
  return tipo === "slow-2g" || tipo === "2g";
}
