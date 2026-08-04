// CONFIGURAÇÃO INICIAL E VARIÁVEIS GLOBAIS
let MONSTRO_A_DIFICULDADE = 5;
let portaEsquerdaFechada = false;
let portaDireitaFechada = false;
let luzEsquerdaAcesa = false;
let luzDireitaAcesa = false;
let monitorAberto = false;
let bateria = 100;
let horaAtual = 12;
let minutosAtuais = 0;
let camaraAtualNoMonitor = "cam06_caixas";
let misterioFase = 0;
let camaraOndeEstaOObjeto = "";
let objetoEstaVisivelAGora = false;
let energiaAcabou = false;

// INICIALIZAÇÃO DO JOGO
window.onload = function () {
  localStorage.setItem("posicaoMonstro", "cam07_arrumos");
  let botaoNotaMesa = document.getElementById("bilhete-secretaria");
  if (botaoNotaMesa) {
    if (localStorage.getItem("notaWilliamsLida") === "true") {
      botaoNotaMesa.style.display = "none";
    } else {
      botaoNotaMesa.style.display = "block";
    }
  }
  atualizarVisualDaCamara();
  gerirObjetosNoCenario();
  iniciarRelogio();
  iniciarConsumoBateria();
  iniciarSonsAmbienteEntidade();
  iniciarMovimentoMonstro();
  let musicaTema = document.getElementById("som-tema-principal");
  if (musicaTema) {
    musicaTema.volume = 0.4;
    musicaTema.play().catch((erro) => {});
  }
};

// Jumpscare
function executarJumpscare(callback) {
  let overlay = document.getElementById("jumpscare-overlay");
  if (!overlay) {
    if (callback) callback();
    return;
  }

  // Primeiro som de jumpscare com VOLUME MÁXIMO
  let somJumpscare = document.getElementById("som-monstro-porta-esq");
  if (somJumpscare) {
    somJumpscare.currentTime = 0;
    somJumpscare.volume = 1.0;
    somJumpscare.play().catch((e) => {});
  }

  // Eco
  setTimeout(() => {
    let somJumpscare2 = document.getElementById("som-monstro-porta-dir");
    if (somJumpscare2) {
      somJumpscare2.currentTime = 0;
      somJumpscare2.volume = 0.9;
      somJumpscare2.play().catch((e) => {});
    }
  }, 80);

  // Pausa o tema principal
  let musicaTema = document.getElementById("som-tema-principal");
  if (musicaTema) {
    musicaTema.pause();
  }

  const img1 = document.getElementById("jumpscare-img1");
  const img2 = document.getElementById("jumpscare-img2");

  if (!img1 || !img2) {
    overlay.style.display = "flex";
    setTimeout(() => {
      overlay.style.display = "none";
      if (callback) callback();
    }, 2000);
    return;
  }

  img1.style.display = "block";
  img1.style.opacity = "1";
  img2.style.display = "none";
  img2.style.opacity = "0";

  overlay.classList.add("tremer");

  let flickerInterval;
  let currentImage = 1;
  const flickerDelay = 80;

  function alternarImagens() {
    if (currentImage === 1) {
      img1.style.display = "none";
      img1.style.opacity = "0";
      img2.style.display = "block";
      img2.style.opacity = "1";
      currentImage = 2;
    } else {
      img2.style.display = "none";
      img2.style.opacity = "0";
      img1.style.display = "block";
      img1.style.opacity = "1";
      currentImage = 1;
    }
  }

  overlay.style.display = "flex";

  setTimeout(() => {
    flickerInterval = setInterval(alternarImagens, flickerDelay);
  }, 50);

  setTimeout(() => {
    clearInterval(flickerInterval);
    overlay.classList.remove("tremer");
    overlay.style.display = "none";
    if (callback) callback();
  }, 2000);
}

//Funções para o som

function tocarSomMenu() {
  let som = document.getElementById("som-clique");
  if (som) {
    som.currentTime = 0;
    som.volume = 0.3;
    som.play().catch((e) => {});
  }
}

function tocarSomColetavel() {
  let som = document.getElementById("som-coletavel");
  if (som) {
    som.currentTime = 0;
    som.volume = 0.3;
    som.play().catch((e) => {});
  }
}

function tocarSomFecharMonitor() {
  let som = document.getElementById("som-fechar-monitor");
  if (som) {
    som.currentTime = 0;
    som.volume = 1;
    som.play().catch((e) => {});
  }
}

