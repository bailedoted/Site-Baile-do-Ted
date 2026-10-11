/* =====================================================================
   PAINEL DO TED — lógica do admin (Supabase)
   Login de verdade, shows com arte, fotos do site, textos e contratos.
   ===================================================================== */
(function () {
  'use strict';

  var BUCKET = 'midias';
  var ARTE_PADRAO = 'img/site/arte-padrao.jpg';
  var FOTO_PADRAO = { topo: 'img/site/palco.jpg', meio: 'img/site/meio.jpg' };
  var TAMANHO_MAX = 25 * 1024 * 1024;
  var TEMPO_ENVIO = 60000;
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  var sb = null;
  var eventos = [];
  var filtro = 'proximos';
  var arteNova = null;      // File escolhido agora
  var arteAtual = null;     // { url, path } do show em edição
  var removerArte = false;
  var midias = {};
  var prints = [];
  var textos = {};
  var contratos = [];

  /* ---------- utilitários ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function hojeISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dataBonita(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return 'Sem data';
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return SEMANA[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
  }
  function srcImagem(url) {
    var u = String(url || '').trim();
    return (/^https:\/\//i.test(u) || /^img\//i.test(u)) ? u : ARTE_PADRAO;
  }
  function toast(msg, tipo) {
    var box = $('avisos');
    var el = document.createElement('div');
    el.className = 'toast' + (tipo === 'erro' ? ' toast--erro' : '');
    el.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, tipo === 'erro' ? 7000 : 3500);
  }
  function comTempo(promessa, ms, codigo) {
    var timer;
    return Promise.race([
      promessa,
      new Promise(function (_, rej) { timer = setTimeout(function () { var e = new Error(codigo || 'TEMPO_ESGOTADO'); e.code = codigo || 'TEMPO_ESGOTADO'; rej(e); }, ms); })
    ]).finally(function () { clearTimeout(timer); });
  }
  function mensagemErro(e, padrao) {
    var m = (e && (e.message || e.error_description || e.code)) || '';
    if (/TEMPO_ESGOTADO|timeout/i.test(m)) return 'O envio demorou demais. Confira a internet e tente de novo.';
    if (/row-level security|permission|not authorized|unauthorized|403/i.test(m)) return 'Sem permissão: confira se seu e-mail está na lista de admins do Supabase.';
    if (/mime|not supported|invalid.*type/i.test(m)) return 'Formato de imagem não aceito. Use JPG, PNG ou WEBP.';
    if (/payload too large|exceeded|too large|413/i.test(m)) return 'Imagem grande demais. Tente uma menor.';
    if (/Failed to fetch|NetworkError|network/i.test(m)) return 'Sem conexão com o servidor. Confira a internet.';
    if (/JWT|expired|session/i.test(m)) return 'Sua sessão expirou. Saia e entre de novo.';
    return padrao || 'Algo deu errado. Tente de novo.';
  }
  function trocarTela(nome) {
    ['tela-login', 'tela-aviso', 'tela-painel', 'tela-carregando'].forEach(function (id) { $(id).hidden = id !== nome; });
  }

  /* ---------- imagens: reduzir e enviar ---------- */
  function decodificar(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file).catch(function () { return viaTagImg(file); });
    }
    return viaTagImg(file);
  }
  function viaTagImg(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve(img); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('NAO_DECODIFICOU')); };
      img.src = url;
    });
  }
  async function reduzir(file, larguraMax, qualidade) {
    var fonte;
    try { fonte = await decodificar(file); } catch (e) { fonte = null; }
    if (!fonte) {
      if (/^image\/(jpeg|png|webp)$/i.test(file.type) && file.size <= 10 * 1024 * 1024) return file;
      var err = new Error('FORMATO'); err.code = 'FORMATO'; throw err;
    }
    var w = fonte.width || fonte.naturalWidth, h = fonte.height || fonte.naturalHeight;
    if (w > larguraMax) { h = Math.round(h * larguraMax / w); w = larguraMax; }
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(fonte, 0, 0, w, h);
    if (fonte.close) fonte.close();
    var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/jpeg', qualidade); });
    if (!blob) throw new Error('FORMATO');
    return blob;
  }
  async function enviarImagem(file, pasta, larguraMax, qualidade) {
    if (!file) throw new Error('Nenhum arquivo');
    if (file.size > TAMANHO_MAX) { var e = new Error('GRANDE'); e.code = 'GRANDE'; throw e; }
    var blob = await reduzir(file, larguraMax || 1080, qualidade || 0.85);
    var ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    var caminho = pasta + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    var r = await comTempo(sb.storage.from(BUCKET).upload(caminho, blob, {
      contentType: blob.type || 'image/jpeg', cacheControl: '31536000', upsert: false
    }), TEMPO_ENVIO);
    if (r.error) throw r.error;
    var pub = sb.storage.from(BUCKET).getPublicUrl(caminho);
    return { url: pub.data.publicUrl, path: caminho };
  }
  function apagarArquivo(path) {
    if (!path) return Promise.resolve();
    return sb.storage.from(BUCKET).remove([path]).then(function (r) {
      if (r && r.error) console.warn('[storage] não apagou', path, r.error.message);
    }).catch(function (e) { console.warn('[storage] não apagou', path, e); });
  }
  function erroImagem(e) {
    if (e && e.code === 'GRANDE') return 'Essa imagem passa de 25 MB. Escolha uma menor.';
    if (e && e.code === 'FORMATO') return 'Não consegui abrir essa imagem. Se for foto de iPhone (HEIC), tire um print dela ou salve como JPG.';
    return mensagemErro(e, 'Não foi possível enviar a imagem.');
  }

  /* =================== LOGIN =================== */
  async function iniciar() {
    trocarTela('tela-carregando');
    try {
      sb = await window.tedSupabase();
    } catch (e) {
      $('aviso-titulo').textContent = e && e.code === 'CONFIG_PENDENTE' ? 'Falta configurar' : 'Sem conexão';
      $('aviso-texto').textContent = e && e.code === 'CONFIG_PENDENTE'
        ? 'Cole a Project URL e a chave anon do Supabase no arquivo js/supabase-config.js e suba no GitHub.'
        : 'Não foi possível carregar o Supabase. Confira a internet e recarregue a página.';
      $('btn-sair-aviso').textContent = 'Tentar de novo';
      $('btn-sair-aviso').onclick = function () { location.reload(); };
      trocarTela('tela-aviso');
      return;
    }
    sb.auth.onAuthStateChange(function (evento) {
      if (evento === 'PASSWORD_RECOVERY') definirNovaSenha();
      if (evento === 'SIGNED_OUT') trocarTela('tela-login');
    });
    var s = await sb.auth.getSession();
    if (s.data && s.data.session) await entrarNoPainel(s.data.session);
    else trocarTela('tela-login');
  }

  async function entrarNoPainel(sessao) {
    trocarTela('tela-carregando');
    var r = await sb.rpc('is_admin');
    if (r.error || r.data !== true) {
      $('aviso-titulo').textContent = 'Sem permissão';
      $('aviso-texto').textContent = 'O e-mail ' + ((sessao && sessao.user && sessao.user.email) || '') + ' entrou, mas não está liberado como admin. Adicione ele na tabela "admins" do Supabase.';
      $('btn-sair-aviso').textContent = 'Sair';
      $('btn-sair-aviso').onclick = sair;
      trocarTela('tela-aviso');
      return;
    }
    trocarTela('tela-painel');
    carregarEventos();
    carregarMidias();
    carregarPrints();
    carregarTextos();
    carregarContratos();
    carregarTabelaOrc();
    atualizarValoresAutomaticos();
  }

  async function sair() {
    try { await sb.auth.signOut(); } catch (e) { /* ignora */ }
    trocarTela('tela-login');
  }

  async function definirNovaSenha() {
    var nova = window.prompt('Digite a nova senha do painel (mínimo 8 caracteres):');
    if (!nova) return;
    if (nova.length < 8) { toast('A senha precisa ter pelo menos 8 caracteres.', 'erro'); return; }
    var r = await sb.auth.updateUser({ password: nova });
    if (r.error) toast(mensagemErro(r.error, 'Não foi possível trocar a senha.'), 'erro');
    else toast('Senha trocada!');
  }

  function ligarLogin() {
    $('form-login').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = $('btn-login');
      var erro = $('login-erro');
      erro.hidden = true;
      btn.disabled = true; btn.textContent = 'Entrando…';
      try {
        var r = await sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-senha').value });
        if (r.error) {
          var m = r.error.message || '';
          erro.textContent = /invalid login/i.test(m) ? 'E-mail ou senha incorretos.'
            : /not confirmed/i.test(m) ? 'Esse e-mail ainda não foi confirmado no Supabase.'
            : mensagemErro(r.error, 'Não foi possível entrar.');
          erro.hidden = false;
          return;
        }
        $('login-senha').value = '';
        await entrarNoPainel(r.data.session);
      } catch (ex) {
        erro.textContent = mensagemErro(ex, 'Não foi possível entrar.');
        erro.hidden = false;
      } finally {
        btn.disabled = false; btn.textContent = 'Entrar';
      }
    });
    $('btn-esqueci').addEventListener('click', async function () {
      var email = $('login-email').value.trim();
      if (!email) { $('login-erro').textContent = 'Digite seu e-mail acima primeiro.'; $('login-erro').hidden = false; return; }
      var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
      if (r.error) toast(mensagemErro(r.error), 'erro');
      else toast('Se o e-mail estiver cadastrado, chega um link pra criar nova senha.');
    });
    $('btn-sair').addEventListener('click', sair);
  }

  /* =================== ABAS =================== */
  function abrirAba(nome) {
    document.querySelectorAll('.aba').forEach(function (a) { a.setAttribute('aria-selected', a.dataset.aba === nome ? 'true' : 'false'); });
    document.querySelectorAll('.painel-aba').forEach(function (p) { p.hidden = p.id !== 'aba-' + nome; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function ligarAbas() {
    document.querySelectorAll('.aba').forEach(function (aba) {
      aba.addEventListener('click', function () { abrirAba(aba.dataset.aba); });
    });
  }

  /* =================== SHOWS =================== */
  async function carregarEventos() {
    var lista = $('lista-eventos');
    lista.innerHTML = '<p class="vazio"><span class="girando"></span></p>';
    var r = await sb.from('eventos').select('*').order('data', { ascending: true });
    if (r.error) { lista.innerHTML = '<p class="vazio">Não foi possível carregar a agenda. ' + esc(mensagemErro(r.error)) + '</p>'; return; }
    eventos = r.data || [];
    renderEventos();
  }

  function renderEventos() {
    var hoje = hojeISO();
    var itens = eventos.filter(function (ev) {
      if (filtro === 'proximos') return ev.data >= hoje;
      if (filtro === 'passados') return ev.data < hoje;
      return true;
    });
    if (filtro === 'passados') itens = itens.slice().reverse();
    var lista = $('lista-eventos');
    if (!itens.length) {
      lista.innerHTML = '<p class="vazio">' + (filtro === 'passados' ? 'Nenhum show passado.' : 'Nenhum show na agenda. Cadastre o primeiro ao lado.') + '</p>';
      return;
    }
    var editId = $('evento-id').value;
    lista.innerHTML = itens.map(function (ev) {
      var passou = ev.data < hoje;
      var selos = '';
      if (ev.data === hoje) selos += '<span class="selo selo--hoje">Hoje</span>';
      if (passou) selos += '<span class="selo selo--passou">Passou</span>';
      if (!ev.publicado) selos += '<span class="selo selo--rascunho">Rascunho</span>';
      if (!ev.imagem_url) selos += '<span class="selo">Arte padrão</span>';
      var meta = [dataBonita(ev.data), ev.horario, ev.local_nome, ev.local_endereco].filter(Boolean).map(esc).join(' · ');
      return '<article class="item-evento' + (passou ? ' passou' : '') + (editId === ev.id ? ' editando' : '') + '">' +
        '<div class="item-evento__arte"><img src="' + esc(srcImagem(ev.imagem_url)) + '" alt="" loading="lazy"></div>' +
        '<div class="item-evento__info"><span class="item-evento__nome">' + esc(ev.nome) + '</span>' +
        '<span class="item-evento__meta">' + meta + '</span>' +
        (selos ? '<span class="item-evento__selos">' + selos + '</span>' : '') + '</div>' +
        '<div class="item-evento__acoes">' +
          '<button class="btn btn--contorno btn--pequeno" type="button" data-editar="' + esc(ev.id) + '">Editar</button>' +
          '<button class="btn btn--perigo btn--pequeno" type="button" data-excluir="' + esc(ev.id) + '">Excluir</button>' +
        '</div></article>';
    }).join('');
  }

  function mostrarArte(src, selo, nova) {
    $('arte-img').src = src || ARTE_PADRAO;
    $('arte-selo').textContent = selo;
    $('arte-selo').classList.toggle('arte__selo--nova', !!nova);
    $('btn-remover-arte').hidden = !(nova || (arteAtual && arteAtual.url && !removerArte));
  }

  function limparFormEvento() {
    $('form-evento').reset();
    $('evento-id').value = '';
    $('ev-publicado').checked = true;
    arteNova = null; arteAtual = null; removerArte = false;
    $('arte-arquivo').value = '';
    mostrarArte(ARTE_PADRAO, 'Arte padrão', false);
    $('form-evento-titulo').textContent = 'Novo show';
    $('btn-salvar-evento').textContent = 'Cadastrar show';
    $('btn-cancelar').hidden = true;
    renderEventos();
  }

  function editarEvento(id) {
    var ev = eventos.find(function (e) { return e.id === id; });
    if (!ev) return;
    $('evento-id').value = ev.id;
    $('ev-nome').value = ev.nome || '';
    $('ev-data').value = ev.data || '';
    $('ev-horario').value = ev.horario || '';
    $('ev-local').value = ev.local_nome || '';
    $('ev-endereco').value = ev.local_endereco || '';
    $('ev-contato').value = ev.local_contato || '';
    $('ev-instagram').value = ev.instagram || '';
    $('ev-ingresso').value = ev.link_ingresso || '';
    $('ev-publicado').checked = ev.publicado !== false;
    arteNova = null; removerArte = false;
    $('arte-arquivo').value = '';
    arteAtual = { url: ev.imagem_url || '', path: ev.imagem_path || '' };
    if (ev.imagem_url) mostrarArte(srcImagem(ev.imagem_url), 'Arte atual', false);
    else mostrarArte(ARTE_PADRAO, 'Arte padrão', false);
    $('form-evento-titulo').textContent = 'Editando show';
    $('btn-salvar-evento').textContent = 'Salvar alterações';
    $('btn-cancelar').hidden = false;
    renderEventos();
    $('form-evento').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('ev-nome').focus({ preventScroll: true });
  }

  async function excluirEvento(id) {
    var ev = eventos.find(function (e) { return e.id === id; });
    if (!ev) return;
    if (!window.confirm('Excluir o show "' + ev.nome + '" (' + dataBonita(ev.data) + ')?\nA arte enviada também será apagada.')) return;
    var r = await sb.from('eventos').delete().eq('id', id);
    if (r.error) { toast(mensagemErro(r.error, 'Não foi possível excluir.'), 'erro'); return; }
    await apagarArquivo(ev.imagem_path);
    if ($('evento-id').value === id) limparFormEvento();
    toast('Show excluído.');
    carregarEventos();
  }

  async function salvarEvento(e) {
    e.preventDefault();
    var nome = $('ev-nome').value.trim();
    var data = $('ev-data').value;
    if (!nome || !data) { toast('Preencha pelo menos o nome e a data do show.', 'erro'); (nome ? $('ev-data') : $('ev-nome')).focus(); return; }
    var link = $('ev-ingresso').value.trim();
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link.replace(/^\/+/, '');

    var id = $('evento-id').value;
    var btn = $('btn-salvar-evento');
    var textoBtn = btn.textContent;
    btn.disabled = true;
    var enviado = null;
    try {
      var dados = {
        nome: nome,
        data: data,
        horario: $('ev-horario').value.trim() || null,
        local_nome: $('ev-local').value.trim() || null,
        local_endereco: $('ev-endereco').value.trim() || null,
        local_contato: $('ev-contato').value.trim() || null,
        instagram: $('ev-instagram').value.trim() || null,
        link_ingresso: link || null,
        publicado: $('ev-publicado').checked,
        atualizado_em: new Date().toISOString()
      };
      if (arteNova) {
        btn.textContent = 'Enviando arte…';
        enviado = await enviarImagem(arteNova, 'eventos', 1080, 0.85);
        dados.imagem_url = enviado.url;
        dados.imagem_path = enviado.path;
      } else if (removerArte) {
        dados.imagem_url = null;
        dados.imagem_path = null;
      }
      btn.textContent = 'Salvando…';
      var r = id ? await sb.from('eventos').update(dados).eq('id', id)
                 : await sb.from('eventos').insert(dados);
      if (r.error) throw r.error;
      if (id && arteAtual && arteAtual.path && (enviado || removerArte)) await apagarArquivo(arteAtual.path);
      toast(id ? 'Show atualizado!' : 'Show cadastrado!');
      limparFormEvento();
      carregarEventos();
    } catch (err) {
      if (enviado) apagarArquivo(enviado.path); // não deixa arquivo órfão
      toast(err && (err.code === 'GRANDE' || err.code === 'FORMATO') ? erroImagem(err) : mensagemErro(err, 'Não foi possível salvar o show.'), 'erro');
    } finally {
      btn.disabled = false;
      btn.textContent = textoBtn;
    }
  }

  function ligarShows() {
    $('form-evento').addEventListener('submit', salvarEvento);
    $('btn-cancelar').addEventListener('click', limparFormEvento);
    $('arte-arquivo').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      if (!/^image\//i.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) { toast('Escolha um arquivo de imagem.', 'erro'); e.target.value = ''; return; }
      if (f.size > TAMANHO_MAX) { toast('Essa imagem passa de 25 MB. Escolha uma menor.', 'erro'); e.target.value = ''; return; }
      arteNova = f; removerArte = false;
      mostrarArte(URL.createObjectURL(f), 'Nova arte', true);
    });
    $('btn-remover-arte').addEventListener('click', function () {
      arteNova = null;
      $('arte-arquivo').value = '';
      if (arteAtual && arteAtual.url) removerArte = true;
      mostrarArte(ARTE_PADRAO, 'Arte padrão', false);
    });
    var zona = $('soltar-arte');
    ['dragenter', 'dragover'].forEach(function (t) { zona.addEventListener(t, function () { zona.classList.add('arrastando'); }); });
    ['dragleave', 'drop'].forEach(function (t) { zona.addEventListener(t, function () { zona.classList.remove('arrastando'); }); });
    document.querySelectorAll('.filtro').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.dataset.filtro;
        document.querySelectorAll('.filtro').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        renderEventos();
      });
    });
    $('lista-eventos').addEventListener('click', function (e) {
      var ed = e.target.closest('[data-editar]');
      if (ed) { editarEvento(ed.dataset.editar); return; }
      var ex = e.target.closest('[data-excluir]');
      if (ex) excluirEvento(ex.dataset.excluir);
    });
  }

  /* =================== ORÇAMENTO (uso interno) =================== */
  var TABELA_PADRAO = { porKm: 0.68, faixa1: 1500, faixa2: 2000, faixa3: 2500, faixa4: 3000 };
  var tabelaOrc = Object.assign({}, TABELA_PADRAO);
  var ultimoOrc = null;

  function reais(n) { return formatarMoedaNumero(Number(n) || 0); }
  function numeroDeCampo(id) { return moedaParaNumero($(id).value); }
  function numeroDecimal(id) {
    var t = String($(id).value || '').replace(/[^\d,.]/g, '');
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    return Number(t) || 0;
  }

  async function carregarTabelaOrc() {
    var r = await sb.from('configuracoes').select('valor').eq('chave', 'admin_orcamento').maybeSingle();
    if (r.data && r.data.valor) tabelaOrc = Object.assign({}, TABELA_PADRAO, r.data.valor);
    $('tab-km').value = tabelaOrc.porKm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    $('tab-f1').value = reais(tabelaOrc.faixa1);
    $('tab-f2').value = reais(tabelaOrc.faixa2);
    $('tab-f3').value = reais(tabelaOrc.faixa3);
    $('tab-f4').value = reais(tabelaOrc.faixa4);
  }

  async function salvarTabelaOrc(e) {
    e.preventDefault();
    var nova = {
      porKm: numeroDecimal('tab-km'),
      faixa1: numeroDeCampo('tab-f1'),
      faixa2: numeroDeCampo('tab-f2'),
      faixa3: numeroDeCampo('tab-f3'),
      faixa4: numeroDeCampo('tab-f4')
    };
    if (nova.porKm > 20) { toast('Valor por km parece alto demais (' + reais(nova.porKm) + '). Use vírgula, ex: 0,68.', 'erro'); return; }
    if (!nova.porKm || !nova.faixa1 || !nova.faixa2 || !nova.faixa3 || !nova.faixa4) {
      toast('Preencha todos os valores da tabela.', 'erro');
      return;
    }
    var btn = $('btn-salvar-tabela');
    btn.disabled = true;
    var r = await sb.from('configuracoes').upsert({ chave: 'admin_orcamento', valor: nova, atualizado_em: new Date().toISOString() }, { onConflict: 'chave' });
    btn.disabled = false;
    if (r.error) { toast(mensagemErro(r.error, 'Não foi possível salvar a tabela.'), 'erro'); return; }
    tabelaOrc = nova;
    carregarTabelaOrc();
    toast('Tabela salva! Os próximos cálculos já usam esses valores.');
  }

  function faixaDe(kmIdaVolta) {
    if (kmIdaVolta <= 200) return { valor: tabelaOrc.faixa1, nome: 'até 200 km' };
    if (kmIdaVolta <= 300) return { valor: tabelaOrc.faixa2, nome: '201 a 300 km' };
    if (kmIdaVolta <= 500) return { valor: tabelaOrc.faixa3, nome: '301 a 500 km' };
    return { valor: tabelaOrc.faixa4, nome: 'acima de 500 km' };
  }

  function montarMensagemOrc(o) {
    var data = o.data ? o.data.split('-').reverse().join('/') : '';
    return 'Olá' + (o.nome ? ', ' + o.nome.split(' ')[0] : '') + '! Segue a estimativa do *Baile do Ted*:\n\n' +
      (o.tipo ? '*Evento:* ' + o.tipo + '\n' : '') +
      '*Cidade:* ' + o.cidade + '\n' +
      (data ? '*Data:* ' + data + '\n' : '') +
      '*Valor:* ' + reais(o.total) + '\n\n' +
      'Hospedagem e alimentação da equipe não estão inclusas. O valor final pode variar conforme a data e a estrutura do evento.\n\n' +
      'Posso reservar a data pra você?';
  }

  function atualizarLinkWhatsOrc() {
    var texto = $('orc-mensagem').value;
    var num = String($('orc-whats').value || '').replace(/\D/g, '');
    if (num && num.length <= 11) num = '55' + num;
    $('btn-whats-orc').href = 'https://wa.me/' + (num || '') + '?text=' + encodeURIComponent(texto);
  }

  async function calcularOrcamentoAdmin(e) {
    e.preventDefault();
    var cidade = $('orc-cidade').value.trim();
    $('orc-erro').hidden = true;
    if (!cidade) { $('orc-erro').textContent = 'Digite a cidade e o estado do evento.'; $('orc-erro').hidden = false; $('orc-cidade').focus(); return; }
    var btn = $('btn-calcular-orc');
    btn.disabled = true; btn.textContent = 'Calculando rota…';
    try {
      var geo = await comTempo(fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(cidade)).then(function (r) { return r.json(); }), 20000);
      if (!geo || !geo.length) throw new Error("Cidade não encontrada. Digite no formato 'Cidade, UF'.");
      var rota = await comTempo(fetch('https://router.project-osrm.org/route/v1/driving/-49.2733,-25.4284;' + geo[0].lon + ',' + geo[0].lat + '?overview=false').then(function (r) { return r.json(); }), 20000);
      if (!rota || rota.code !== 'Ok') throw new Error('Não foi possível traçar uma rota de carro até essa cidade.');
      var km = (rota.routes[0].distance / 1000) * 2;
      var desloc = km * tabelaOrc.porKm;
      var faixa = faixaDe(km);
      var total = desloc + faixa.valor;
      ultimoOrc = {
        cidade: cidade, tipo: $('orc-tipo').value.trim(), data: $('orc-data').value,
        nome: $('orc-nome').value.trim(), whats: $('orc-whats').value.trim(),
        km: km, desloc: desloc, cache: faixa.valor, total: total
      };
      $('orc-total').textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      $('orc-km').textContent = Math.round(km).toLocaleString('pt-BR') + ' km';
      $('orc-desloc-rotulo').textContent = 'Deslocamento (' + reais(tabelaOrc.porKm) + '/km)';
      $('orc-desloc').textContent = reais(desloc);
      $('orc-cache-rotulo').textContent = 'Cachê da faixa (' + faixa.nome + ')';
      $('orc-cache').textContent = reais(faixa.valor);
      $('orc-mensagem').value = montarMensagemOrc(ultimoOrc);
      atualizarLinkWhatsOrc();
      $('orc-vazio').hidden = true;
      $('orc-resultado').hidden = false;
    } catch (err) {
      var m = err && err.message ? err.message : '';
      $('orc-erro').textContent = /TEMPO|fetch|network/i.test(m) || !m ? 'Não deu pra calcular agora. Confira a internet e tente de novo.' : m;
      $('orc-erro').hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Calcular';
    }
  }

  function levarOrcParaContrato() {
    if (!ultimoOrc) return;
    $('contratoValorTotal').value = reais(ultimoOrc.total);
    if (ultimoOrc.nome && !$('clienteNome').value.trim()) $('clienteNome').value = ultimoOrc.nome;
    if (ultimoOrc.whats && !$('clienteTelefone').value.trim()) $('clienteTelefone').value = ultimoOrc.whats;
    if (ultimoOrc.tipo && !$('contratoEventoNome').value.trim()) $('contratoEventoNome').value = ultimoOrc.tipo;
    if (ultimoOrc.data && !$('contratoEventoData').value) $('contratoEventoData').value = ultimoOrc.data;
    if (!$('contratoEventoLocal').value.trim()) $('contratoEventoLocal').value = ultimoOrc.cidade;
    atualizarValoresAutomaticos();
    abrirAba('contratos');
    toast('Valor e dados levados pro contrato. Complete o que faltar.');
  }

  function ligarOrcamento() {
    $('form-orcamento').addEventListener('submit', calcularOrcamentoAdmin);
    $('form-tabela-orc').addEventListener('submit', salvarTabelaOrc);
    $('orc-mensagem').addEventListener('input', atualizarLinkWhatsOrc);
    $('orc-whats').addEventListener('input', function () { if (ultimoOrc) atualizarLinkWhatsOrc(); });
    $('btn-copiar-orc').addEventListener('click', async function () {
      var texto = $('orc-mensagem').value;
      try { await navigator.clipboard.writeText(texto); }
      catch (e) {
        var t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (x) { /* nada */ }
        t.remove();
      }
      toast('Mensagem copiada!');
    });
    $('btn-orc-contrato').addEventListener('click', levarOrcParaContrato);
    ['tab-f1', 'tab-f2', 'tab-f3', 'tab-f4'].forEach(function (id) {
      $(id).addEventListener('blur', function () { var v = moedaParaNumero(this.value); this.value = v ? reais(v) : ''; });
    });
  }

  /* =================== FOTOS DO SITE =================== */
  async function carregarMidias() {
    var r = await sb.from('configuracoes').select('valor').eq('chave', 'site_midias').maybeSingle();
    midias = (r.data && r.data.valor) || {};
    $('foto-topo').src = midias.topo_url || FOTO_PADRAO.topo;
    $('foto-meio').src = midias.meio_url || FOTO_PADRAO.meio;
  }
  async function salvarMidias(novo) {
    var r = await sb.from('configuracoes').upsert({ chave: 'site_midias', valor: novo, atualizado_em: new Date().toISOString() }, { onConflict: 'chave' });
    if (r.error) throw r.error;
    midias = novo;
  }
  async function trocarFoto(slot, file) {
    var caixa = $('foto-' + slot).parentElement;
    caixa.classList.add('enviando');
    var enviado = null;
    try {
      enviado = await enviarImagem(file, 'site', slot === 'topo' ? 1920 : 1080, 0.82);
      var antigo = midias[slot + '_path'];
      var novo = Object.assign({}, midias);
      novo[slot + '_url'] = enviado.url;
      novo[slot + '_path'] = enviado.path;
      await salvarMidias(novo);
      await apagarArquivo(antigo);
      $('foto-' + slot).src = enviado.url;
      toast('Foto trocada! Já está no site.');
    } catch (e) {
      if (enviado) apagarArquivo(enviado.path);
      toast(erroImagem(e), 'erro');
    } finally {
      caixa.classList.remove('enviando');
    }
  }
  async function fotoPadrao(slot) {
    if (!midias[slot + '_url']) { toast('Essa foto já é a padrão.'); return; }
    if (!window.confirm('Voltar para a foto padrão?')) return;
    try {
      var antigo = midias[slot + '_path'];
      var novo = Object.assign({}, midias);
      novo[slot + '_url'] = null;
      novo[slot + '_path'] = null;
      await salvarMidias(novo);
      await apagarArquivo(antigo);
      $('foto-' + slot).src = FOTO_PADRAO[slot];
      toast('Foto padrão de volta.');
    } catch (e) { toast(mensagemErro(e), 'erro'); }
  }

  async function carregarPrints() {
    var r = await sb.from('depoimentos').select('*').order('ordem', { ascending: true }).order('criado_em', { ascending: false });
    prints = r.data || [];
    var box = $('lista-prints');
    $('prints-dica').innerHTML = prints.length
      ? 'Prints de WhatsApp e Instagram com elogios. Aparecem na seção “O que a galera fala”, nessa ordem.'
      : 'Nenhum print enviado ainda — o site está mostrando os <strong>10 prints padrão</strong>. Quando você adicionar o primeiro, só os seus aparecem.';
    box.innerHTML = prints.map(function (p) {
      return '<figure class="print-item"><img src="' + esc(srcImagem(p.imagem_url)) + '" alt="Print de comentário" loading="lazy">' +
        '<button type="button" data-apagar-print="' + esc(p.id) + '" aria-label="Apagar este print">×</button></figure>';
    }).join('');
  }
  async function adicionarPrints(files) {
    var lista = Array.prototype.slice.call(files || []);
    if (!lista.length) return;
    var ordem = prints.reduce(function (m, p) { return Math.max(m, p.ordem || 0); }, 0);
    var ok = 0;
    toast('Enviando ' + lista.length + ' print(s)…');
    for (var i = 0; i < lista.length; i++) {
      var enviado = null;
      try {
        enviado = await enviarImagem(lista[i], 'prints', 900, 0.82);
        ordem += 1;
        var r = await sb.from('depoimentos').insert({ imagem_url: enviado.url, imagem_path: enviado.path, ordem: ordem });
        if (r.error) throw r.error;
        ok++;
      } catch (e) {
        if (enviado) apagarArquivo(enviado.path);
        toast(lista[i].name + ': ' + erroImagem(e), 'erro');
      }
    }
    if (ok) toast(ok + ' print(s) adicionado(s)!');
    carregarPrints();
  }
  async function apagarPrint(id) {
    var p = prints.find(function (x) { return x.id === id; });
    if (!p || !window.confirm('Apagar este print do site?')) return;
    var r = await sb.from('depoimentos').delete().eq('id', id);
    if (r.error) { toast(mensagemErro(r.error), 'erro'); return; }
    await apagarArquivo(p.imagem_path);
    toast('Print apagado.');
    carregarPrints();
  }

  function ligarFotos() {
    document.querySelectorAll('input[data-slot]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        inp.value = '';
        if (f) trocarFoto(inp.dataset.slot, f);
      });
    });
    document.querySelectorAll('[data-padrao]').forEach(function (b) {
      b.addEventListener('click', function () { fotoPadrao(b.dataset.padrao); });
    });
    $('prints-arquivo').addEventListener('change', function (e) {
      var files = e.target.files;
      adicionarPrints(files).finally(function () { e.target.value = ''; });
    });
    $('lista-prints').addEventListener('click', function (e) {
      var b = e.target.closest('[data-apagar-print]');
      if (b) apagarPrint(b.dataset.apagarPrint);
    });
  }

  /* =================== TEXTOS RÁPIDOS =================== */
  async function carregarTextos() {
    var r = await sb.from('configuracoes').select('valor').eq('chave', 'admin_textos').maybeSingle();
    textos = (r.data && r.data.valor) || {};
    $('textoOrcamento').value = textos.orcamento || '';
    $('textoInfos').value = textos.infos || '';
    $('valorGasolinaBase').value = textos.valorGasolinaBase || '';
  }
  async function salvarTextos() {
    var btn = $('btn-salvar-textos');
    btn.disabled = true;
    var gas = moedaParaNumero($('valorGasolinaBase').value);
    $('valorGasolinaBase').value = gas ? formatarMoedaNumero(gas) : '';
    var novo = {
      orcamento: $('textoOrcamento').value,
      infos: $('textoInfos').value,
      valorGasolinaBase: $('valorGasolinaBase').value
    };
    var r = await sb.from('configuracoes').upsert({ chave: 'admin_textos', valor: novo, atualizado_em: new Date().toISOString() }, { onConflict: 'chave' });
    btn.disabled = false;
    if (r.error) { toast(mensagemErro(r.error, 'Não foi possível salvar.'), 'erro'); return; }
    textos = novo;
    toast('Textos salvos!');
  }
  function aplicarVariaveisOrcamento(texto) {
    var gas = moedaParaNumero($('valorGasolinaBase').value);
    var valor = gas ? formatarMoedaNumero(gas) : 'NÃO INFORMADO';
    return String(texto || '')
      .split('{{valor_gasolina}}').join(valor).split('{{VALOR_GASOLINA}}').join(valor)
      .split('[valor_gasolina]').join(valor).split('[VALOR_GASOLINA]').join(valor);
  }
  async function copiar(id) {
    var bruto = $(id).value;
    var texto = id === 'textoOrcamento' ? aplicarVariaveisOrcamento(bruto) : bruto;
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      var t = document.createElement('textarea');
      t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (x) { /* nada */ }
      t.remove();
    }
    toast('Copiado! É só colar no WhatsApp.');
  }
  function ligarTextos() {
    $('btn-salvar-textos').addEventListener('click', salvarTextos);
    document.querySelectorAll('[data-copiar]').forEach(function (b) {
      b.addEventListener('click', function () { copiar(b.dataset.copiar); });
    });
    $('valorGasolinaBase').addEventListener('blur', function () {
      var v = moedaParaNumero(this.value);
      this.value = v ? formatarMoedaNumero(v) : '';
    });
  }

  /* =================== CONTRATOS =================== */
  var CAMPOS_CONTRATO = [
    'clienteNome', 'clienteCpfCnpj', 'clienteRgIe', 'clienteRepresentante', 'clienteRepresentanteCpf',
    'clienteTelefone', 'clienteEmail', 'contratoEventoNome', 'contratoCasaNome', 'contratoCasaInstagram',
    'contratoEventoData', 'contratoEventoHorario', 'contratoEventoLocal', 'contratoDuracao',
    'contratoValorTotal', 'contratoFormaPagamento', 'contratoOpcoesManuais', 'contratoObservacoes'
  ];
  var textoPreviaAtual = null; // quando abre um contrato antigo sem os campos

  function gerarPreviewContrato() {
    textoPreviaAtual = null;
    var html = textoContratoParaHtml(montarTextoContrato());
    $('previewContrato').innerHTML = '<div id="areaContratoPdf">' + html + '</div>';
  }
  function mostrarTextoPronto(texto) {
    textoPreviaAtual = texto;
    $('previewContrato').innerHTML = '<div id="areaContratoPdf">' + textoContratoParaHtml(texto) + '</div>';
  }

  async function gerarPdfContrato() {
    if (!window.html2canvas || !window.jspdf) { toast('O gerador de PDF ainda está carregando. Tente em alguns segundos.', 'erro'); return; }
    var btn = $('btn-pdf');
    btn.disabled = true; btn.textContent = 'Gerando PDF…';
    try {
      if (textoPreviaAtual == null) gerarPreviewContrato();
      var area = $('areaContratoPdf');
      var nomeCliente = $('clienteNome').value.trim() || 'cliente';
      var nomeEvento = $('contratoEventoNome').value.trim() || 'evento';
      var nomeArquivo = 'contrato-' + slugify(nomeCliente) + '-' + slugify(nomeEvento) + '.pdf';
      var canvas = await html2canvas(area, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      var imgData = canvas.toDataURL('image/png');
      var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      var margem = 10, larguraPdf = 210 - margem * 2, alturaPagina = 297 - margem * 2;
      var alturaImg = (canvas.height * larguraPdf) / canvas.width;
      var restante = alturaImg, y = margem;
      pdf.addImage(imgData, 'PNG', margem, y, larguraPdf, alturaImg);
      restante -= alturaPagina;
      while (restante > 0) {
        pdf.addPage();
        y = margem - (alturaImg - restante);
        pdf.addImage(imgData, 'PNG', margem, y, larguraPdf, alturaImg);
        restante -= alturaPagina;
      }
      pdf.save(nomeArquivo);
    } catch (e) {
      console.error(e);
      toast('Não foi possível gerar o PDF.', 'erro');
    } finally {
      btn.disabled = false; btn.textContent = 'Baixar PDF';
    }
  }

  async function salvarContrato() {
    var valorTotal = moedaParaNumero($('contratoValorTotal').value);
    var obrig = ['clienteNome', 'clienteCpfCnpj', 'contratoEventoNome', 'contratoEventoData', 'contratoEventoHorario', 'contratoEventoLocal'];
    var falta = obrig.filter(function (id) { return !$(id).value.trim(); });
    if (falta.length || !valorTotal) {
      toast('Preencha nome do cliente, CPF/CNPJ, nome do evento, data, horário, endereço e valor total.', 'erro');
      ($(falta[0] || 'contratoValorTotal')).focus();
      return;
    }
    var btn = $('btn-salvar-contrato');
    btn.disabled = true;
    var dados = obterDadosContrato();
    var form = {};
    CAMPOS_CONTRATO.forEach(function (id) { form[id] = $(id).value; });
    dados.form = form;
    var r = await sb.from('contratos').insert({
      cliente_nome: $('clienteNome').value.trim(),
      evento_nome: $('contratoEventoNome').value.trim(),
      evento_data: $('contratoEventoData').value,
      valor_total: formatarMoedaNumero(valorTotal),
      dados: dados,
      contrato_texto: montarTextoContrato()
    });
    btn.disabled = false;
    if (r.error) { toast(mensagemErro(r.error, 'Não foi possível salvar o contrato.'), 'erro'); return; }
    toast('Contrato salvo!');
    carregarContratos();
  }

  async function carregarContratos() {
    var box = $('lista-contratos');
    var r = await sb.from('contratos').select('id,cliente_nome,evento_nome,evento_data,valor_total,criado_em,dados,contrato_texto')
      .order('criado_em', { ascending: false }).limit(60);
    if (r.error) { box.innerHTML = '<p class="dica">Não foi possível carregar.</p>'; return; }
    contratos = r.data || [];
    if (!contratos.length) { box.innerHTML = '<p class="dica">Nenhum contrato salvo ainda.</p>'; return; }
    box.innerHTML = contratos.map(function (c) {
      var quando = c.evento_data && /^\d{4}-\d{2}-\d{2}$/.test(c.evento_data) ? dataBonita(c.evento_data) : (c.evento_data || '');
      return '<div class="item-contrato"><div><strong>' + esc(c.cliente_nome || 'Sem nome') + '</strong>' +
        '<small>' + esc([c.evento_nome, quando, c.valor_total].filter(Boolean).join(' · ')) + '</small></div>' +
        '<div class="item-contrato__acoes">' +
        '<button class="btn btn--contorno btn--pequeno" type="button" data-abrir-contrato="' + esc(c.id) + '">Abrir</button>' +
        '<button class="btn btn--perigo btn--pequeno" type="button" data-apagar-contrato="' + esc(c.id) + '" aria-label="Apagar contrato">×</button>' +
        '</div></div>';
    }).join('');
  }

  function abrirContrato(id) {
    var c = contratos.find(function (x) { return x.id === id; });
    if (!c) return;
    var form = c.dados && c.dados.form;
    if (form) {
      CAMPOS_CONTRATO.forEach(function (campo) { if (form[campo] != null) $(campo).value = form[campo]; });
      atualizarValoresAutomaticos();
      gerarPreviewContrato();
    } else {
      // contrato antigo (veio do Firebase): mostra o texto exatamente como foi salvo
      $('form-contrato').reset();
      $('clienteNome').value = c.cliente_nome || '';
      $('contratoEventoNome').value = c.evento_nome || '';
      atualizarValoresAutomaticos();
      mostrarTextoPronto(c.contrato_texto || '');
    }
    toast('Contrato aberto. Confira a prévia lá embaixo.');
    document.querySelector('.previa-contrato').scrollIntoView({ behavior: 'smooth' });
  }

  async function apagarContrato(id) {
    var c = contratos.find(function (x) { return x.id === id; });
    if (!c || !window.confirm('Apagar o contrato de "' + (c.cliente_nome || 'sem nome') + '"? Isso não pode ser desfeito.')) return;
    var r = await sb.from('contratos').delete().eq('id', id);
    if (r.error) { toast(mensagemErro(r.error), 'erro'); return; }
    toast('Contrato apagado.');
    carregarContratos();
  }

  function limparContrato() {
    if (!window.confirm('Limpar todos os campos do contrato?')) return;
    $('form-contrato').reset();
    $('contratoDuracao').value = '01h30 (uma hora e trinta minutos)';
    atualizarValoresAutomaticos();
    textoPreviaAtual = null;
    $('previewContrato').innerHTML = '<div id="areaContratoPdf"><h2>Prévia do contrato</h2><p>Preencha os dados acima e clique em <strong>Ver prévia</strong>.</p></div>';
  }

  function ligarContratos() {
    $('btn-previa').addEventListener('click', function () {
      gerarPreviewContrato();
      document.querySelector('.previa-contrato').scrollIntoView({ behavior: 'smooth' });
    });
    $('btn-pdf').addEventListener('click', gerarPdfContrato);
    $('btn-salvar-contrato').addEventListener('click', salvarContrato);
    $('btn-limpar-contrato').addEventListener('click', limparContrato);
    $('lista-contratos').addEventListener('click', function (e) {
      var a = e.target.closest('[data-abrir-contrato]');
      if (a) { abrirContrato(a.dataset.abrirContrato); return; }
      var d = e.target.closest('[data-apagar-contrato]');
      if (d) apagarContrato(d.dataset.apagarContrato);
    });
    $('contratoValorTotal').addEventListener('input', atualizarValoresAutomaticos);
    $('contratoValorTotal').addEventListener('blur', function () {
      var v = moedaParaNumero(this.value);
      this.value = v ? formatarMoedaNumero(v) : '';
      atualizarValoresAutomaticos();
    });
    CAMPOS_CONTRATO.forEach(function (id) {
      $(id).addEventListener('input', function () { textoPreviaAtual = null; atualizarValoresAutomaticos(); });
    });
  }

  /* =================== INÍCIO =================== */
  document.addEventListener('DOMContentLoaded', function () {
    ligarLogin();
    ligarAbas();
    ligarShows();
    ligarOrcamento();
    ligarFotos();
    ligarTextos();
    ligarContratos();
    iniciar();
  });
})();
