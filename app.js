/*
  QUIZ DAS COPAS — Pedro Luiz
  Para ranking global, configure SUPABASE_URL e SUPABASE_ANON_KEY.
  Nunca coloque a service_role key neste arquivo.
*/
const SUPABASE_URL = 'https://qlifkbebojuhgfpedovr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oOdtV_auoiXc2Ji0HN_BBA_aOti_BzF';
const RANKING_TABLE = 'ranking';
let player='',questions=[],pos=0,total=0,attempt=0,locked=false;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function startGame(){player=$('name').value.trim().slice(0,24);if(!player){$('name').focus();$('name').animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'none'}],250);return}const levels=['Fácil','Médio','Difícil','Muito difícil'];questions=[];levels.forEach(l=>questions.push(...shuffle(BANK.filter(x=>x.level===l)).slice(0,5)));questions=shuffle(questions);pos=0;total=0;show('game');render()}
function render(){attempt=0;locked=false;const q=questions[pos];$('qcount').textContent=`Pergunta ${pos+1}/20`;$('level').textContent=q.level;$('score').textContent=total;$('progress').style.width=`${(pos+1)*5}%`;$('question').textContent=q.q;$('attempts').textContent='Primeira tentativa • vale 4 pontos';$('feedback').classList.add('hidden');$('info').classList.add('hidden');$('next').classList.add('hidden');$('next').textContent=pos===19?'VER RESULTADO →':'PRÓXIMA PERGUNTA →';$('options').innerHTML=q.a.map((a,i)=>`<button class="option" data-i="${i}">${String.fromCharCode(65+i)}) ${safe(a)}</button>`).join('');document.querySelectorAll('.option').forEach(b=>b.onclick=()=>answer(+b.dataset.i,b))}
function answer(i,btn){if(locked)return;const q=questions[pos];attempt++;if(i===q.c){const pts=5-attempt;total+=pts;locked=true;btn.style.borderColor='var(--green)';btn.style.background='#123a25';$('score').textContent=total;$('feedback').textContent=`✓ Acertou! +${pts} ponto${pts>1?'s':''}.`;$('feedback').classList.remove('hidden');showInfo(q);document.querySelectorAll('.option').forEach(b=>b.disabled=true);$('next').classList.remove('hidden')}else{btn.classList.add('wrong');btn.disabled=true;if(attempt<4){const pts=4-attempt;$('attempts').textContent=`Tentativa ${attempt+1} de 4 • se acertar agora vale ${pts} ponto${pts>1?'s':''}`;$('feedback').textContent='Você errou esta tentativa. A resposta correta continua escondida!';$('feedback').classList.remove('hidden')}else{locked=true;document.querySelectorAll('.option').forEach(b=>b.disabled=true);$('attempts').textContent='4 tentativas utilizadas';$('feedback').textContent='Você não acertou. A resposta correta continua escondida até o final.';$('feedback').classList.remove('hidden');$('next').classList.remove('hidden')}}}
function showInfo(q){if(q.type==='scorer'||q.type==='team'){const title=q.type==='scorer'?'👤 Sobre o jogador':'🌎 Sobre a seleção';$('info').innerHTML=`<b>${title}</b><br>${safe(q.bio)}`;$('info').classList.remove('hidden')}}
function next(){if(pos<19){pos++;render()}else finish()}
async function finish() {
  show('result');

  $('hello').textContent = `Parabéns, ${player}!`;
  $('finalScore').textContent = `${total} / 80`;

  let lvl =
    total >= 65 ? 'Muito difícil' :
    total >= 45 ? 'Difícil' :
    total >= 25 ? 'Médio' : 'Fácil';

  $('finalLevel').innerHTML =
    `Nível de desempenho: <span class="pill">${lvl}</span>`;

  await saveScore();
  await renderRanking();
}
function localGet(){return JSON.parse(localStorage.getItem('copasRanking')||'[]')}
function localSave(){const r=localGet();r.push({name:player,score:total,date:new Date().toLocaleDateString('pt-BR')});r.sort((a,b)=>b.score-a.score);localStorage.setItem('copasRanking',JSON.stringify(r.slice(0,100)))}
async function saveScore() {
  localSave();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${RANKING_TABLE}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: player,
          score: total
        })
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

  } catch (error) {
    console.error('Erro ao salvar ranking:', error);
  }
}
async function renderRanking() {
  const box = $('rankBox');

  box.innerHTML = `
    <h2>🌎 Ranking Mundial</h2>
    <p class="small">Carregando ranking...</p>
  `;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${RANKING_TABLE}?select=name,score,created_at&order=score.desc,created_at.asc&limit=1000`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const partidas = await response.json();
    const melhores = new Map();

    // Guarda somente a melhor pontuação de cada nome
    partidas.forEach(p => {
      const nome = String(p.name || '').trim();
      const chave = nome.toLowerCase();

      if (
        !melhores.has(chave) ||
        Number(p.score) > Number(melhores.get(chave).score)
      ) {
        melhores.set(chave, {
          name: nome,
          score: Number(p.score),
          created_at: p.created_at
        });
      }
    });

    const ranking = [...melhores.values()].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    const top10 = ranking.slice(0, 10);

    const minhaPosicao =
      ranking.findIndex(
        p => p.name.toLowerCase() === player.toLowerCase()
      ) + 1;

    const recorde = ranking.length ? ranking[0].score : 0;

    let html = `
      <h2>🌎 Ranking Mundial — Top 10</h2>

      <p>🏆 Recorde: <strong>${recorde} pontos</strong></p>
      <p>👥 Jogadores: <strong>${ranking.length}</strong></p>
      <p>📍 Sua posição: <strong>${minhaPosicao ? `${minhaPosicao}º` : '-'}</strong></p>

      <table>
        <tr>
          <th>#</th>
          <th>Jogador</th>
          <th>Pontos</th>
        </tr>
    `;

    top10.forEach((p, i) => {
      let posicao = `${i + 1}º`;

      if (i === 0) posicao = '🥇';
      if (i === 1) posicao = '🥈';
      if (i === 2) posicao = '🥉';

      const souEu =
        p.name.toLowerCase() === player.toLowerCase();

      html += `
        <tr class="${souEu ? 'me' : ''}">
          <td>${posicao}</td>
          <td>${safe(p.name)}</td>
          <td><strong>${p.score}</strong></td>
        </tr>
      `;
    });

    html += `
      </table>
      <p class="small center">
        🌎 Ranking compartilhado entre todos os jogadores.
      </p>
    `;

    box.innerHTML = html;

  } catch (error) {
    console.error('Erro no ranking mundial:', error);

    box.innerHTML = `
      <h2>🌎 Ranking Mundial</h2>
      <p>Não foi possível carregar o ranking.</p>
    `;
  }
}
$('start').onclick=startGame;$('name').addEventListener('keydown',e=>{if(e.key==='Enter')startGame()});$('next').onclick=next;$('again').onclick=()=>{$('name').value=player;show('home')};$('clear').onclick=()=>{if(confirm('Apagar o ranking salvo neste navegador?')){localStorage.removeItem('copasRanking');renderRanking()}};
