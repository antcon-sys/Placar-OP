// JS Controle Menu 

// Scripts Firebase JS Controle Placar Geral OnLine --

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
const placarRef = db.ref('placar');

let segundosAcumulados = 0; // O tempo que já passou antes de um pause
let rodando = false;
let intervaloVisor = null;

// Sincroniza com o banco ao abrir o painel
placarRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        rodando = data.rodando || false;
        segundosAcumulados = data.segundosAcumulados || 0;

        document.getElementById('nomeTimeA').innerText = data.timeA || "Time A";
        document.getElementById('nomeTimeB').innerText = data.timeB || "Time B";
        document.getElementById('golsAA').innerText = data.golsA || 0;
        document.getElementById('golsBB').innerText = data.golsB || 0;

        const btn = document.getElementById('btnPlay');
        btn.innerText = rodando ? "Pausar" : "Iniciar";

        // Gerencia a atualização do visor no Painel
        clearInterval(intervaloVisor);
        if (rodando && data.startTime) {
            intervaloVisor = setInterval(() => {
                const agora = Date.now();
                const total = Math.floor((agora - data.startTime) / 1000) + segundosAcumulados;
                atualizarVisor(total);
            }, 1000);
        } else {
            atualizarVisor(data.segundos || 0);
        }
    }
});

function alternarCronometro() {
    if (!rodando) {
        // VAI INICIAR
        placarRef.update({
            rodando: true,
            startTime: firebase.database.ServerValue.TIMESTAMP,
            segundosAcumulados: segundosAcumulados
        });
    } else {
        // VAI PAUSAR
        const agora = Date.now();
        // Precisamos ler o startTime do banco para calcular o quanto passou até o clique do pause
        placarRef.once('value').then((snap) => {
            const data = snap.val();
            const tempoNestaSessao = Math.floor((Date.now() - data.startTime) / 1000);
            const novoTotal = segundosAcumulados + tempoNestaSessao;

            placarRef.update({
                rodando: false,
                segundos: novoTotal, // Para exibição estática
                segundosAcumulados: novoTotal, // Salva para o próximo "Play"
                startTime: null
            });
        });
    }
}

function resetarCronometro() {
    if (confirm("Zerar o tempo?")) {
        segundosAcumulados = 0;
        clearInterval(intervaloVisor);
        placarRef.update({
            segundos: 0,
            segundosAcumulados: 0,
            rodando: false,
            startTime: null
        });
    }
}

function mudarGols(campo, valor) {

    placarRef.child(campo).transaction((atual) => {

        const novoPlacar = (atual || 0) + valor;

        return Math.max(0, novoPlacar);
    });
}
function atualizarNomesEAcrescimo() {
    const nA = document.getElementById('inputA').value;
    const nB = document.getElementById('inputB').value;
    const nC = document.getElementById('tempoJogo').value;
    const ac = document.getElementById('inputAcrescimo').value;
    const updates = {};
    if (nA) updates.timeA = nA;
    if (nB) updates.timeB = nB;
    if (nC) updates.tempo = nC;
    if (ac) updates.minutosAcrescimo = ac;
    placarRef.update(updates);
}

function toggleAcrescimo(visivel) {
    placarRef.update({ mostrarAcrescimo: visivel });
}

function atualizarVisor(s) {
    const total = s < 0 ? 0 : s;
    const min = Math.floor(total / 60).toString().padStart(2, '0');
    const seg = (total % 60).toString().padStart(2, '0');
    document.getElementById('displayCronometro').innerText = min + ":" + seg;
}
