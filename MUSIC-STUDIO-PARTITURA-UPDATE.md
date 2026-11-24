# Atualização do Estúdio Musical BSP — partitura e grade responsiva

## O que mudou

- A grade rítmica agora usa CSS explícito: 8 colunas em telas estreitas (duas linhas de oito passos) e 16 colunas a partir de 640 px. A largura é limitada para impedir que as células cresçam como painéis.
- Os campos de cifras usam uma grade própria com cartões mais largos, para facilitar acordes extensos e alterados.
- Baixo e guitarra abrem inicialmente na aba **Acordes e harmonia**. A pauta continua acessível na aba **Pauta musical**; guitarra também tem **Batida base**.
- A pauta tem claves de sol e fá, 16 posições alinhadas ao compasso, acidentes naturais/sustenidos/bemóis/dobrados e linhas suplementares.
- O parser de cifras reconhece tríades maiores/menores, power chords, diminutos, meio-diminutos, aumentados, suspensos, acordes 6/9, extensões 7/9/11/13, maj7/minor-major, add, alterações, omissões e inversões com baixo após barra.
- Ao clicar em uma célula rítmica da percussão e ativar o toque normal ou acentuado, o instrumento selecionado é pré-escutado imediatamente.
- As gravações reais mantêm os controles de pitch (semitons) e duração; o pitch é aplicado via playback rate, portanto também altera a velocidade. Duração 0 mantém a gravação inteira.

## Instalação

1. Pare o servidor de desenvolvimento com `Ctrl+C`.
2. Faça backup da pasta do projeto.
3. Extraia o patch na raiz do projeto com `unzip -o ~/Downloads/site-bsp-estudio-partitura-patch.zip -d ~/Projetos/site-bsp`.
4. Reinicie com `npm run dev`.

Não há migração nova, alteração de schema ou dependência nova nesta atualização. Os dados existentes no PostgreSQL e o `.env.local` devem ser preservados.

## Verificações feitas

- `npm run typecheck`: aprovado.
- `npm run lint`: sem erros; permanecem dois avisos preexistentes em `src/components/silhouettes.tsx`.
- `npm run build`: aprovado com uma `DATABASE_URL` temporária de build; não foi gravada no `.env.local`.
- O navegador e o PostgreSQL real do usuário não foram usados nesta validação, então a conferência visual/interativa final deve ocorrer na máquina do projeto.