// Alerta depois do som
function mostrarAlertaAposSom(somId, mensagem, callback) {
  let som = document.getElementById(somId);
  if (som) {
    som.currentTime = 0;
    som.volume = 0.3;
    som.play().catch((e) => console.log("Áudio bloqueado"));

    let duracaoSom =
      som.duration && !isNaN(som.duration) ? som.duration * 1000 : 500;

    setTimeout(() => {
      alert(mensagem);
      if (callback) callback();
    }, duracaoSom);
  } else {
    alert(mensagem);
    if (callback) callback();
  }
}

// Abrir bilhete com som de coletável
function abrirBilheteDrWilliamsComSom() {
  tocarSomColetavel();
  setTimeout(() => {
    abrirBilheteDrWilliams();
  }, 50);
}

// Movimento do Monstro
function iniciarMovimentoMonstro() {
  setInterval(function () {
    let chanceMovimento = Math.min(
      0.3 + (MONSTRO_A_DIFICULDADE - 5) * 0.1,
      0.9,
    );
    let dadoAleatorio = Math.random();

    if (dadoAleatorio <= chanceMovimento) {
      calcularProximoPasso();
    }
  }, 10000);
}

function calcularProximoPasso() {
  let posicaoAtual = localStorage.getItem("posicaoMonstro");
  let novaPosicao = posicaoAtual;

  switch (posicaoAtual) {
    case "cam07_arrumos":
      novaPosicao = Math.random() < 0.5 ? "cam06_caixas" : "cam05_artigos";
      break;
    case "cam06_caixas":
      novaPosicao =
        Math.random() < 0.5 ? "cam05_artigos" : "cam01_corredor_esquerdo";
      break;
    case "cam05_artigos":
      novaPosicao =
        Math.random() < 0.5
          ? "cam01_corredor_esquerdo"
          : "cam02_corredor_direito";
      break;
    case "cam01_corredor_esquerdo":
      novaPosicao = Math.random() < 0.6 ? "porta_esquerda" : "cam03_limpeza";
      break;
    case "cam03_limpeza":
      novaPosicao = "cam07_arrumos";
      break;
    case "cam02_corredor_direito":
      novaPosicao =
        Math.random() < 0.6 ? "porta_direita" : "cam04_casa_de_banho";
      break;
    case "cam04_casa_de_banho":
      novaPosicao = "cam02_corredor_direito";
      break;
    case "porta_esquerda":
      if (portaEsquerdaFechada) {
        novaPosicao = "cam07_arrumos";
      } else {
        executarJumpscare(() => {
          window.location.href = "game_over.html";
        });
        return;
      }
      break;
    case "porta_direita":
      if (portaDireitaFechada) {
        novaPosicao = "cam07_arrumos";
      } else {
        executarJumpscare(() => {
          window.location.href = "game_over.html";
        });
        return;
      }
      break;
  }

  if (novaPosicao !== posicaoAtual) {
    localStorage.setItem("posicaoMonstro", novaPosicao);
    atualizarVisualDaCamara();
    gerirObjetosNoCenario();
  }
}

// Controlos no gabinete
function alternarPortaEsquerda() {
  if (energiaAcabou) return;
  let imagemGabinete = document.getElementById("cenario-gabinete");
  let botaoPorta = document.querySelector(".painel-esquerdo .btn-porta");
  if (!imagemGabinete) return;
  portaEsquerdaFechada = !portaEsquerdaFechada;
  if (portaEsquerdaFechada) luzEsquerdaAcesa = false;
  let somPorta = document.getElementById("som-porta");
  if (somPorta) {
    somPorta.currentTime = 0;
    somPorta.play();
  }
  if (portaEsquerdaFechada) {
    botaoPorta.classList.add("trancado");
  } else {
    botaoPorta.classList.remove("trancado");
  }
  renderizarGabinete(imagemGabinete);
}

function alternarPortaDireita() {
  if (energiaAcabou) return;
  let imagemGabinete = document.getElementById("cenario-gabinete");
  let botaoPorta = document.querySelector(".painel-direito .btn-porta");
  if (!imagemGabinete) return;
  portaDireitaFechada = !portaDireitaFechada;
  if (portaDireitaFechada) luzDireitaAcesa = false;
  let somPorta = document.getElementById("som-porta");
  if (somPorta) {
    somPorta.currentTime = 0;
    somPorta.play();
  }
  if (portaDireitaFechada) {
    botaoPorta.classList.add("trancado");
  } else {
    botaoPorta.classList.remove("trancado");
  }
  renderizarGabinete(imagemGabinete);
}

