import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
import { Hero } from "@/components/hero/hero";
import { QuemSomos } from "@/components/home/quem-somos";
import { Servicos } from "@/components/home/servicos";
import { Projetos } from "@/components/home/projetos";
import { Processo } from "@/components/home/processo";
import { Reels } from "@/components/home/reels";
import { Perguntas } from "@/components/home/perguntas";
import { Falar } from "@/components/home/falar";

export default function Home() {
  return (
    <>
      <SiteNav />
      <AncorasSuaves />
      <main id="conteudo" tabIndex={-1}>
        {/* o heroi fica FORA do CampoLuz: e ele que da a luz */}
        <Hero />
        <CampoLuz>
          <QuemSomos />
          <Servicos />
          <Projetos />
          <Processo />
          <Reels />
          <Perguntas />
          <Falar />
        </CampoLuz>
      </main>
      {/* o rodape fica fora: e chapa opaca, e uma lavagem por baixo de opaco
          nao se ve */}
      <SiteFooter />
    </>
  );
}
