export const ROTAS = {
  home: "/",
  sobre: "/sobre/",
  servicos: "/servicos/",
  projetos: "/projetos/",
  contacto: "/contacto/",
  privacidade: "/privacidade/",
} as const;

export const ANCORAS = {
  sobre: "#quem-somos",
  servicos: "#servicos",
  projetos: "#projetos",
  processo: "#processo",
  reels: "#instagram",
  contacto: "#falar",
  perguntas: "#perguntas",
} as const;

export const servicoHref = (slug: string) => `/servicos/${slug}/`;
export const projetoHref = (slug: string) => `/projetos/${slug}/`;
