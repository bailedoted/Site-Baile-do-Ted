/* Simulador de orçamento — mesma conta de antes:
   distância de carro (ida e volta) a partir de Curitiba × R$ 0,68/km
   + cachê base por faixa de distância. */
(function () {
  'use strict';

  var FRASES_TED = [
    'Calma aí, parceiro! Tô calculando essa rota…',
    'Acordando o Ted pra ver quantos km dá até aí…',
    'Preparando a equipe e medindo a distância… já volto!',
    'O Ted tá fazendo as contas dessa viagem…'
  ];

  function mostrar(el, sim) { if (el) el.hidden = !sim; }

  async function calcularOrcamento(evento) {
    if (evento) evento.preventDefault();
    var cidade = document.getElementById('cidade-destino').value.trim();
    var tipo = document.getElementById('tipo-evento').value.trim();
    var data = document.getElementById('data-evento').value;
    var nome = document.getElementById('nome-cliente').value.trim();
    var btnWhats = document.getElementById('btn-whats-orcamento');
    var btn = document.getElementById('btn-calcular');
    var carregando = document.getElementById('loading-box');
    var resultado = document.getElementById('resultado-box');
    var dados = document.getElementById('dados-orcamento');
    var erro = document.getElementById('msg-erro');
    var barra = document.getElementById('barra-progresso');

    mostrar(resultado, false); mostrar(dados, false); mostrar(erro, false); mostrar(carregando, false);
    barra.style.animation = 'none';

    if (!cidade) {
      mostrar(resultado, true);
      erro.textContent = 'Digite a cidade e o estado do evento.';
      mostrar(erro, true);
      document.getElementById('cidade-destino').focus();
      return;
    }

    document.getElementById('msg-ted').textContent = FRASES_TED[Math.floor(Math.random() * FRASES_TED.length)];
    mostrar(carregando, true);
    btn.disabled = true;
    btn.textContent = 'Calculando…';
    setTimeout(function () { barra.style.animation = 'encherBarra 5s linear forwards, brilhoNeon 2s ease infinite'; }, 10);

    var espera = new Promise(function (r) { setTimeout(r, 3000); });
    var calculo = (async function () {
      var resGeo = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(cidade));
      var geo = await resGeo.json();
      if (!geo.length) throw new Error("Cidade não encontrada. Digite no formato 'Cidade, Estado'.");
      var lat = geo[0].lat, lon = geo[0].lon;
      var latCwb = -25.4284, lonCwb = -49.2733;
      var resRota = await fetch('https://router.project-osrm.org/route/v1/driving/' + lonCwb + ',' + latCwb + ';' + lon + ',' + lat + '?overview=false');
      var rota = await resRota.json();
      if (rota.code !== 'Ok') throw new Error('Não foi possível traçar uma rota de carro até essa cidade.');
      var kmIdaVolta = (rota.routes[0].distance / 1000) * 2;
      var cache = kmIdaVolta <= 200 ? 1500 : kmIdaVolta <= 300 ? 2000 : kmIdaVolta <= 500 ? 2500 : 3000;
      return kmIdaVolta * 0.68 + cache;
    })();

    try {
      var res = await Promise.all([espera, calculo]);
      var total = res[1];
      mostrar(carregando, false);
      document.getElementById('res-total').textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      mostrar(resultado, true);
      mostrar(dados, true);
      var msg = 'Olá! Fiz uma simulação no site para contratar o Baile do Ted.\n\n' +
        '*Cidade:* ' + cidade + '\n' +
        (tipo ? '*Tipo de evento:* ' + tipo + '\n' : '') +
        (data ? '*Data desejada:* ' + data.split('-').reverse().join('/') + '\n' : '') +
        (nome ? '*Nome:* ' + nome + '\n' : '') +
        '\n*Estimativa base:* R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\n' +
        '_(hospedagem e alimentação não inclusas na simulação)_\n\nGostaria de conversar sobre disponibilidade e fechamento.';
      btnWhats.href = 'https://wa.me/5541995906901?text=' + encodeURIComponent(msg);
    } catch (e) {
      await espera;
      mostrar(carregando, false);
      mostrar(resultado, true);
      erro.textContent = (e && e.message && !/fetch/i.test(e.message)) ? e.message : 'Não deu pra calcular agora. Tente só "Cidade, UF" ou chame a gente no WhatsApp.';
      mostrar(erro, true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Calcular de novo';
    }
  }

  window.calcularOrcamento = calcularOrcamento;
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('form-orcamento');
    if (form) form.addEventListener('submit', calcularOrcamento);
  });
})();
