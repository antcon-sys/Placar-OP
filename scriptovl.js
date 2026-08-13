// --- SUA CONFIGURAÇÃO MANTIDA ---
const firebaseConfig = {
    apiKey: "AIzaSyCHKTA-mgIuWcVypfDkGrNhxtsynrUtq1Y",
    authDomain: "placar-live-53cc0.firebaseapp.com",
    projectId: "placar-live-53cc0",
    databaseURL: "https://placar-live-53cc0-default-rtdb.firebaseio.com",
    storageBucket: "placar-live-53cc0.firebasestorage.app",
    messagingSenderId: "291622264576",
    appId: "1:291622264576:web:1ca81d1333e4b0cb7b1de5",
    measurementId: "G-ZJPHJ42ECV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let intervaloCronometro;

db.ref('placar').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Atualização de nomes e gols
        document.getElementById('timeA').innerText = data.timeA || "CASA";
        document.getElementById('siglaA').innerText = data.sigtimeA || "ABR A";
        document.getElementById('golsA').innerText = data.golsA || 0;
        document.getElementById('timeB').innerText = data.timeB || "VISITANTE";
        document.getElementById('siglaB').innerText = data.sigtimeB || "ABR B";
        document.getElementById('golsB').innerText = data.golsB || 0;
        document.getElementById('tempo').innerText = data.tempo || "1T";

        // LÓGICA DO CRONÔMETRO PERSISTENTE
        clearInterval(intervaloCronometro); // Limpa loop anterior para não duplicar

        if (data.rodando && data.startTime) {
            // Se está rodando, calculamos a diferença em tempo real
            intervaloCronometro = setInterval(() => {
                const agora = Date.now();
                const inicio = data.startTime;
                const tempoPassado = Math.floor((agora - inicio) / 1000);

                // Adicionamos o tempo acumulado (caso tenha pausado e voltado)
                const totalSegundos = tempoPassado + (data.segundosAcumulados || 0);
                exibirTempo(totalSegundos);
            }, 1000);
        } else {
            // Se estiver pausado, apenas exibe o tempo parado que está no banco
            const totalSegundos = data.segundos || 0;
            exibirTempo(totalSegundos);
        }

        // Acréscimos
        const acrescimoEl = document.getElementById('acrescimo');
        if (data.mostrarAcrescimo && data.minutosAcrescimo > 0) {
            acrescimoEl.style.display = "inline";
            acrescimoEl.innerText = "+" + data.minutosAcrescimo;
            document.getElementById('container-placar').style.gridTemplateColumns = "1fr 1.25fr";
        } else {
            acrescimoEl.style.display = "none";
            acrescimoEl.innerText = "";
            document.getElementById('container-placar').style.gridTemplateColumns = "1fr 1fr";
        }

        /* // Cartões
         atualizarInterfaceCartoes('A', data.cartoesA || 0);
         atualizarInterfaceCartoes('B', data.cartoesB || 0);*/
    }
});

// Função para controlar a transição fade via classes CSS
function alternarVisualizacaoTimes(mostrarNome) {
    const timeA = document.getElementById('timeA');
    const siglaA = document.getElementById('siglaA');
    const timeB = document.getElementById('timeB');
    const siglaB = document.getElementById('siglaB');

    if (mostrarNome) {
        timeA?.classList.add('ativo');
        siglaA?.classList.remove('ativo');
        timeB?.classList.add('ativo');
        siglaB?.classList.remove('ativo');
    } else {
        timeA?.classList.remove('ativo');
        siglaA?.classList.add('ativo');
        timeB?.classList.remove('ativo');
        siglaB?.classList.add('ativo');
    }
}

// Função auxiliar para formatar MM:SS e alternar nomes/siglas
function exibirTempo(s) {
    if (s < 0) s = 0; // Evita tempos negativos por delay de sync

    // 1. Alternância dos nomes dos times baseada no tempo percorrido
    if (s < 10) {
        // Primeiros 10 segundos: exibe Nomes Completos
        alternarVisualizacaoTimes(true);
    } else {
        // Após 15s, cria ciclos regulares de 300 segundos (5 minutos)
        // Calcula a posição do segundo atual dentro da janela de 5 minutos
        const cicloSegundos = (s - 15) % 300;

        // Nos primeiros 15 segundos de cada ciclo de 5 minutos, exibe Nomes Completos; no restante, Siglas
        if (cicloSegundos < 15) {
            alternarVisualizacaoTimes(true);
        } else {
            alternarVisualizacaoTimes(false);
        }
    }

    // 2. Formatação do Cronômetro
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const seg = (s % 60).toString().padStart(2, '0');
    document.getElementById('periodo').innerText = min + ":" + seg;
}

// Função para atualizar os cartões na interface do OBS
function atualizarInterfaceCartoes(time, quantidade) {
    const container = document.getElementById(`cartoes-time-${time}`);
    container.innerHTML = ''; // Limpa os antigos

    for (let i = 0; i < quantidade; i++) {
        const novoCartao = document.createElement('div');
        novoCartao.classList.add('mini-cartao-vermelho');
        container.appendChild(novoCartao);
    }
}

// ESCUTA EM TEMPO REAL: Se mudar no Firebase, atualiza a tela do OBS na hora
db.ref('placar').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) {
        atualizarInterfaceCartoes('A', dados.cartoesA || 0);
        atualizarInterfaceCartoes('B', dados.cartoesB || 0);
    }
});

