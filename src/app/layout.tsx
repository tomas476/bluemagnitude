import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { EMPRESA } from "@/content/site";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bluemagnitude.imogrow.pt"),
  title: {
    default: `${EMPRESA.nome}, energia solar para empresas em Leiria`,
    template: `%s · ${EMPRESA.nome}`,
  },
  description:
    "Instalação de sistemas fotovoltaicos, autoconsumo com e sem baterias, off-grid, AVAC, manutenção e consultoria em Leiria, Santarém e Lisboa.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: EMPRESA.nome,
    images: ["/og-bluemagnitude.jpg"],
  },
  icons: { icon: "/marca/icone.png", apple: "/marca/icone.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#conteudo">
          Saltar para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
