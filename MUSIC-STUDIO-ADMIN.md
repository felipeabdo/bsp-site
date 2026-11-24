# Estúdio musical BSP — administrador

## Permissão de administrador

A edição continua protegida por allowlist no servidor:

```env
BSP_ADMIN_MEMBER_IDS=ID_DO_INTEGRANTE
```

É possível informar vários IDs separados por vírgula. Não é necessário configurar `BSP_ADMIN_EMAILS` se a conta já está autorizada pelo ID.

## Instalar ou atualizar o banco

Depois de aplicar a atualização do projeto, execute:

```bash
npm run db:music
```

O comando é idempotente: cria as colunas e tabelas que faltarem e preserva a sequência/gravação antiga. Os dados do primeiro padrão e da gravação antiga são lidos como o primeiro tipo de som (`sound-1`).

## Editor público

Acesse `Configurações > Estúdio musical > Instrumentos públicos`.

Cada instrumento aceita até 10 slots de som. Cada slot tem nome, padrão de 16 passos, fonte (sintetizador ou gravação) e parâmetros próprios do sintetizador: onda, afinação, duração, filtro e ruído. A gravação de cada slot é gerida separadamente; o áudio vai para `music_sound_samples` e os metadados ficam na configuração do instrumento.

Para baixo, guitarra e metais há editor de linha melódica. Baixo e guitarra também aceitam acordes por célula; guitarra tem uma batida-base independente que usa o último acorde definido. As técnicas `slide` e `hammer-on` são aplicadas à nota da célula.

Ao clicar em **Salvar e publicar instrumento**, os sons, padrões e arranjo são atualizados no simulador público da página Inspirações.

## Estudos privados

Na aba `Enviar estudo privado`, informe um ou mais IDs (separados por vírgula, ponto e vírgula ou quebra de linha), instrumento, nome, andamento, orientação e sequência. É possível copiar o padrão público do instrumento atualmente selecionado e alterá-lo antes do envio.

Cada destinatário recebe uma cópia isolada na tabela `music_assignments`. A aba `Meus estudos` em Configurações consulta apenas os materiais do integrante conectado. A rota pública `/api/music` não consulta nem inclui essa tabela.

## Limitações da primeira versão expandida

- O canal de sopros existente no site é um instrumento agregado chamado `Metais`; a linha melódica é escrita para esse canal. Sax, trompete e trombone ainda não são canais separados.
- Os timbres sintéticos são gerados pela Web Audio API. Os parâmetros permitem diferenciá-los, mas ainda não há editor de envelopes avançados, EQ por bandas ou efeitos como reverb/delay.
- O editor privado envia batida e pode copiar a melodia/acordes públicos do instrumento. A edição privada independente de melodias/acordes, gravações privadas e histórico de versões pode ser adicionada numa etapa posterior.
- A base de dados mantém os arquivos de áudio como base64 para permanecer compatível com a arquitetura atual. Para muitas gravações grandes, é recomendável migrar os áudios para armazenamento de objetos.
