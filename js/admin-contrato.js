/* =====================================================================
   MODELO DO CONTRATO + cálculos (valores, extenso, datas).
   Copiado sem alterações do admin antigo: o texto do contrato e as
   regras de cálculo continuam exatamente iguais.
   ===================================================================== */
const MODELO_PADRAO_CONTRATO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ARTÍSTICOS

QUALIFICAÇÃO DA CONTRATADA
Razão Social: Chama Produções e Eventos
CNPJ: 50.959.776/0001-01
Neste ato representada por: Adair Costa Beles Neto, CPF: 831.259.730-15
Endereço: Rua José Scuissiato, 11 – Curitiba/PR
Fone/WhatsApp: 41 8505-1986

QUALIFICAÇÃO DA(O) CONTRATANTE
Razão Social / Nome: **{{cliente_nome}}**
CNPJ / CPF: **{{cliente_cpf_cnpj}}**
Insc. Est.: **{{cliente_rg_ie}}**
Neste ato representada(o) por: **{{cliente_representante}}**, CPF: **{{cliente_representante_cpf}}**
Endereço: **{{cliente_endereco}}**
Fone/WhatsApp: **{{cliente_telefone}}**
E-mail: **{{cliente_email}}**

DADOS DO EVENTO
Nome do Evento / Show: **{{evento_nome}}**
Atração: Baile do Ted
Data do Evento: **{{evento_data}}**
Horário de Início do Show: **{{evento_horario}}**
Nome da Casa / Local do Evento: **{{evento_casa_nome}}**
Endereço / Local do Evento: **{{evento_endereco}}**
Instagram da Casa: **{{evento_casa_instagram}}**
Duração da Apresentação: **{{duracao_apresentacao}}**

VALOR E FORMA DE PAGAMENTO
Valor Total: **{{valor_total}}** (**{{valor_total_extenso}}**)
Forma de pagamento: **{{forma_pagamento}}**

**10% no ato da assinatura deste contrato (reserva de data): {{valor_sinal}}.**

**40% até 24 (vinte e quatro) horas antes do início da viagem da equipe: {{valor_parcela_40}}.**

**50% no dia do evento, impreterivelmente antes do artista entrar no palco: {{valor_parcela_50}}.**

Informações adicionais / combinados manuais: **{{opcoes_manuais}}**
Observações adicionais: **{{observacoes}}**

Dados Bancários:
Banco: INTER
Chave PIX (CNPJ): 50.959.776/0001-01
Titular: Chama Produções e Eventos (ou Adair Costa Beles Neto)

CONDIÇÕES GERAIS DO CONTRATO

CLÁUSULA 1ª (DA ALTERAÇÃO DE DATAS): O presente contrato não deverá ser suspenso ou alterado, a não ser com a prévia e expressa aprovação de ambas as partes por escrito. As datas contratadas não poderão ser alteradas sem o consentimento da CONTRATADA.

CLÁUSULA 2ª (DO CANCELAMENTO): No caso de desistência ou cancelamento do evento por parte do CONTRATANTE:
I. Não haverá devolução do valor referente à reserva de data (10%).
II. Se o cancelamento ocorrer com menos de 15 (quinze) dias da data do evento, o CONTRATANTE pagará multa equivalente a 50% do valor total do contrato.
III. Se o cancelamento ocorrer no dia do evento, ou após o deslocamento da equipe da CONTRATADA, será devido o valor integral (100%) do contrato.
Parágrafo Único: Caso a CONTRATADA fique impossibilitada de comparecer por motivo de força maior (como acidentes, doenças graves ou calamidades públicas, devidamente comprovados), compromete-se a devolver os valores pagos antecipadamente, ficando isenta de multas adicionais.

CLÁUSULA 3ª (DA INADIMPLÊNCIA): A falta de pagamento de qualquer uma das parcelas nas datas estipuladas, especialmente a parcela exigida antes da subida ao palco, faculta à CONTRATADA o direito de reter a apresentação e rescindir imediatamente o contrato, sendo considerado o show como realizado, ficando o CONTRATANTE obrigado ao pagamento integral do valor acordado, sem prejuízo das penalidades legais.

