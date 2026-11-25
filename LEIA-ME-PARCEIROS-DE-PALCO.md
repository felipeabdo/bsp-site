BSP — nova aba “Parceiros de palco”

Conteúdo deste patch
- src/components/MembersExplorer.tsx

O que muda
- Adiciona a quarta aba “Parceiros de palco” depois das três abas existentes.
- A aba lista os registros cuja coluna users.category tenha exatamente o valor `parceiro`.
- O cartão usa a mesma grade, cores alternadas, fotos, silhuetas e modal já usados pelas outras categorias.
- O modal identifica a categoria como “Parceiro de palco”.
- Se ainda não houver registros nesta categoria, a aba mostra uma mensagem vazia apropriada.

Importante
Este patch cria a aba e o filtro, mas não classifica automaticamente nenhum integrante. Nenhum perfil existente é alterado. Para que alguém apareça nessa aba, o registro correspondente em `users` precisa receber `category = 'parceiro'`. A coluna `category` já é do tipo text; esta alteração da interface não requer migração de banco.

Aplicação
1. Faça backup do arquivo `src/components/MembersExplorer.tsx`.
2. Extraia o ZIP na raiz do projeto, mantendo a estrutura `src/components/...`.
3. Execute `npm run build`.
4. Teste `/integrantes`: as quatro abas devem aparecer. A nova aba ficará vazia até que existam registros com categoria `parceiro`.

Este patch não altera fotos, estilos dos cartões, skeletons, banco de dados, credenciais ou outras páginas.
