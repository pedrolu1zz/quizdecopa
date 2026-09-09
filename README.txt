QUIZ DAS COPAS — PEDRO LUIZ

1) SITE
Os arquivos index.html, style.css, app.js e questions.js formam o site.
Para testar: abra index.html no navegador.

2) PUBLICAR GRATUITAMENTE
A opção mais simples é usar Netlify Drop: entre no site da Netlify, arraste a pasta do projeto para a área de publicação e aguarde o endereço ser criado.
Também funciona em GitHub Pages ou Vercel.

3) RANKING GLOBAL COM SUPABASE
O ranking atual funciona localmente. Para todos os jogadores compartilharem o mesmo ranking:
- Crie um projeto no Supabase.
- Crie uma tabela chamada ranking com:
  id: bigint, identity/auto increment, primary key
  name: text
  score: integer
  created_at: timestamptz, default now()
- Habilite RLS e crie políticas públicas SOMENTE para INSERT e SELECT da tabela ranking.
- No app.js, preencha SUPABASE_URL e SUPABASE_ANON_KEY com os dados públicos do projeto.
- NÃO coloque a service_role key no site.

4) SEGURANÇA
O nome do jogador é limitado a 24 caracteres e o HTML de nomes é escapado antes de ser exibido.

5) PERSONALIZAÇÃO
Autor: Pedro Luiz já aparece no topo e na tela inicial.
