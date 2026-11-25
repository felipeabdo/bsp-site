# Atualização da carteirinha: QR Code e leitor de eventos

## O que esta atualização entrega

- Substitui o código de barras ilustrativo por um QR Code real, gerado localmente no próprio site, sem serviço externo.
- O QR da carteirinha do integrante contém somente um identificador e uma assinatura HMAC; não inclui endereço, telefone, data de nascimento, tipo sanguíneo ou contato de emergência.
- Ao ler o QR pela página administrativa, o site valida a assinatura no servidor, consulta os dados atuais do integrante e mostra dados pessoais e de emergência apenas a quem já tem permissão administrativa.
- A entrada no evento é gravada no banco e só pode ser registrada uma vez por integrante/evento.
- O QR da página pública de verificação abre apenas a verificação pública; o QR da carteirinha autenticada é o que serve para registrar presença.
- A frase “Carteirinha de integrante” recebe uma cápsula creme com texto azul para manter contraste mesmo sobre a espiral.

## Passos antes de publicar

1. Copie os diretórios `src` e `public` deste pacote para a raiz do projeto, substituindo os arquivos existentes.
2. No PostgreSQL usado pelo site, execute **uma única vez** o conteúdo de `src/db/migrations/0002_event_check_ins.sql`. Ele cria a tabela de registros de entrada.
3. Nas variáveis de ambiente da hospedagem (por exemplo, Vercel), configure `BSP_QR_SECRET` com uma chave aleatória estável. Gere uma com:

   ```bash
   openssl rand -hex 32
   ```

   Guarde a chave e não a troque depois de imprimir as carteirinhas. A assinatura usa `DATABASE_URL` como fallback caso `BSP_QR_SECRET` não esteja definido, mas definir a chave explicitamente evita que uma troca da senha do banco invalide QR Codes já impressos.

4. Configure `NEXT_PUBLIC_SITE_URL` com o domínio público definitivo do site, incluindo `https://` e sem barra no final, por exemplo `https://seu-dominio.com.br`. Isso evita que carteirinhas emitidas em uma URL temporária de preview apontem para o endereço errado.
5. Publique a aplicação.

## Como usar

- O integrante encontra o QR em **Configurações → Carteirinha** e também na carteira digital da Área do Integrante. Imprima/salve novamente o PDF para substituir o antigo código de barras.
- O administrador entra na Área do Integrante ou em Configurações e abre **Leitor de eventos**. Também pode acessar diretamente `/eventos/leitor`.
- Selecione o evento e clique em **Abrir câmera e ler QR**. O navegador pedirá permissão para usar a câmera. O endereço precisa estar em HTTPS.
- Também há leitura manual para leitor USB/Bluetooth ou para colar o endereço lido por outro aparelho.

O leitor ao vivo usa `BarcodeDetector`, disponível nos navegadores Chromium atuais (Chrome/Edge). Quando o navegador não oferece essa API, a leitura manual continua disponível.

## Permissões e dados privados

A página e as APIs do leitor usam a mesma lista administrativa já usada pelo site: `BSP_ADMIN_MEMBER_IDS` e `BSP_ADMIN_EMAILS`. Não é criada uma permissão pública nova. Os dados pessoais e de saúde nunca são colocados no conteúdo do QR; só são retornados ao leitor depois de autenticação e autorização da administração.

Não foi adicionada dependência npm. O pacote de QR é gerado em TypeScript dentro do projeto.