CLÁUSULA 4ª (DO SHOW, EQUIPAMENTOS E EFEITOS): A CONTRATADA levará seus próprios equipamentos de DJ para a apresentação, necessitando exclusivamente que a estrutura de sonorização do evento possua conexão RCA disponível.
I. Durante o show, a CONTRATADA fará a distribuição de brindes (copos, adesivos e pirulitos) para o público.
II. A CONTRATADA utilizará efeitos visuais indoor do tipo "Gerb".
III. Caso o CONTRATANTE providencie ou haja viabilidade e suporte na cidade para aluguel de cilindro de CO2, a CONTRATADA compromete-se a levar e operar a atração "Bazuca de CO2" durante o espetáculo.

CLÁUSULA 5ª (DA SONORIZAÇÃO): Fica a cargo do CONTRATANTE fornecer a sonorização de pista adequada e com potência suficiente para o tamanho do evento e do público esperado.

CLÁUSULA 6ª (DA SEGURANÇA E INTEGRIDADE): O CONTRATANTE fica inteiramente responsável pela segurança material e pessoal da CONTRATADA e de toda a sua estrutura e instrumentos. Esta responsabilidade vigora a partir do momento da chegada da equipe ao local do evento até a sua retirada total. A interrupção do evento em consequência de perturbação da ordem, ou agressão física/moral aos artistas, é de exclusiva responsabilidade do CONTRATANTE, valendo como cláusula rescisória imediata e obrigando-o ao pagamento integral do contrato.

CLÁUSULA 7ª (DA LOGÍSTICA E CAMARIM): O CONTRATANTE assume o pagamento integral e a disponibilização das seguintes despesas para 04 (quatro) pessoas da equipe:

Hospedagem: Quartos com ar-condicionado, banheiro privativo (WC) e estacionamento próprio (disposição de quartos a cargo do contratante). O CONTRATANTE deverá enviar as informações completas da hospedagem (nome do hotel, endereço completo e contato) com antecedência mínima de 24 (vinte e quatro) horas antes do início da viagem da equipe.

Alimentação: Jantar, podendo ser jantinha com espetinho, lanche ou pizza.

Camarim: Local reservado e seguro para troca de figurino, contendo 01 segurança exclusivo, 01 balde de gelo, 10 garrafas de água (sem gás), 10 latas de Coca-Cola Zero, 15 energéticos, 01 garrafa de Whisky Jack Daniel’s, 02 pizzas grandes (Frango/Calabresa), 01 caixa de Bis, 01 caixa de bombom e 01 cento de salgados sortidos.

CLÁUSULA 8ª (DA ESTRUTURA DE PALCO E CORTESIAS): O CONTRATANTE deve providenciar:
I. Uma base para instalação dos equipamentos do DJ (podendo ser um hard case ou similar a uma mesa).
II. Caixas de retorno de som em cima do palco (indispensável para a qualidade do show).
III. Sessão de fotos no camarim antes do show, limitada a no máximo 50 pessoas.
IV. 07 (sete) cortesias do evento, à disposição da CONTRATADA.

CLÁUSULA 9ª (DOS ALVARÁS): O CONTRATANTE deverá providenciar, por sua exclusiva responsabilidade financeira e legal, todos os alvarás e licenças para a realização do evento (Alvará judicial, Prefeitura, Corpo de Bombeiros, ECAD, etc.).

CLÁUSULA 10ª (DO REPERTÓRIO): A escolha do repertório a ser executado ficará a inteiro critério artístico da CONTRATADA, não podendo o CONTRATANTE se opor ou interferir.

CLÁUSULA 11ª (DA MULTA POR DESCUMPRIMENTO): Em caso de infração de qualquer uma das cláusulas deste contrato (que não se enquadre nas regras específicas de cancelamento da Cláusula 2ª), por qualquer das partes, o infrator pagará à parte prejudicada uma multa estipulada em 50% (cinquenta por cento) do valor total deste contrato, além da possibilidade de rescisão imediata e apuração de perdas e danos, acrescidos de despesas e honorários advocatícios.

CLÁUSULA 12ª (DO FORO): Elege-se o foro da Comarca de Curitiba - PR para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.

E por estarem justos e contratados, assinam o presente instrumento em 02 (duas) vias de igual teor e forma, juntamente com duas testemunhas.

Curitiba - PR, **{{data_hoje_dia}}** de **{{data_hoje_mes}}** de **{{data_hoje_ano}}**.

Chama Produções e Eventos
CONTRATADA (CNPJ: 50.959.776/0001-01)

