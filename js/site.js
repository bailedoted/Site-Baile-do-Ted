/* =====================================================================
   BAILE DO TED — comportamento do site público
   Agenda, fotos do topo/meio e prints vêm do Supabase.
   Se o banco estiver fora do ar, o site continua bonito com o padrão.
   ===================================================================== */
(function () {
  'use strict';

  var ARTE_PADRAO = 'img/site/arte-padrao.jpg';
  var WHATS_AGENDA = '5541995906901';
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /* ---------- utilitários ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function soNumeros(v) { return String(v || '').replace(/\D/g, ''); }
  function linkSeguro(url) {
    var u = String(url || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    if (/^(www\.)/i.test(u)) return 'https://' + u;
    return '';
  }
  function imagemSegura(url) {
    var u = String(url || '').trim();
    if (!u) return ARTE_PADRAO;
    if (/^https:\/\//i.test(u) || /^img\//i.test(u)) return u;
    return ARTE_PADRAO;
  }
  function linkWhats(numero, msg) {
    var d = soNumeros(numero);
    if (!d) d = WHATS_AGENDA;
    if (d.length <= 11) d = '55' + d;
    return 'https://wa.me/' + d + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function linkInsta(handle) {
    var h = String(handle || '').trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/[/?#].*$/, '').replace(/^@/, '');
    return h ? { url: 'https://instagram.com/' + encodeURIComponent(h), nome: '@' + h } : null;
  }
  function dataLocal(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return null;
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function hojeISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function diasAte(iso) {
    var d = dataLocal(iso);
    if (!d) return null;
    var h = dataLocal(hojeISO());
    return Math.round((d - h) / 86400000);
  }

  var ICONE_INSTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>';
  var ICONE_WHATS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.06 24l1.69-6.16a11.87 11.87 0 0 1-1.59-5.95C.16 5.35 5.41 0 11.98 0c3.18 0 6.18 1.24 8.43 3.5a11.82 11.82 0 0 1 3.48 8.43c0 6.62-5.35 11.97-11.92 11.97-2 0-3.96-.5-5.7-1.45L.06 24zm16.46-9.08c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.61.76-.74.92-.14.15-.28.17-.51.06-.23-.12-.99-.37-1.88-1.17-.7-.62-1.16-1.38-1.3-1.62-.14-.23-.02-.36.1-.47.1-.11.23-.28.35-.41.12-.14.16-.24.23-.39.08-.16.04-.3-.02-.41-.06-.12-.52-1.27-.72-1.74-.19-.46-.38-.4-.53-.4h-.45c-.15 0-.41.06-.62.29-.21.24-.82.8-.82 1.95s.84 2.26.96 2.42c.11.16 1.65 2.52 3.99 3.53.56.24 1 .38 1.35.5.56.17 1.07.15 1.47.09.45-.07 1.38-.56 1.58-1.11.2-.55.2-1.02.14-1.11-.06-.1-.22-.16-.45-.28z"/></svg>';

  /* ---------- AGENDA ---------- */
  function rotuloProximidade(iso) {
    var n = diasAte(iso);
    if (n === 0) return 'É hoje';
    if (n === 1) return 'É amanhã';
    if (n > 1 && n <= 7) return 'Daqui a ' + n + ' dias';
    return 'Próximo show confirmado';
  }

  function botaoPrincipal(ev, classe) {
    var ingresso = linkSeguro(ev.link_ingresso);
    if (ingresso) {
      return '<a class="botao botao--vermelho ' + (classe || '') + '" href="' + esc(ingresso) + '" target="_blank" rel="noopener">Comprar ingresso</a>';
    }
    var msg = 'Olá! Quero mais informações sobre o show "' + (ev.nome || 'Baile do Ted') + '".';
    return '<a class="botao botao--vermelho ' + (classe || '') + '" href="' + esc(linkWhats(WHATS_AGENDA, msg)) + '" target="_blank" rel="noopener">Mais informações</a>';
  }

  function botoesSociais(ev, contornoClaro) {
    var html = '';
    var insta = linkInsta(ev.instagram) || linkInsta('@bailedoted');
    html += '<a class="botao botao--contorno icone-botao" href="' + esc(insta.url) + '" target="_blank" rel="noopener" aria-label="Instagram ' + esc(insta.nome) + '" title="' + esc(insta.nome) + '">' + ICONE_INSTA + '</a>';
    var numero = soNumeros(ev.local_contato) || WHATS_AGENDA;
    html += '<a class="botao botao--contorno icone-botao" href="' + esc(linkWhats(numero, 'Olá! Vi no site do Baile do Ted o show "' + (ev.nome || '') + '".')) + '" target="_blank" rel="noopener" aria-label="WhatsApp do local" title="WhatsApp">' + ICONE_WHATS + '</a>';
    return html;
  }

  function htmlDestaque(ev) {
    var d = dataLocal(ev.data);
    var arte = imagemSegura(ev.imagem_url);
    var local = ev.local_nome ? esc(ev.local_nome) : 'Local a confirmar';
    var cidade = ev.local_endereco ? '<span>' + esc(ev.local_endereco) + '</span>' : '';
    return '' +
      '<article class="ingresso">' +
        '<button class="ingresso__arte js-ver-arte" type="button" data-src="' + esc(arte) + '" aria-label="Ver arte do show em tela cheia">' +
          '<img src="' + esc(arte) + '" alt="Arte do show ' + esc(ev.nome) + '" loading="eager" onerror="this.onerror=null;this.src=\'' + ARTE_PADRAO + '\'">' +
        '</button>' +
        '<div class="ingresso__corpo">' +
          '<span class="ingresso__selo"><i></i>' + esc(rotuloProximidade(ev.data)) + '</span>' +
          '<h3 class="ingresso__nome">' + esc(ev.nome || 'Baile do Ted') + '</h3>' +
          '<p class="ingresso__info"><strong>' + local + '</strong>' + cidade + '</p>' +
          '<div class="ingresso__acoes">' + botaoPrincipal(ev) + botoesSociais(ev) + '</div>' +
        '</div>' +
        '<div class="ingresso__canhoto" aria-label="Data do show">' +
          (d ? '<span class="canhoto__semana">' + SEMANA[d.getDay()] + '</span>' +
               '<span class="canhoto__dia">' + String(d.getDate()).padStart(2, '0') + '</span>' +
               '<span class="canhoto__mes">' + MESES[d.getMonth()] + ' ' + d.getFullYear() + '</span>' : '<span class="canhoto__mes">Data em breve</span>') +
          (ev.horario ? '<span class="canhoto__hora">' + esc(ev.horario) + '</span>' : '') +
        '</div>' +
      '</article>';
  }

  function htmlCard(ev) {
    var d = dataLocal(ev.data);
    var arte = imagemSegura(ev.imagem_url);
    return '' +
      '<article class="show">' +
        '<button class="show__arte js-ver-arte" type="button" data-src="' + esc(arte) + '" aria-label="Ver arte do show em tela cheia">' +
          '<img src="' + esc(arte) + '" alt="Arte do show ' + esc(ev.nome) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + ARTE_PADRAO + '\'">' +
          (d ? '<span class="show__data"><small>' + SEMANA[d.getDay()] + '</small><b>' + String(d.getDate()).padStart(2, '0') + '</b><small>' + MESES[d.getMonth()] + '</small></span>' : '') +
        '</button>' +
        '<div class="show__corpo">' +
          '<h3 class="show__nome">' + esc(ev.nome || 'Baile do Ted') + '</h3>' +
          '<p class="show__local"><strong>' + esc(ev.local_nome || 'Local a confirmar') + '</strong>' +
            esc(ev.local_endereco || '') + (ev.horario ? ' · ' + esc(ev.horario) : '') + '</p>' +
          '<div class="show__acoes">' + botaoPrincipal(ev) + botoesSociais(ev) + '</div>' +
        '</div>' +
      '</article>';
  }

  function htmlVazio(titulo, texto) {
    return '' +
      '<div class="agenda-vazia">' +
        '<img src="img/site/ted-mascote.webp" alt="" width="120" height="148" loading="lazy">' +
        '<div><h3>' + titulo + '</h3><p>' + texto + '</p>' +
        '<a class="botao botao--vermelho" href="' + esc(linkWhats(WHATS_AGENDA, 'Olá! Quero consultar a agenda do Baile do Ted.')) + '" target="_blank" rel="noopener">Consultar datas no WhatsApp</a></div>' +
      '</div>';
  }

  async function carregarAgenda() {
    var destaque = document.getElementById('agenda-destaque');
    var lista = document.getElementById('agenda-lista');
    if (!destaque || !lista) return;
    try {
      var sb = await window.tedSupabase();
      var r = await sb.from('eventos')
        .select('id,nome,data,horario,local_nome,local_endereco,local_contato,instagram,link_ingresso,imagem_url')
        .eq('publicado', true)
        .gte('data', hojeISO())
        .order('data', { ascending: true })
        .limit(40);
      if (r.error) throw r.error;
      var eventos = r.data || [];
      if (!eventos.length) {
        destaque.innerHTML = htmlVazio('Sua data pode ser a próxima', 'Ainda não tem show público confirmado por aqui. Chama no WhatsApp pra consultar disponibilidade e fechar a agenda do teu evento.');
        lista.innerHTML = '';
        return;
      }
      destaque.innerHTML = htmlDestaque(eventos[0]);
      lista.innerHTML = eventos.slice(1).map(htmlCard).join('');
      var mais = document.getElementById('agenda-mais');
      if (mais) {
        mais.hidden = eventos.length < 2;
        document.getElementById('agenda-mais-qtd').textContent = '(' + (eventos.length - 1) + ')';
      }
    } catch (erro) {
      console.warn('[agenda]', erro && erro.message ? erro.message : erro);
      destaque.innerHTML = htmlVazio('Agenda fechando os detalhes', 'Não conseguimos carregar os shows agora. Chama no WhatsApp que a gente te passa as próximas datas.');
      lista.innerHTML = '';
    }
  }

  /* ---------- FOTOS DO TOPO / MEIO e PRINTS ---------- */
  async function carregarMidias() {
    try {
      var sb = await window.tedSupabase();
      var r = await sb.from('configuracoes').select('valor').eq('chave', 'site_midias').maybeSingle();
      if (r.error || !r.data || !r.data.valor) return;
      var v = r.data.valor;
      if (v.topo_url && /^https:\/\//i.test(v.topo_url)) {
        var palco = document.querySelector('.palco');
        var img = new Image();
        img.onload = function () {
          palco.style.setProperty('--foto-palco', 'url("' + v.topo_url.replace(/["\\]/g, '') + '")');
        };
        img.src = v.topo_url;
      }
      if (v.meio_url && /^https:\/\//i.test(v.meio_url)) {
        var meio = document.getElementById('foto-meio');
        if (meio) meio.src = v.meio_url;
      }
    } catch (e) { /* mantém as fotos padrão */ }
  }

  async function carregarPrints() {
    var trilho = document.getElementById('prints-trilho');
    if (!trilho) return;
    try {
      var sb = await window.tedSupabase();
      var r = await sb.from('depoimentos').select('imagem_url,ordem,criado_em')
        .order('ordem', { ascending: true })
        .order('criado_em', { ascending: false });
      if (r.error || !r.data || !r.data.length) return;
      var validos = r.data.filter(function (d) { return /^https:\/\//i.test(d.imagem_url || ''); });
      if (!validos.length) return;
      trilho.innerHTML = validos.map(function (d) {
        return '<figure class="print"><img class="js-arte" src="' + esc(d.imagem_url) + '" alt="Comentário sobre o Baile do Ted" loading="lazy"></figure>';
      }).join('');
      atualizarSetas();
    } catch (e) { /* mantém os prints padrão */ }
  }

  /* ---------- carrossel de prints ---------- */
  var trilhoPrints, setaEsq, setaDir;
  function atualizarSetas() {
    if (!trilhoPrints) return;
    var max = trilhoPrints.scrollWidth - trilhoPrints.clientWidth - 4;
    setaEsq.disabled = trilhoPrints.scrollLeft <= 4;
    setaDir.disabled = trilhoPrints.scrollLeft >= max;
  }
  function iniciarPrints() {
    trilhoPrints = document.getElementById('prints-trilho');
    setaEsq = document.querySelector('.prints__seta--esq');
    setaDir = document.querySelector('.prints__seta--dir');
    if (!trilhoPrints || !setaEsq || !setaDir) return;
    var passo = function () { return trilhoPrints.clientWidth * 0.8; };
    setaEsq.addEventListener('click', function () { trilhoPrints.scrollBy({ left: -passo(), behavior: 'smooth' }); });
    setaDir.addEventListener('click', function () { trilhoPrints.scrollBy({ left: passo(), behavior: 'smooth' }); });
    trilhoPrints.addEventListener('scroll', atualizarSetas, { passive: true });
    window.addEventListener('resize', atualizarSetas);
    atualizarSetas();
  }

  /* ---------- visor de arte (tela cheia) ---------- */
  function iniciarVisor() {
    var visor = document.getElementById('visor');
    if (!visor) return;
    var img = visor.querySelector('.visor__img');
    var fechar = visor.querySelector('.visor__fechar');
    var ultimoFoco = null;
    var viaHistorico = false;

    function abrir(src, alt) {
      if (!src) return;
      ultimoFoco = document.activeElement;
      img.src = src;
      img.alt = alt || 'Arte do Baile do Ted';
      visor.hidden = false;
      document.body.classList.add('visor-aberto');
      fechar.focus();
      try { history.pushState({ visorTed: true }, ''); viaHistorico = true; } catch (e) { viaHistorico = false; }
    }
    function esconder() {
      visor.hidden = true;
      img.removeAttribute('src');
      document.body.classList.remove('visor-aberto');
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    }
    function fecharVisor() {
      if (visor.hidden) return;
      if (viaHistorico && history.state && history.state.visorTed) { history.back(); }
      else esconder();
    }

    document.addEventListener('click', function (e) {
      var botao = e.target.closest('.js-ver-arte');
      if (botao) { e.preventDefault(); var i = botao.querySelector('img'); abrir(botao.dataset.src || (i && i.src), i && i.alt); return; }
      var arte = e.target.closest('img.js-arte');
      if (arte) { e.preventDefault(); abrir(arte.currentSrc || arte.src, arte.alt); return; }
      if (e.target === visor) fecharVisor();
    });
    fechar.addEventListener('click', fecharVisor);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharVisor(); });
    window.addEventListener('popstate', function () { if (!visor.hidden) { viaHistorico = false; esconder(); } });
  }

  /* ---------- menu do celular ---------- */
  function iniciarMenu() {
    var botao = document.querySelector('.topo__menu');
    var menu = document.getElementById('menu');
    if (!botao || !menu) return;
    function definir(aberto) {
      menu.classList.toggle('aberto', aberto);
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    }
    botao.addEventListener('click', function () { definir(!menu.classList.contains('aberto')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) definir(false); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = new Date().getFullYear();
    iniciarMenu();
    iniciarVisor();
    iniciarPrints();
    carregarAgenda();
    carregarMidias();
    carregarPrints();
  });
})();
