/* Carrega a biblioteca do Supabase (com plano B se um CDN falhar)
   e entrega sempre o mesmo cliente: tedSupabase().then(sb => ...) */
(function () {
  var CDNS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'
  ];
  var promessa = null;

  function carregarScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () {
        if (window.supabase && window.supabase.createClient) resolve();
        else reject(new Error('Biblioteca do Supabase não carregou de ' + src));
      };
      s.onerror = function () { reject(new Error('Falha ao baixar ' + src)); };
      document.head.appendChild(s);
    });
  }

  function configPronta(cfg) {
    return cfg && cfg.supabaseUrl && cfg.supabaseAnonKey &&
      !/COLE_AQUI/.test(cfg.supabaseUrl) && !/COLE_AQUI/.test(cfg.supabaseAnonKey);
  }

  window.tedSupabase = function () {
    if (promessa) return promessa;
    promessa = (async function () {
      var cfg = window.TED_CONFIG;
      if (!configPronta(cfg)) {
        var e = new Error('CONFIG_PENDENTE');
        e.code = 'CONFIG_PENDENTE';
        throw e;
      }
      if (!(window.supabase && window.supabase.createClient)) {
        var ultimoErro = null;
        var ok = false;
        for (var i = 0; i < CDNS.length && !ok; i++) {
          try { await carregarScript(CDNS[i]); ok = true; } catch (err) { ultimoErro = err; }
        }
        if (!ok) throw ultimoErro;
      }
      return window.supabase.createClient(cfg.supabaseUrl.trim().replace(/\/+$/, ''), cfg.supabaseAnonKey.trim());
    })();
    promessa.catch(function () { promessa = null; });
    return promessa;
  };
})();