function acenderLuzEsquerda() {
  if (energiaAcabou) return;
  let imagemGabinete = document.getElementById("cenario-gabinete");
  if (!imagemGabinete || portaEsquerdaFechada) return;
  luzEsquerdaAcesa = true;
  let somLuz = document.getElementById("som-luz");
  if (somLuz) {
    somLuz.currentTime = 0;
    somLuz.play();
  }
  let localAtualDoMonstro = localStorage.getItem("posicaoMonstro");
  if (localAtualDoMonstro === "porta_esquerda") {
    let somMonstroEsq = document.getElementById("som-monstro-porta-esq");
    if (somMonstroEsq) {
      somMonstroEsq.currentTime = 0;
      somMonstroEsq.play().catch((e) => {});
    }
  }
  renderizarGabinete(imagemGabinete);
}

function acenderLuzDireita() {
  if (energiaAcabou) return;
  let imagemGabinete = document.getElementById("cenario-gabinete");
  if (!imagemGabinete || portaDireitaFechada) return;
  luzDireitaAcesa = true;
  let somLuz = document.getElementById("som-luz");
  if (somLuz) {
    somLuz.currentTime = 0;
    somLuz.play();
  }
  let localAtualDoMonstro = localStorage.getItem("posicaoMonstro");
  if (localAtualDoMonstro === "porta_direita") {
    let somMonstroDir = document.getElementById("som-monstro-porta-dir");
    if (somMonstroDir) {
      somMonstroDir.currentTime = 0;
      somMonstroDir.play().catch((e) => {});
    }
  }
  renderizarGabinete(imagemGabinete);
}

function apagarLuzes() {
  if (energiaAcabou) return;
  let imagemGabinete = document.getElementById("cenario-gabinete");
  if (!imagemGabinete) return;
  luzEsquerdaAcesa = false;
  luzDireitaAcesa = false;
  renderizarGabinete(imagemGabinete);
}

function renderizarGabinete(imagemGabinete) {
  let localAtualDoMonstro = localStorage.getItem("posicaoMonstro");
  if (portaEsquerdaFechada && portaDireitaFechada) {
    imagemGabinete.src = "images/gabinete_portas.png";
    return;
  }
  if (portaEsquerdaFechada) {
    if (luzDireitaAcesa) {
      imagemGabinete.src =
        localAtualDoMonstro === "porta_direita"
          ? "images/gabinete_p_esq_fechada_luz_dir_monstro.png"
          : "images/gabinete_p_esq_fechada_luz_dir_vazia.png";
    } else {
      imagemGabinete.src = "images/gabinete_porta_esquerda.png";
    }
    return;
  }
  if (portaDireitaFechada) {
    if (luzEsquerdaAcesa) {
      imagemGabinete.src =
        localAtualDoMonstro === "porta_esquerda"
          ? "images/gabinete_p_dir_fechada_luz_esq_monstro.png"
          : "images/gabinete_p_dir_fechada_luz_esq_vazia.png";
    } else {
      imagemGabinete.src = "images/gabinete_porta_direita.png";
    }
    return;
  }
  if (luzEsquerdaAcesa) {
    imagemGabinete.src =
      localAtualDoMonstro === "porta_esquerda"
        ? "images/gabinete_luz_esquerda_monstro.png"
        : "images/gabinete_luz_esquerda.png";
    return;
  }
  if (luzDireitaAcesa) {
    imagemGabinete.src =
      localAtualDoMonstro === "porta_direita"
        ? "images/gabinete_luz_direita_monstro.png"
        : "images/gabinete_luz_direita.png";
    return;
  }
  imagemGabinete.src = "images/gabinete_base.png";
}

// Transição e gestão do monitor
function abrirMonitor() {
  monitorAberto = true;
  document.getElementById("vista-gabinete").style.display = "none";
  document.getElementById("vista-monitor").style.display = "flex";

  let somMonitor = document.getElementById("som-monitor");
  if (somMonitor) {
    somMonitor.currentTime = 0;
    somMonitor.play().catch((erro) => {});
  }

  atualizarVisualDaCamara();
  gerirObjetosNoCenario();
}

