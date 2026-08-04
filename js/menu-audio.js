// Controla a reproducao continua do som ambiente entre os menus
(function () {
  let somAmbienteMenu = null;
  let audioInicializado = false;

  function inicializarAudio() {
    if (audioInicializado) return;

    somAmbienteMenu = new Audio("audio/AmbienteMenu.mp3");
    somAmbienteMenu.id = "som-ambiente-menu";
    somAmbienteMenu.loop = true;
    somAmbienteMenu.volume = 0.25;

    // Recupera a posição anterior
    const tempoGuardado = localStorage.getItem("menuAudioTempo");
    if (tempoGuardado) {
      somAmbienteMenu.currentTime = parseFloat(tempoGuardado);
    }

    audioInicializado = true;
  }

  function tocarMusicaFundo() {
    if (!somAmbienteMenu) {
      inicializarAudio();
    }

    if (somAmbienteMenu.paused) {
      somAmbienteMenu.play().catch(() => {});
    }
  }

  // Inicializa quando o DOM estiver pronto
  document.addEventListener("DOMContentLoaded", () => {
    inicializarAudio();

    // Tenta tocar
    somAmbienteMenu.play().catch(() => {
      document.addEventListener("click", tocarMusicaFundo, { once: true });
    });

    // Guarda posição periodicamente
    setInterval(() => {
      if (
        somAmbienteMenu &&
        !somAmbienteMenu.paused &&
        !somAmbienteMenu.ended
      ) {
        localStorage.setItem("menuAudioTempo", somAmbienteMenu.currentTime);
      }
    }, 1000);

    // Guarda ao sair
    window.addEventListener("beforeunload", () => {
      if (somAmbienteMenu && !somAmbienteMenu.paused) {
        localStorage.setItem("menuAudioTempo", somAmbienteMenu.currentTime);
      }
    });
  });
})();