**{{cliente_nome}}**
CONTRATANTE (CNPJ/CPF: **{{cliente_cpf_cnpj}}**)`;

function formatarDataEventoCompleta(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO + "T12:00:00");
    const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    return `${data.toLocaleDateString("pt-BR")} (${dias[data.getDay()]})`;
}

function dadosDataAtual() {
    const hoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return {
        dia: String(hoje.getDate()).padStart(2, "0"),
        mes: meses[hoje.getMonth()],
        ano: String(hoje.getFullYear())
    };
}

function moedaParaNumero(valor) {
    const texto = String(valor || "").trim();
    if (!texto) return 0;
    const limpo = texto
        .replace(/\s/g, "")
        .replace(/R\$/gi, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
    return Number(limpo) || 0;
}

function formatarMoedaNumero(numero) {
    if (!numero) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numeroInteiroPorExtenso(numero) {
    numero = Math.floor(Number(numero) || 0);
    if (numero === 0) return "zero";

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function abaixoDeMil(n) {
        if (n === 0) return "";
        if (n === 100) return "cem";
        let partes = [];
        const c = Math.floor(n / 100);
        const r = n % 100;
        if (c) partes.push(centenas[c]);
        if (r) {
            if (r < 10) partes.push(unidades[r]);
            else if (r < 20) partes.push(especiais[r - 10]);
            else {
                const d = Math.floor(r / 10);
                const u = r % 10;
                partes.push(dezenas[d] + (u ? " e " + unidades[u] : ""));
            }
        }
        return partes.join(" e ");
    }

    const bilhoes = Math.floor(numero / 1000000000);
    const milhoes = Math.floor((numero % 1000000000) / 1000000);
    const milhares = Math.floor((numero % 1000000) / 1000);
    const resto = numero % 1000;
    const partes = [];

    if (bilhoes) partes.push(`${abaixoDeMil(bilhoes)} ${bilhoes === 1 ? "bilhão" : "bilhões"}`);
    if (milhoes) partes.push(`${abaixoDeMil(milhoes)} ${milhoes === 1 ? "milhão" : "milhões"}`);
    if (milhares) partes.push(`${milhares === 1 ? "mil" : abaixoDeMil(milhares) + " mil"}`);
    if (resto) partes.push(abaixoDeMil(resto));

    if (partes.length <= 1) return partes.join("");
    const ultima = partes.pop();
    return partes.join(", ") + " e " + ultima;
}

function valorMonetarioPorExtenso(numero) {
    numero = Number(numero) || 0;
    const reais = Math.floor(numero);
    const centavos = Math.round((numero - reais) * 100);
    let texto = "";

    if (reais > 0) texto += `${numeroInteiroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`;
    if (centavos > 0) {
        const txtCentavos = `${numeroInteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
        texto += texto ? ` e ${txtCentavos}` : txtCentavos;
    }
    return texto || "zero reais";
}

function escapeHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function textoContratoParaHtml(texto) {
    return escapeHtml(texto)
        .replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}

function slugify(texto) {
    return String(texto || "contrato")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .toLowerCase();
}

function maiusculo(texto) {
    return String(texto || "").trim().toLocaleUpperCase("pt-BR");
}

function valorCampo(id, padrao = "NÃO INFORMADO") {
    const valor = document.getElementById(id).value.trim();
    return maiusculo(valor || padrao);
}

function instagramCampo(id) {
    const valor = document.getElementById(id).value.trim();
    if (!valor) return "NÃO INFORMADO";
    const limpo = valor.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "").trim();
    return maiusculo(limpo.startsWith("@") ? limpo : `@${limpo}`);
}

function atualizarValoresAutomaticos() {
    const valorTotalNum = moedaParaNumero(document.getElementById("contratoValorTotal").value);
    const valorSinalNum = valorTotalNum * 0.10;
    const valorParcela40Num = valorTotalNum * 0.40;
    const valorParcela50Num = valorTotalNum * 0.50;
    const valorExtenso = valorMonetarioPorExtenso(valorTotalNum).toLocaleUpperCase("pt-BR");

    document.getElementById("contratoValorSinal").value = valorTotalNum ? formatarMoedaNumero(valorSinalNum) : "";
    document.getElementById("contratoValorParcela40").value = valorTotalNum ? formatarMoedaNumero(valorParcela40Num) : "";
    document.getElementById("contratoValorParcela50").value = valorTotalNum ? formatarMoedaNumero(valorParcela50Num) : "";
    document.getElementById("contratoValorExtenso").value = valorTotalNum ? valorExtenso : "";

    document.getElementById("resumoTotal").innerText = valorTotalNum ? formatarMoedaNumero(valorTotalNum) : "R$ 0,00";
    document.getElementById("resumoSinal").innerText = valorTotalNum ? formatarMoedaNumero(valorSinalNum) : "R$ 0,00";
    document.getElementById("resumoParcela40").innerText = valorTotalNum ? formatarMoedaNumero(valorParcela40Num) : "R$ 0,00";
    document.getElementById("resumoParcela50").innerText = valorTotalNum ? formatarMoedaNumero(valorParcela50Num) : "R$ 0,00";
    document.getElementById("resumoExtenso").innerText = valorTotalNum ? valorExtenso : "-";
}

