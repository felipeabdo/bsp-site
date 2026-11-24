# Estúdio BSP — atualização de UX e publicação pública

## Alterações desta versão

- Sequenciador de 16 passos fixado em duas fileiras horizontais de oito células, com largura máxima, área de fundo, estados visuais e alvos de toque responsivos.
- A mesma apresentação foi aplicada à batida pública, à batida dos estudos privados e à batida base da guitarra.
- Pré-escuta do arranjo completo permanece disponível no editor público e no editor privado. A prévia completa reúne células rítmicas, notas, acordes e acompanhamento de guitarra quando definidos.
- A área pública recebe cabeçalhos HTTP explícitos contra cache. O cliente consulta `/api/music` sem cache, atualiza ao receber eventos entre abas/ao voltar ao foco e oferece atualização manual.
- O botão “Banda completa” agora inclui instrumentos com linha de baixo, acordes ou batida base da guitarra, mesmo quando não há nota na pauta superior.
- Os cartões de Sons & Inspirações também exibem linha grave e indicação de acompanhamento, quando publicados.

## Biblioteca de áudio — avaliação de licenças

Nenhum pacote completo foi embutido nesta atualização: as bibliotecas abertas que foram verificadas cobrem instrumentos parciais, mas não oferecem um conjunto fiel de surdo, dobra, martelo, repinique, timbal, caixa e guira/ganzá. Não seria correto rotular conga ou cajón genéricos como gravações reais desses instrumentos.

Fontes promissoras verificadas em 16/11/2026:

- Meta Open Sound: guitarra de nylon (348 amostras) e aço (375 amostras), em CC0, 48 kHz/24-bit, com mapas SFZ e versões OGG para web.
- FreePats World Percussion: gravações CC0 de cajón, bongôs, egg shaker, pandeiro/tambourine, palmas, claves, castanholas, conga, maracas e darbuka. São instrumentos reais, mas não equivalem aos tambores de samba-reggae do BSP.
- VCSL/VSCO-2 CE e bibliotecas relacionadas: há fontes CC0 para saxofone, trompete, trombone, contrabaixo pizzicato, agogô, claves, conga e shaker, entre outros, com timbres de caráter mais orquestral/isolado.

Para a bateria BSP, a solução mais fiel continua sendo o envio de gravações próprias pelo administrador. A integração de bancos multisample CC0 deve ser feita com mapeamento de notas/velocidades e arquivos locais versionados, não com um único áudio remoto transposto para todas as notas.