function fecharMonitor() {
  document.getElementById("vista-monitor").style.display = "none";
  document.getElementById("vista-gabinete").style.display = "block";
  monitorAberto = false;
}

function mudarParaCamara(nomeCamara) {
  tocarSomMenu();

  camaraAtualNoMonitor = nomeCamara;

  document.querySelectorAll(".btn-cam-mapa").forEach((botao) => {
    botao.classList.remove("ativa");
  });

  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add("ativa");
  }

  atualizarVisualDaCamara();
  gerirObjetosNoCenario();
}

function atualizarVisualDaCamara() {
  let imagemCenario = document.getElementById("imagem-monitor");
  let textoIndicador = document.querySelector(".id-camara-texto");
  if (!textoIndicador) return;
  let posicaoMonstro = localStorage.getItem("posicaoMonstro");
  const titulosSalas = {
    cam01_corredor_esquerdo: "CAM 01 - CORREDOR ESQUERDO",
    cam02_corredor_direito: "CAM 02 - CORREDOR DIREITO",
    cam03_limpeza: "CAM 03 - QUARTO DA LIMPEZA",
    cam04_casa_de_banho: "CAM 04 - CASAS DE BANHO",
    cam05_artigos: "CAM 05 - ZONA DE ARTIGOS",
    cam06_caixas: "CAM 06 - LINHA DAS CAIXAS",
    cam07_arrumos: "CAM 07 - ARRUMOS",
  };
  if (titulosSalas[camaraAtualNoMonitor]) {
    textoIndicador.innerText = titulosSalas[camaraAtualNoMonitor];
  } else {
    textoIndicador.innerText = camaraAtualNoMonitor
      .replace("_", " ")
      .toUpperCase();
  }
  if (imagemCenario) {
    if (camaraAtualNoMonitor === posicaoMonstro) {
      imagemCenario.src = `images/${camaraAtualNoMonitor}_com_monstro.png`;
    } else {
      imagemCenario.src = `images/${camaraAtualNoMonitor}_vazia.png`;
    }
  }
}

// Coleção de objetos em cena
function gerirObjetosNoCenario() {
  let btnPlanta = document.getElementById("coletavel-planta");
  let btnJornal1 = document.getElementById("coletavel-jornal1");
  let btnJornal2 = document.getElementById("coletavel-jornal2");
  let btnEmail1 = document.getElementById("coletavel-email1");
  let btnEmail2 = document.getElementById("coletavel-email2");
  let btnAudio = document.getElementById("coletavel-audio");
  let btnEmailFinal = document.getElementById("coletavel-email-final");

  if (
    !btnPlanta ||
    !btnJornal1 ||
    !btnJornal2 ||
    !btnEmail1 ||
    !btnEmail2 ||
    !btnAudio ||
    !btnEmailFinal
  )
    return;

  btnPlanta.style.display = "none";
  btnJornal1.style.display = "none";
  btnJornal2.style.display = "none";
  btnEmail1.style.display = "none";
  btnEmail2.style.display = "none";
  btnAudio.style.display = "none";
  btnEmailFinal.style.display = "none";

  let posicaoMonstro = localStorage.getItem("posicaoMonstro");
  if (camaraAtualNoMonitor === posicaoMonstro) return;
  if (!objetoEstaVisivelAGora || camaraOndeEstaOObjeto === "") return;

  if (camaraAtualNoMonitor === camaraOndeEstaOObjeto) {
    if (horaAtual === 12 && localStorage.getItem("plantaEdificio") !== "true") {
      btnPlanta.style.display = "block";
    } else if (
      horaAtual === 1 &&
      localStorage.getItem("jornalPagina1") !== "true"
    ) {
      btnJornal1.style.display = "block";
    } else if (
      horaAtual === 2 &&
      localStorage.getItem("jornalPagina2") !== "true"
    ) {
      btnJornal2.style.display = "block";
    } else if (
      horaAtual === 3 &&
      localStorage.getItem("pistaEmail") !== "true"
    ) {
      btnEmail1.style.display = "block";
    } else if (
      horaAtual === 4 &&
      localStorage.getItem("pistaEmail2") !== "true"
    ) {
      btnEmail2.style.display = "block";
    } else if (
      horaAtual === 5 &&
      localStorage.getItem("pistaAudio") !== "true"
    ) {
      btnAudio.style.display = "block";
    } else if (
      horaAtual === 6 &&
      localStorage.getItem("pistaEmailFinal") !== "true"
    ) {
      btnEmailFinal.style.display = "block";
    }
  }
}

