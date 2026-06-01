async function calcularOrcamento() {
            const cidadeInput = document.getElementById('cidade-destino').value.trim();
            const tipoEvento = document.getElementById('tipo-evento').value.trim();
            const dataEvento = document.getElementById('data-evento').value;
            const nomeCliente = document.getElementById('nome-cliente').value.trim();
            const btnWhats = document.getElementById('btn-whats-orcamento');
            const btnCalcular = document.getElementById('btn-calcular');
            const loadingBox = document.getElementById('loading-box');
            const resultadoBox = document.getElementById('resultado-box');
            const dadosOrcamento = document.getElementById('dados-orcamento');
            const msgErro = document.getElementById('msg-erro');
            const barraProgresso = document.getElementById('barra-progresso');
            const msgTed = document.getElementById('msg-ted');

            resultadoBox.style.display = 'none';
            dadosOrcamento.style.display = 'none';
            msgErro.style.display = 'none';
            loadingBox.style.display = 'none';
            barraProgresso.style.animation = 'none';

            if (!cidadeInput) {
                resultadoBox.style.display = 'block';
                msgErro.innerText = "🚨 Digite a cidade e o estado do evento.";
                msgErro.style.display = 'block';
                return;
            }

            const frasesTed = [
                "Calma aí, parceiro de trovão! Tô calculando essa rota... ⚡🐻",
                "Acordando o Ted para ver quantos KM dá até aí... 🐻",
                "Preparando a equipe e medindo a distância... já volto! 🎶🐻",
                "O Ted tá calculando os custos dessa viagem... ⚡🐻"
            ];
            msgTed.innerText = frasesTed[Math.floor(Math.random() * frasesTed.length)];

            loadingBox.style.display = 'block';
            btnCalcular.disabled = true;
            btnCalcular.innerText = "Calculando...";
            setTimeout(() => {
                barraProgresso.style.animation = 'encherBarra 5s linear forwards, brilhoNeon 2s ease infinite';
            }, 10);

            const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

            const calculoPromise = (async () => {
                const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidadeInput)}`);
                const geoData = await resGeo.json();
                if (!geoData.length) throw new Error("Cidade não encontrada. Digite no formato 'Cidade, Estado'.");

                const latDestino = geoData[0].lat;
                const lonDestino = geoData[0].lon;
                const latCwb = -25.4284;
                const lonCwb = -49.2733;

                const resRota = await fetch(`https://router.project-osrm.org/route/v1/driving/${lonCwb},${latCwb};${lonDestino},${latDestino}?overview=false`);
                const rotaData = await resRota.json();
                if (rotaData.code !== 'Ok') throw new Error("Não foi possível traçar uma rota de carro para este destino.");

                const distanciaMetros = rotaData.routes[0].distance;
                const kmIda = distanciaMetros / 1000;
                const kmIdaVolta = kmIda * 2;

                let valorShow = 0;
                if (kmIdaVolta <= 200) valorShow = 1500;
                else if (kmIdaVolta <= 300) valorShow = 2000;
                else if (kmIdaVolta <= 500) valorShow = 2500;
                else valorShow = 3000;

                return (kmIdaVolta * 0.68) + valorShow;
            })();

            try {
                const [_, valorTotal] = await Promise.all([delayPromise, calculoPromise]);
                loadingBox.style.display = 'none';
                document.getElementById('res-total').innerText = valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                resultadoBox.style.display = 'block';
                dadosOrcamento.style.display = 'block';

                const msgWhats = `Olá! Fiz uma simulação no site para contratar o Baile do Ted.%0A%0A` +
                    `*Cidade:* ${cidadeInput}%0A` +
                    `${tipoEvento ? `*Tipo de evento:* ${tipoEvento}%0A` : ''}` +
                    `${dataEvento ? `*Data desejada:* ${dataEvento}%0A` : ''}` +
                    `${nomeCliente ? `*Nome:* ${nomeCliente}%0A` : ''}` +
                    `%0A*Estimativa base:* R$ ${valorTotal.toFixed(2)}%0A` +
                    `_(Obs: hospedagem e alimentação não inclusas na simulação)._ %0A%0AGostaria de conversar sobre disponibilidade e fechamento.`;
                btnWhats.href = `https://wa.me/5541995906901?text=${msgWhats}`;
            } catch (error) {
                await delayPromise;
                loadingBox.style.display = 'none';
                resultadoBox.style.display = 'block';
                msgErro.style.display = 'block';
                msgErro.innerText = error.message || "Erro ao calcular. Tente digitar apenas cidade e sigla do estado.";
            } finally {
                btnCalcular.disabled = false;
                btnCalcular.innerText = "Calcular novamente";
            }
        }

        (function iniciarLightboxDasArtes() {
            const lightbox = document.getElementById('art-lightbox');
            if (!lightbox) return;
            const lightboxImg = lightbox.querySelector('.art-lightbox-img');
            const btnClose = lightbox.querySelector('[data-lightbox-close]');
            const btnBack = lightbox.querySelector('[data-lightbox-back]');
            let aberto = false;

            function abrir(src, alt) {
                if (!src) return;
                lightboxImg.src = src;
                lightboxImg.alt = alt || 'Arte ampliada do Baile do Ted';
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.classList.add('lightbox-open');
                aberto = true;
                if (!history.state || !history.state.lightboxTed) {
                    history.pushState({ lightboxTed: true }, '', window.location.href.split('#')[0] + '#arte');
                }
            }

            function fecharSemHistorico() {
                lightbox.classList.remove('active');
                lightbox.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('lightbox-open');
                lightboxImg.src = '';
                aberto = false;
            }

            function fechar() {
                if (aberto && history.state && history.state.lightboxTed) {
                    history.back();
                } else {
                    fecharSemHistorico();
                }
            }

            document.addEventListener('click', function(event) {
                const img = event.target.closest('.js-open-art, .comentario-card img, .card-evento img');
                if (img) {
                    event.preventDefault();
                    abrir(img.dataset.full || img.currentSrc || img.src, img.alt);
                    return;
                }
                if (event.target === lightbox) fechar();
            });
            btnClose.addEventListener('click', fechar);
            btnBack.addEventListener('click', fechar);
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && aberto) fechar();
            });
            window.addEventListener('popstate', function() {
                if (aberto) fecharSemHistorico();
            });
        })();

        (function iniciarCarrosselComentarios() {
            const track = document.querySelector('[data-comentarios-track]');
            const btnPrev = document.querySelector('[data-comentarios-prev]');
            const btnNext = document.querySelector('[data-comentarios-next]');
            const dotsBox = document.querySelector('[data-comentarios-dots]');
            if (!track || !btnPrev || !btnNext || !dotsBox) return;

            const slides = Array.from(track.children);
            const visiveis = 3;
            let indiceAtual = 0;
            let autoplay;

            function getMaxIndice() { return Math.max(0, slides.length - visiveis); }
            function getPasso() {
                const primeiroSlide = slides[0];
                const estilo = window.getComputedStyle(track);
                const gap = parseFloat(estilo.columnGap || estilo.gap || 0);
                return primeiroSlide.getBoundingClientRect().width + gap;
            }
            function montarDots() {
                dotsBox.innerHTML = '';
                for (let i = 0; i <= getMaxIndice(); i++) {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'comentarios-dot';
                    dot.setAttribute('aria-label', `Ir para comentário ${i + 1}`);
                    dot.addEventListener('click', () => { indiceAtual = i; atualizarCarrossel(); reiniciarAutoplay(); });
                    dotsBox.appendChild(dot);
                }
            }
            function atualizarCarrossel() {
                const maxIndice = getMaxIndice();
                if (indiceAtual > maxIndice) indiceAtual = maxIndice;
                if (indiceAtual < 0) indiceAtual = 0;
                track.style.transform = `translateX(-${indiceAtual * getPasso()}px)`;
                Array.from(dotsBox.children).forEach((dot, i) => dot.classList.toggle('active', i === indiceAtual));
            }
            function proximo() { indiceAtual = indiceAtual >= getMaxIndice() ? 0 : indiceAtual + 1; atualizarCarrossel(); }
            function anterior() { indiceAtual = indiceAtual <= 0 ? getMaxIndice() : indiceAtual - 1; atualizarCarrossel(); }
            function reiniciarAutoplay() { clearInterval(autoplay); autoplay = setInterval(proximo, 3500); }

            btnNext.addEventListener('click', () => { proximo(); reiniciarAutoplay(); });
            btnPrev.addEventListener('click', () => { anterior(); reiniciarAutoplay(); });
            window.addEventListener('resize', atualizarCarrossel);
            montarDots();
            atualizarCarrossel();
            reiniciarAutoplay();
        })();
