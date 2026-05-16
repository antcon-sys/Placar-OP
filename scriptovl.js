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
        document.getElementById('golsA').innerText = data.golsA || 0;
        document.getElementById('timeB').innerText = data.timeB || "VISITANTE";
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
            exibirTempo(data.segundos || 0);
        }

        // Acréscimos
        const acrescimoEl = document.getElementById('acrescimo');
        if (data.mostrarAcrescimo && data.minutosAcrescimo > 0) {
            acrescimoEl.style.display = "inline";
            acrescimoEl.innerText = "+" + data.minutosAcrescimo;
        } else {
            acrescimoEl.style.display = "none";
        }
    }
});

// Função auxiliar para formatar MM:SS
function exibirTempo(s) {
    if (s < 0) s = 0; // Evita tempos negativos por delay de sync
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const seg = (s % 60).toString().padStart(2, '0');
    document.getElementById('periodo').innerText = min + ":" + seg;
}