// Apanhar coletável com som antes do alerta
function apanharColetavel(chavePista) {
  let mensagens = {
    plantaEdificio:
      "🗺️ PLANTA RECOLHIDA: Obtiveste o mapa técnico do complexo. (Câmaras ativadas no Arquivo Geral)",
    jornalPagina1:
      "📰 RECORTE DE JORNAL #1: Recolheste os arquivos sobre o caso Benson e os primeiros desaparecimentos de fardas. Disponível no terminal.",
    jornalPagina2:
      "📰 RECORTE DE JORNAL #2: Encontraste o artigo sobre o noclip dos polícias e a intervenção do M.E.G. nos arquivos.",
    pistaEmail:
      "💾 PRIMEIRO E-MAIL: Descarregaste os registos dos biólogos sobre o isolamento com as placas de chumbo.",
    pistaEmail2:
      "💾 SEGUNDO E-MAIL: Relatório do Dr. Williams a avisar que a sua equipa científica foi totalmente chacinada.",
    pistaAudio:
      "📟 GRAVAÇÃO DE ÁUDIO: Recuperaste os registos de voz de emergência deixados pela equipa Williams.",
    pistaEmailFinal:
      "🚨 E-MAIL FINAL DESCARREGADO: Descobriste a resposta do Comando Central... O mundo lá fora foi consumido pelas Backrooms.",
  };

  let mensagem = mensagens[chavePista];
  if (mensagem) {
    mostrarAlertaAposSom("som-coletavel", mensagem, () => {
      localStorage.setItem(chavePista, "true");
      gerirObjetosNoCenario();
    });
  } else {
    localStorage.setItem(chavePista, "true");
    gerirObjetosNoCenario();
  }
}

// Tempo e progressão
function iniciarRelogio() {
  setInterval(function () {
    minutosAtuais += 10;
    if (minutosAtuais >= 60) {
      minutosAtuais = 0;
      if (horaAtual === 12) {
        horaAtual = 1;
      } else {
        horaAtual++;
      }

      MONSTRO_A_DIFICULDADE = Math.min(MONSTRO_A_DIFICULDADE + 2, 19);
    }
    if (horaAtual === 7) {
      localStorage.setItem("jogoGanho", "true");
      window.location.href = "vitoria.html";
      return;
    }
    let textoFormatadoMinutos = minutosAtuais === 0 ? "00" : minutosAtuais;
    document.getElementById("relogio").innerText =
      `${horaAtual}:${textoFormatadoMinutos} AM`;
    gerirObjetosNoCenario();
  }, 10000);
}

// Bateria e consumo
function iniciarConsumoBateria() {
  setInterval(function () {
    if (bateria <= 0) return;
    let barrasConsumo = 1;
    if (luzEsquerdaAcesa) barrasConsumo += 1;
    if (luzDireitaAcesa) barrasConsumo += 1;
    if (portaEsquerdaFechada) barrasConsumo += 1;
    if (portaDireitaFechada) barrasConsumo += 1;
    if (monitorAberto) barrasConsumo += 1;
    let perdaBateria = 0.15 * barrasConsumo;
    bateria -= perdaBateria;
    if (bateria < 0) bateria = 0;
    let simbolosBarras = "|".repeat(barrasConsumo);
    document.getElementById("bateria").innerText =
      `BATERIA: ${Math.ceil(bateria)}% (USO: ${simbolosBarras})`;
    if (bateria <= 0) {
      let musicaTema = document.getElementById("som-tema-principal");
      if (musicaTema) {
        musicaTema.pause();
      }
      tratarFaltaDeEnergia();
    }
  }, 1000);
}

function tratarFaltaDeEnergia() {
  if (energiaAcabou) return;
  energiaAcabou = true;

  let botoesPorta = document.querySelectorAll(".btn-porta");
  let botoesLuz = document.querySelectorAll(".btn-luz");
  botoesPorta.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("desativado");
  });
  botoesLuz.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("desativado");
  });

  let imagemGabinete = document.getElementById("cenario-gabinete");
  if (imagemGabinete) imagemGabinete.src = "images/gabinete_base.png";

  executarJumpscare(() => {
    window.location.href = "game_over.html";
  });
}