function obterDadosContrato() {
    atualizarValoresAutomaticos();

    const valorTotalNum = moedaParaNumero(document.getElementById("contratoValorTotal").value);
    const valorSinalNum = valorTotalNum * 0.10;
    const valorParcela40Num = valorTotalNum * 0.40;
    const valorParcela50Num = valorTotalNum * 0.50;
    const dataAtual = dadosDataAtual();
    const clienteNome = document.getElementById("clienteNome").value.trim();
    const clienteCpfCnpj = document.getElementById("clienteCpfCnpj").value.trim();

    return {
        cliente_nome: valorCampo("clienteNome"),
        cliente_cpf_cnpj: valorCampo("clienteCpfCnpj"),
        cliente_rg_ie: valorCampo("clienteRgIe"),
        cliente_representante: maiusculo(document.getElementById("clienteRepresentante").value.trim() || clienteNome || "NÃO INFORMADO"),
        cliente_representante_cpf: maiusculo(document.getElementById("clienteRepresentanteCpf").value.trim() || clienteCpfCnpj || "NÃO INFORMADO"),
        cliente_endereco: "NÃO INFORMADO",
        cliente_telefone: valorCampo("clienteTelefone"),
        cliente_email: valorCampo("clienteEmail"),
        evento_nome: valorCampo("contratoEventoNome"),
        evento_data: maiusculo(formatarDataEventoCompleta(document.getElementById("contratoEventoData").value) || "NÃO INFORMADO"),
        evento_casa_nome: valorCampo("contratoCasaNome"),
        evento_casa_instagram: instagramCampo("contratoCasaInstagram"),
        evento_endereco: valorCampo("contratoEventoLocal"),
        evento_local: valorCampo("contratoEventoLocal"),
        evento_horario: valorCampo("contratoEventoHorario"),
        duracao_apresentacao: valorCampo("contratoDuracao", "01H30 (UMA HORA E TRINTA MINUTOS)"),
        valor_total: maiusculo(formatarMoedaNumero(valorTotalNum)),
        valor_total_extenso: valorTotalNum ? valorMonetarioPorExtenso(valorTotalNum).toLocaleUpperCase("pt-BR") : "NÃO INFORMADO",
        valor_sinal: maiusculo(formatarMoedaNumero(valorSinalNum)),
        valor_parcela_40: maiusculo(formatarMoedaNumero(valorParcela40Num)),
        valor_parcela_50: maiusculo(formatarMoedaNumero(valorParcela50Num)),
        forma_pagamento: valorCampo("contratoFormaPagamento"),
        opcoes_manuais: valorCampo("contratoOpcoesManuais"),
        observacoes: valorCampo("contratoObservacoes"),
        data_hoje: maiusculo(new Date().toLocaleDateString("pt-BR")),
        data_hoje_dia: maiusculo(dataAtual.dia),
        data_hoje_mes: maiusculo(dataAtual.mes),
        data_hoje_ano: maiusculo(dataAtual.ano)
    };
}

function montarTextoContrato() {
    const dados = obterDadosContrato();
    let modelo = MODELO_PADRAO_CONTRATO;

    Object.entries(dados).forEach(([chave, valor]) => {
        const marcadores = [
            `{{${chave}}}`,
            `{${chave}}`,
            `[[${chave}]]`,
            `{{${chave.toUpperCase()}}}`,
            `{${chave.toUpperCase()}}`,
            `[[${chave.toUpperCase()}]]`
        ];
        marcadores.forEach((marcador) => {
            modelo = modelo.split(marcador).join(valor || "NÃO INFORMADO");
        });
    });

    return modelo;
}
