import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
        import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyA_yKDVhp4n8YDgIhtzOPT5DJX24dip_X4",
            authDomain: "baile-do-ted.firebaseapp.com",
            projectId: "baile-do-ted",
            storageBucket: "baile-do-ted.firebasestorage.app",
            messagingSenderId: "838778419593",
            appId: "1:838778419593:web:590a0a81c4ff2f1a140958",
            measurementId: "G-WTT2FR4EH7"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        function onlyNumbers(value) {
            return String(value || '').replace(/\D/g, '');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function iconInstagram() {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;
        }

        function iconWhatsApp() {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.411 0 11.981 0c3.184.001 6.177 1.242 8.426 3.496 2.249 2.254 3.487 5.244 3.486 8.428-.003 6.623-5.354 11.972-11.924 11.972-1.996-.001-3.956-.501-5.699-1.45L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.333 1.486 5.517 0 10.005-4.477 10.008-9.986.002-2.669-1.036-5.178-2.925-7.069C17.175 1.693 14.673.655 12.002.655 6.485.655 1.997 5.132 1.994 10.64c0 2.083.547 4.11 1.585 5.86l-.99 3.616 3.704-.962h.354zM16.52 14.92c-.233-.117-1.384-.683-1.597-.762-.214-.078-.37-.117-.526.117-.156.234-.604.762-.741.918-.137.156-.273.175-.506.058-.233-.117-.988-.363-1.88-1.161-.694-.618-1.163-1.382-1.3-1.616-.137-.234-.015-.361.102-.477.106-.105.234-.273.349-.41.117-.136.156-.233.234-.39.078-.155.038-.292-.019-.41-.059-.117-.526-1.267-.721-1.735-.19-.459-.383-.396-.526-.404-.136-.007-.293-.008-.449-.008-.156 0-.41.059-.624.292-.214.234-.818.8-.818 1.95 0 1.15.838 2.261.955 2.417.117.156 1.648 2.516 3.993 3.527.558.241 1.002.385 1.345.495.561.178 1.07.153 1.472.093.448-.067 1.384-.565 1.579-1.111.195-.547.195-1.015.137-1.111-.059-.098-.215-.156-.449-.274z"/></svg>`;
        }

        function instagramUrl(handle) {
            const clean = String(handle || '@bailedoted').replace('@', '').trim();
            return `https://instagram.com/${clean || 'bailedoted'}`;
        }

        function whatsappUrl(number, message = '') {
            let digits = onlyNumbers(number || '41995906901');
            if (!digits.startsWith('55')) digits = `55${digits}`;
            return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        }

        function socialAction(type, label, href, title = '') {
            const icon = type === 'instagram' ? iconInstagram() : iconWhatsApp();
            return `<a class="mini-social ${type}" href="${escapeHtml(href)}" target="_blank" rel="noopener" title="${escapeHtml(title || label)}">${icon}<span>${escapeHtml(label)}</span></a>`;
        }

        function isVideoMedia(url) {
            return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(String(url || ''));
        }

        function videoMimeType(url) {
            const clean = String(url || '').split('?')[0].split('#')[0].toLowerCase();
            if (clean.endsWith('.webm')) return 'video/webm';
            if (clean.endsWith('.ogg')) return 'video/ogg';
            return 'video/mp4';
        }

        function renderStoryMedia(src, alt, loading = 'lazy') {
            const safeSrc = escapeHtml(src || 'img/tedsite.png');
            const safeAlt = escapeHtml(alt || 'Arte do Baile do Ted');

            if (isVideoMedia(safeSrc)) {
                return `
                    <video class="story-media" autoplay muted loop playsinline preload="metadata" aria-label="${safeAlt}">
                        <source src="${safeSrc}" type="${videoMimeType(safeSrc)}">
                    </video>
                `;
            }

            return `<img class="story-media js-open-art" src="${safeSrc}" data-full="${safeSrc}" alt="${safeAlt}" loading="${loading}">`;
        }

        const MEDIA_SLOT_EXTENSIONS = ['mp4', 'webm', 'm4v', 'mov', 'jpg', 'jpeg', 'png', 'webp'];

        function testMediaCandidate(src) {
            return new Promise((resolve) => {
                let done = false;
                const finish = (value) => {
                    if (done) return;
                    done = true;
                    resolve(value);
                };

                if (isVideoMedia(src)) {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.muted = true;
                    video.onloadedmetadata = () => finish(src);
                    video.onerror = () => finish(null);
                    video.src = src;
                } else {
                    const img = new Image();
                    img.onload = () => finish(src);
                    img.onerror = () => finish(null);
                    img.src = src;
                }

                setTimeout(() => finish(null), 1800);
            });
        }

        async function carregarMidiasFixas() {
            const slots = Array.from(document.querySelectorAll('[data-media-slot]'));
            for (const slotEl of slots) {
                const slotName = slotEl.dataset.mediaSlot;
                const fallback = slotEl.dataset.fallback || 'img/tedsite.png';
                const alt = slotEl.dataset.alt || `Mídia ${slotName} do Baile do Ted`;
                const loading = slotEl.dataset.loading || 'lazy';
                const candidates = MEDIA_SLOT_EXTENSIONS.map((ext) => `img/${slotName}.${ext}`);
                let selected = null;

                for (const candidate of candidates) {
                    selected = await testMediaCandidate(candidate);
                    if (selected) break;
                }

                slotEl.innerHTML = renderStoryMedia(selected || fallback, alt, loading);
            }
        }

        function timestampEvento(evento) {
            const valor = evento.dataTimestamp || evento.timestamp || evento.data || evento.dataEvento || evento.createdAt;
            if (!valor) return 9999999999999;
            if (typeof valor === 'number') return valor;
            if (valor.seconds) return valor.seconds * 1000;
            const parsed = Date.parse(valor);
            return Number.isNaN(parsed) ? 9999999999999 : parsed;
        }

        function eventoEstaVisivel(evento) {
            const status = String(evento.status || evento.situacao || '').toLowerCase().trim();
            if (evento.ativo === false || evento.publico === false || evento.oculto === true) return false;
            if (['cancelado', 'cancelada', 'inativo', 'inativa', 'rascunho', 'excluido', 'excluida'].includes(status)) return false;
            return true;
        }

        // Correção do bug de agenda: um evento com data já passada nunca deve aparecer
        // como "próximo show". Eventos sem data definida (dataTimestamp ausente) não são
        // considerados "passados" — eles caem no fim da lista e continuam visíveis.
        function eventoJaPassou(evento) {
            const ts = timestampEvento(evento);
            if (ts >= 9999999999999) return false;
            const hoje = new Date();
            const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
            return ts < inicioDeHoje;
        }

        async function carregarEventos() {
            const containerDestaque = document.getElementById("container-destaque");
            const gridCalendario = document.getElementById("grid-calendario");
            if (!containerDestaque || !gridCalendario) return;

            containerDestaque.innerHTML = "<p style='color:#ff007f; text-align:center; font-size: 1.2rem; font-weight: bold;'>Buscando a agenda mais braba... 🐻🎶</p>";
            gridCalendario.innerHTML = "";

            try {
                // Busca simples, sem orderBy obrigatório. Assim a agenda não some caso algum evento antigo esteja sem dataTimestamp
                // ou caso o Firebase bloqueie a consulta ordenada por índice/regra.
                const querySnapshot = await getDocs(collection(db, "eventos"));
                const eventos = [];
                querySnapshot.forEach((doc) => {
                    const dados = { id: doc.id, ...doc.data() };
                    if (eventoEstaVisivel(dados) && !eventoJaPassou(dados)) eventos.push(dados);
                });

                eventos.sort((a, b) => timestampEvento(a) - timestampEvento(b));

                if (eventos.length === 0) {
                    containerDestaque.innerHTML = `
                        <div class="event-cta-after" style="justify-content:center; text-align:center;">
                            <div>
                                <h3>Sua data pode ser a próxima.</h3>
                                <p>Ainda não temos shows públicos confirmados no momento — chame no WhatsApp para consultar disponibilidade e fechar a agenda do seu evento.</p>
                            </div>
                            <a class="btn-primary" href="https://wa.me/5541995906901?text=Olá! Quero consultar a agenda do Baile do Ted." target="_blank">Consultar agenda</a>
                        </div>`;
                    return;
                }

                const proximoShow = eventos[0];
                const localDestaque = proximoShow.localNome ? `📍 ${escapeHtml(proximoShow.localNome)}` : '📍 Local privado';
                const enderecoDestaque = proximoShow.localEndereco ? `<small>${escapeHtml(proximoShow.localEndereco)}</small>` : '';
                const instagramFinal = proximoShow.instagram || '@bailedoted';
                const contatoFinal = proximoShow.localContato || '(41) 99590-6901';
                const numeroWhatsLimpo = onlyNumbers(contatoFinal);
                const linkVendasFinal = proximoShow.linkIngresso || 'https://wa.me/5541995906901?text=Olá! Quero mais informações sobre o próximo show do Baile do Ted.';
                const textoBotaoPrincipal = proximoShow.linkIngresso ? '🎫 Comprar ingressos' : '📲 Mais informações';
                const imagemDestaque = proximoShow.imagem || 'img/tedsite.png';

                containerDestaque.innerHTML = `
                    <div class="show-destaque">
                        <div class="show-destaque__glow"></div>
                        <div class="show-destaque__grid">
                            <div class="agenda-story-frame agenda-story-frame--destaque">
                                ${renderStoryMedia(imagemDestaque, proximoShow.nome || 'Próximo show do Baile do Ted')}
                            </div>
                            <div>
                                <span class="show-destaque__badge"><span class="show-destaque__dot"></span> Próximo show confirmado</span>
                                <h3>${escapeHtml(proximoShow.nome || 'Baile do Ted')}</h3>
                                <div class="show-destaque__meta">
                                    <p class="show-destaque__date">${escapeHtml(proximoShow.dataTexto || 'Data em breve')}</p>
                                    <p class="show-destaque__place">${localDestaque}${enderecoDestaque}</p>
                                </div>
                                <div class="mini-social-row" style="margin-bottom:20px;">
                                    ${socialAction('instagram', instagramFinal, instagramUrl(instagramFinal), instagramFinal)}
                                    ${socialAction('whatsapp', 'WhatsApp local', whatsappUrl(numeroWhatsLimpo), 'Chamar o local no WhatsApp')}
                                </div>
                                <a href="${escapeHtml(linkVendasFinal)}" target="_blank" class="btn-primary">${textoBotaoPrincipal}</a>
                            </div>
                        </div>
                    </div>
                `;

                eventos.slice(1).forEach((evento) => {
                    const localLista = evento.localNome || 'Evento restrito';
                    const cidadeLista = evento.localEndereco || '';
                    const linkBotaoLista = evento.linkIngresso || 'https://wa.me/5541995906901?text=Olá! Quero detalhes de um show do Baile do Ted.';
                    const instaCard = evento.instagram || '@bailedoted';
                    const contatoCard = evento.localContato || '(41) 99590-6901';
                    const whatsCardLimpo = onlyNumbers(contatoCard);
                    const imagem = evento.imagem || 'img/tedsite.png';

                    gridCalendario.insertAdjacentHTML('beforeend', `
                        <div class="card-evento">
                            <div class="card-evento__top">
                                <div class="agenda-story-frame">
                                    ${renderStoryMedia(imagem, evento.nome || 'Arte do evento')}
                                </div>
                                <div class="card-evento__date">
                                    <span class="mes">${escapeHtml(evento.mesAbas || '')}</span>
                                    <span class="dia">${escapeHtml(evento.diaNum || '')}</span>
                                </div>
                            </div>
                            <div class="card-evento__body">
                                <h4>${escapeHtml(evento.nome || 'Baile do Ted')}</h4>
                                <p class="card-evento__local">📍 ${escapeHtml(localLista)}</p>
                                ${cidadeLista ? `<p class="card-evento__cidade">🌍 ${escapeHtml(cidadeLista)}</p>` : ''}
                                <div class="mini-social-row">
                                    ${socialAction('instagram', instaCard, instagramUrl(instaCard), instaCard)}
                                    ${socialAction('whatsapp', 'WhatsApp', whatsappUrl(whatsCardLimpo), 'Chamar no WhatsApp')}
                                </div>
                                <a href="${escapeHtml(linkBotaoLista)}" target="_blank" class="btn-secondary">🎫 Ver detalhes</a>
                            </div>
                        </div>`);
                });
            } catch (error) {
                console.error("Erro ao carregar banco de dados: ", error);
                containerDestaque.innerHTML = `
                    <div class="event-cta-after" style="justify-content:center; text-align:center;">
                        <div>
                            <h3>Não foi possível carregar a agenda agora.</h3>
                            <p>Chame no WhatsApp para consultar disponibilidade.</p>
                        </div>
                        <a class="btn-primary" href="https://wa.me/5541995906901?text=Olá! Quero consultar a agenda do Baile do Ted." target="_blank">Chamar no WhatsApp</a>
                    </div>`;
            }
        }

        window.addEventListener("DOMContentLoaded", () => {
            carregarMidiasFixas();
            carregarEventos();
        });
