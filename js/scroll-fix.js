if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }


/* No celular, alguns navegadores restauram a rolagem antiga e abrem o site já no meio do hero.
           Isso força o carregamento inicial sempre no começo quando não existe uma âncora específica. */
        (function evitarCorteInicialMobile() {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            function deveVoltarAoTopo() {
                return !window.location.hash || window.location.hash === '#topo';
            }

            function irAoTopo() {
                if (deveVoltarAoTopo()) {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                }
            }

            window.addEventListener('pageshow', function () {
                irAoTopo();
                setTimeout(irAoTopo, 80);
                setTimeout(irAoTopo, 350);
            });

            window.addEventListener('load', function () {
                irAoTopo();
                setTimeout(irAoTopo, 150);
            });
        })();


/* Evita abrir o site já "cortado" quando a URL vem com #topo.
           Em alguns navegadores/zooms, o sticky menu cobre o começo da dobra. */
        (function corrigirAncoraTopo() {
            function irParaTopoSemCorte(suave) {
                window.scrollTo({ top: 0, left: 0, behavior: suave ? 'smooth' : 'auto' });
            }

            function limparHashTopo() {
                if (window.location.hash === '#topo') {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                    setTimeout(function(){ irParaTopoSemCorte(false); }, 30);
                    setTimeout(function(){ irParaTopoSemCorte(false); }, 250);
                }
            }

            document.addEventListener('DOMContentLoaded', function () {
                limparHashTopo();
                document.querySelectorAll('a[href="#topo"]').forEach(function(link) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                        irParaTopoSemCorte(true);
                    });
                });
            });

            window.addEventListener('load', limparHashTopo);
            window.addEventListener('hashchange', limparHashTopo);
        })();