// Mistério do bilhete final
function interagirMisterio() {
  let imagemPrincipal = document.getElementById("misterio-escape");
  let botaoJornal = document.getElementById("item-jornal-final");
  if (!imagemPrincipal) return;
  if (misterioFase === 0) {
    imagemPrincipal.src = "images/escape_rotativo_clique.png";
    setTimeout(function () {
      imagemPrincipal.src = "images/escape_revelado.png";
      misterioFase = 1;
      if (botaoJornal) {
        botaoJornal.style.display = "block";
      }
    }, 300);
  }
}

// Apanhar Jornal Final com som antes do alerta
function apanharJornalFinal() {
  let som = document.getElementById("som-clique");
  if (som) {
    som.currentTime = 0;
    som.volume = 0.5;
    som.play().catch((e) => console.log("Áudio bloqueado"));

    let duracaoSom =
      som.duration && !isNaN(som.duration) ? som.duration * 1000 : 800;

    setTimeout(() => {
      localStorage.setItem("jogoGanho", "true");
      localStorage.setItem("chaveDesbloqueio", "true");
      alert(
        "🚨 ARQUIVO RECUPERADO: A verdade sobre o colapso global foi adicionada ao terminal de segurança.",
      );
      document.getElementById("item-jornal-final").style.display = "none";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    }, duracaoSom);
  } else {
    localStorage.setItem("jogoGanho", "true");
    localStorage.setItem("chaveDesbloqueio", "true");
    alert(
      "🚨 ARQUIVO RECUPERADO: A verdade sobre o colapso global foi adicionada ao terminal de segurança.",
    );
    document.getElementById("item-jornal-final").style.display = "none";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  }
}

function abrirBilheteDrWilliams() {
  document.getElementById("pop-up-bilhete").style.display = "block";
}

function fecharBilheteDrWilliams() {
  let popup = document.getElementById("pop-up-bilhete");
  if (popup) {
    popup.style.display = "none";
  }

  let botaoNotaMesa = document.getElementById("bilhete-secretaria");
  if (botaoNotaMesa) {
    botaoNotaMesa.style.display = "none";
  }

  try {
    localStorage.setItem("notaWilliamsLida", "true");
    sessionStorage.setItem("sessao_em_curso", "true");
  } catch (erro) {
    console.error(
      "[ERRO DE SISTEMA] Falha ao gravar dados no armazenamento:",
      erro,
    );
  }
}

function iniciarSonsAmbienteEntidade() {
  setInterval(function () {
    if (bateria <= 0) return;
    let somSorteado = Math.floor(Math.random() * 3) + 1;
    let audioParaTocar = document.getElementById(`som-entidade-${somSorteado}`);
    if (audioParaTocar) {
      audioParaTocar.currentTime = 0;
      audioParaTocar.play().catch((erro) => {});
    }
  }, 40000);
}

function voltarAoMenuPrincipal() {
  tocarSomMenu();
  setTimeout(() => {
    localStorage.removeItem("posicaoMonstro");
    window.location.href = "index.html";
  }, 100);
}

function validarEEntrar() {
  let checkboxMarcar = document.getElementById("termoAceitacao").checked;
  if (!checkboxMarcar) {
    alert(
      "❌ OPERAÇÃO RECUSADA: Deves aceitar e marcar a caixa dos termos de confidencialidade da empresa antes de submeter.",
    );
    return;
  }
  if (!assinouAlgo) {
    alert(
      "❌ ASSINATURA EM FALTA: É obrigatório assinar digitalmente o painel do operador para autenticar o teu turno.",
    );
    return;
  }
  let dadosDaAssinatura = canvas.toDataURL();
  localStorage.setItem("assinaturaSalva", dadosDaAssinatura);
  localStorage.setItem("contratoValidado", "true");
  window.location.href = "jogo.html";
}

function limparAssinatura() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  assinouAlgo = false;
  localStorage.removeItem("assinaturaSalva");
  localStorage.removeItem("contratoValidado");
  document.getElementById("termoAceitacao").checked = false;
}

