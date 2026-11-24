# BSP 2026 — elementos originais extraídos do manual

Os SVGs em `vectors/` foram extraídos diretamente dos desenhos vetoriais das páginas do PDF `BSP 2026.pdf`, sem redesenho. As versões `*-mask.svg` preservam os caminhos originais em máscaras monocromáticas para colorização via `currentColor`; os selos, o lema e as assinaturas multicoloridas mantêm as cores que constam no manual.

## Identidade visual

Paleta oficial:
- Coral: `#F9834E`
- Azul: `#28799F`
- Creme: `#F9F9EA`
- Branco: `#FFFFFF`

Elementos vetoriais incluídos: símbolo do tridente com halo e asas, asas isoladas, assinaturas vertical e horizontal, monograma BSP, espiral unitária, espiral ampla de fundo e faixa de espirais, lema “Eu curto bloco de rua!”, selo em escudo, emblema circular, selo em estrela e assinatura oval.

Os arquivos `photos/` e `products/` contêm imagens incorporadas ao PDF, extraídas sem redesenho ou tratamento. A máscara alfa separada da caixa de guerra está em `products/caixa-de-guerra-alpha.png`.

## Tipografia

O manual identifica **Brevia** (Light, Regular, Medium, Semibold, Bold, Black, ExtraBlack e itálicos) e **Glodok Display**. Os arquivos de fonte não foram distribuídos; o CSS declara Brevia/Glodok como primeira opção e usa fontes de sistema como fallback até que os arquivos licenciados sejam adicionados ao projeto. Logotipos e letras que aparecem como artes de marca já estão em SVG vetorial e não dependem da fonte instalada.