// Captura da assinatura salva
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("telaAssinatura");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let aDesenhar = false;
    let assinouAlgo = false;
    ctx.strokeStyle = "#00ff78";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#00ff78";
    let assinaturaGuardada = localStorage.getItem("assinaturaSalva");
    let contratoJaValidado = localStorage.getItem("contratoValidado");
    if (assinaturaGuardada && contratoJaValidado === "true") {
      let img = new Image();
      img.src = signatureGuardada = assinaturaGuardada;
      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        assinouAlgo = true;
        let chk = document.getElementById("termoAceitacao");
        if (chk) chk.checked = true;
      };
    }
    canvas.addEventListener("mousedown", (e) => {
      aDesenhar = true;
      assinouAlgo = true;
      ctx.beginPath();
      ctx.moveTo(obterPosicao(e).x, obterPosicao(e).y);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (!aDesenhar) return;
      ctx.lineTo(obterPosicao(e).x, obterPosicao(e).y);
      ctx.stroke();
    });
    window.addEventListener("mouseup", () => {
      aDesenhar = false;
    });
    canvas.addEventListener("touchstart", (e) => {
      aDesenhar = true;
      assinouAlgo = true;
      ctx.beginPath();
      ctx.moveTo(obterPosicao(e.touches[0]).x, obterPosicao(e.touches[0]).y);
      e.preventDefault();
    });
    canvas.addEventListener("touchmove", (e) => {
      if (!aDesenhar) return;
      ctx.lineTo(obterPosicao(e.touches[0]).x, obterPosicao(e.touches[0]).y);
      ctx.stroke();
      e.preventDefault();
    });
    window.addEventListener("touchend", () => {
      aDesenhar = false;
    });
    function obterPosicao(evento) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (evento.clientX || evento.touches[0].clientX) - rect.left,
        y: (evento.clientY || evento.touches[0].clientY) - rect.top,
      };
    }
    window.limparAssinatura = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      assinouAlgo = false;
      localStorage.removeItem("assinaturaSalva");
      localStorage.removeItem("contratoValidado");
      let chk = document.getElementById("termoAceitacao");
      if (chk) chk.checked = false;
    };
    window.validarEEntrar = function () {
      let checkboxMarcar = document.getElementById("termoAceitacao");
      let isChecked = checkboxMarcar ? checkboxMarcar.checked : false;
      if (!isChecked) {
        alert(
          "❌ OPERAÇÃO RECUSADA: Deves aceitar e marcar a caixa dos termos antes de submeter.",
        );
        return;
      }
      if (!assinouAlgo) {
        alert(
          "❌ ASSINATURA EM FALTA: É obrigatório assinar digitalmente o painel.",
        );
        return;
      }
      try {
        localStorage.setItem("assinaturaSalva", canvas.toDataURL());
        localStorage.setItem("contratoValidated", "true");
      } catch (err) {
        console.log(err);
      }
      window.location.href = "jogo.html";
    };
    const btnLimpar = document.getElementById("btn-limpar-traco");
    const btnEntrar = document.getElementById("btn-entrar-turnos");
    const aplicarHover = (elemento, isEntrar) => {
      if (!elemento) return;
      elemento.addEventListener("mouseover", () => {
        elemento.style.backgroundColor = "#ff3333";
        elemento.style.color = "#000000";
        elemento.style.boxShadow = "0 0 20px #ff3333";
        elemento.style.transform = "scale(1.05)";
      });
      elemento.addEventListener("mouseout", () => {
        elemento.style.backgroundColor = "rgba(20, 5, 5, 0.85)";
        elemento.style.color = "#ff3333";
        elemento.style.boxShadow = isEntrar
          ? "0 0 10px rgba(255, 50, 50, 0.1)"
          : "none";
        elemento.style.transform = "scale(1)";
      });
    };
    aplicarHover(btnLimpar, false);
    aplicarHover(btnEntrar, true);
  });
})();

// Teletransporte e piscar dos colecionáveis
setInterval(function () {
  const camarasPossiveis = [
    "cam01_corredor_esquerdo",
    "cam02_corredor_direito",
    "cam03_limpeza",
    "cam04_casa_de_banho",
    "cam05_artigos",
    "cam06_caixas",
    "cam07_arrumos",
  ];
  objetoEstaVisivelAGora = !objetoEstaVisivelAGora;
  if (objetoEstaVisivelAGora) {
    let indiceAleatorio = Math.floor(Math.random() * camarasPossiveis.length);
    camaraOndeEstaOObjeto = camarasPossiveis[indiceAleatorio];
  }
  if (monitorAberto) {
    gerirObjetosNoCenario();
  }
}, 5000);
