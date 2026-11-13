/* ==========================================================================
   Bestand: script.js
   Project: HU Open-ICT Semester 1 - Project 3: In verbinding met onze tribes
   Product: TribeLink (Squad: ScrumGPT - Nick, Bart, Marvin, Harsha & start met Ekrem)
   Auteur: Harsha Vardhan Kanaparthi
   Periode: Oktober - 5 november 2026

   Uitleg van alle JavaScript-onderdelen in dit bestand:
   1. Mobiel menu & donker/licht thema (met veilige localStorage-opslag).
   2. HU-Schoolmail registratie & stap-voor-stap privacyprofiel (@student.hu.nl
      of @hu.nl controle + verplichte roepnaam/schuilnaam + minimaal 3 interesses).
   3. Interactieve Pixel-Lobby ("Het Hotel - Kantine"): klik op een vloertegel
      of gele kruk om je avatar door de ruimte te verplaatsen (inclusief gezellig
      naast een medestudent aan tafel zitten, n.a.v. onze Expo post-it feedback!),
      stuur een live kamerbericht en speel Boter-Kaas-en-Eieren tegen een Lobby-Bot.
   4. Ontmoeten-onderdelen:
      - IJsbreker kaartentrekker ("Gespreks-Ui" laag 1, 2 en 3) zonder dat
        dezelfde vraag twee keer achter elkaar verschijnt + kopieerknop.
      - Open Brief prikbord: schrijf een brief of reageer op brieven uit de tribe.
      - Persoonlijke QR-Poster ("Hi, I'm Harsha") live aanpassen en printen.
   5. Tribe-leden Matcher (real-time zoeken op hobby/naam) & Hangout Datumprikker
      waarbij de datum met de meeste stemmen automatisch "Best Passend" krijgt.
   6. Toegankelijke tabbladen voor ons Design Sprint & Scrum ontwikkelproces.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* --- Hulpfuncties voor veilige opslag in localStorage --- */
  function leesOpslag(sleutel, standaard) {
    try {
      const ruw = window.localStorage.getItem(sleutel);
      return ruw ? JSON.parse(ruw) : standaard;
    } catch {
      return standaard;
    }
  }

  function schrijfOpslag(sleutel, waarde) {
    try {
      window.localStorage.setItem(sleutel, JSON.stringify(waarde));
    } catch {
      // Geen foutmelding als de browser opslag blokkeert in een iframe
    }
  }

  /* ------------------------------------------------------------------------
     1. Navigatiemenu & Licht/Donker Thema
     ------------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    mainNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const themeBtn = document.getElementById("themeBtn");
  const opgeslagenThema = leesOpslag("tribelink_theme", "light");
  if (opgeslagenThema === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeBtn) themeBtn.textContent = "Lichte modus";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const donker = document.documentElement.getAttribute("data-theme") === "dark";
      if (donker) {
        document.documentElement.removeAttribute("data-theme");
        themeBtn.textContent = "Donkere modus";
        schrijfOpslag("tribelink_theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeBtn.textContent = "Lichte modus";
        schrijfOpslag("tribelink_theme", "dark");
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. HU-Schoolmail Registratie & Interesses (US: Anoniem Inloggen + Interesses)
        Alleen @student.hu.nl (of @hu.nl voor coaches) wordt geaccepteerd!
     ------------------------------------------------------------------------ */
  const beschikbareTags = [
    "Gaming", "Python", "React & Web", "Bowlen", "Koffie & Thee",
    "Muziek", "Cybersecurity", "AI & Data", "Bordspellen", "Sport & Fitness"
  ];

  let profielState = leesOpslag("tribelink_profiel", {
    email: "harsha.kanaparthi@student.hu.nl",
    roepnaam: "Harsha",
    handle: "@harsha20062",
    zichtbaarheid: "deels",
    tags: ["Python", "React & Web", "Gaming", "AI & Data"]
  });

  const headerUserBadge = document.getElementById("headerUserBadge");
  const emailInput = document.getElementById("huEmailInput");
  const aliasInput = document.getElementById("aliasInput");
  const privacySelect = document.getElementById("privacySelect");
  const tagContainer = document.getElementById("profileTagCloud");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const profileFeedback = document.getElementById("profileFeedback");

  const posterTitle = document.getElementById("posterTitle");
  const posterHandle = document.getElementById("posterHandle");
  const posterMsg = document.getElementById("posterMsg");
  const posterBioInput = document.getElementById("posterBioInput");

  function werkProfielWeergaveBij() {
    if (headerUserBadge) {
      headerUserBadge.textContent = `${profielState.roepnaam} (${profielState.handle})`;
    }
    if (emailInput) emailInput.value = profielState.email;
    if (aliasInput) aliasInput.value = profielState.roepnaam;
    if (privacySelect) privacySelect.value = profielState.zichtbaarheid;
    if (posterTitle) posterTitle.textContent = `Hi, I'm ${profielState.roepnaam}`;
    if (posterHandle) posterHandle.textContent = profielState.handle;

    if (tagContainer) {
      tagContainer.innerHTML = "";
      beschikbareTags.forEach((tag) => {
        const knop = document.createElement("button");
        knop.type = "button";
        const actief = profielState.tags.includes(tag);
        knop.className = `interest-tag${actief ? " is-selected" : ""}`;
        knop.setAttribute("aria-pressed", String(actief));
        knop.textContent = tag;
        knop.addEventListener("click", () => {
          if (profielState.tags.includes(tag)) {
            profielState.tags = profielState.tags.filter((t) => t !== tag);
          } else {
            profielState.tags.push(tag);
          }
          werkProfielWeergaveBij();
        });
        tagContainer.appendChild(knop);
      });
    }
  }

  werkProfielWeergaveBij();

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", () => {
      const mail = (emailInput ? emailInput.value : "").trim().toLowerCase();
      const naam = (aliasInput ? aliasInput.value : "").trim();
      if (emailInput) emailInput.classList.remove("is-invalid");
      if (aliasInput) aliasInput.classList.remove("is-invalid");

      // Eis uit onze backlog & security story: alleen HU-mailadressen mogen registreren
      const geldigHu = mail.endsWith("@student.hu.nl") || mail.endsWith("@hu.nl");
      if (!geldigHu) {
        if (emailInput) emailInput.classList.add("is-invalid");
        if (profileFeedback) {
          profileFeedback.hidden = false;
          profileFeedback.className = "status-msg err";
          profileFeedback.textContent =
            "Gebruik een geldig @student.hu.nl (of @hu.nl voor coaches) e-mailadres om TribeLink veilig binnen de HU te houden.";
        }
        return;
      }

      if (naam.length < 2) {
        if (aliasInput) aliasInput.classList.add("is-invalid");
        if (profileFeedback) {
          profileFeedback.hidden = false;
          profileFeedback.className = "status-msg err";
          profileFeedback.textContent = "Vul een roepnaam of schuilnaam in (minimaal 2 tekens).";
        }
        return;
      }

      if (profielState.tags.length < 3) {
        if (profileFeedback) {
          profileFeedback.hidden = false;
          profileFeedback.className = "status-msg err";
          profileFeedback.textContent = "Kies minimaal 3 interesses zodat de Tribe-matcher goed werkt.";
        }
        return;
      }

      profielState.email = mail;
      profielState.roepnaam = naam;
      profielState.handle = "@" + naam.toLowerCase().replace(/[^a-z0-9]/g, "") + "_hu";
      profielState.zichtbaarheid = privacySelect ? privacySelect.value : "deels";
      schrijfOpslag("tribelink_profiel", profielState);
      werkProfielWeergaveBij();
      tekenHotelKamer();

      if (profileFeedback) {
        profileFeedback.hidden = false;
        profileFeedback.className = "status-msg ok";
        profileFeedback.textContent =
          `Opgeslagen! Welkom ${profielState.roepnaam} — jouw HU-mail is geverifieerd en je privacy staat op '${profielState.zichtbaarheid}'.`;
      }
    });
  }

  if (posterBioInput && posterMsg) {
    posterBioInput.addEventListener("input", () => {
      posterMsg.textContent =
        posterBioInput.value.trim() || "Let's connect and start a conversation.";
    });
  }

  const printPosterBtn = document.getElementById("printPosterBtn");
  if (printPosterBtn) {
    printPosterBtn.addEventListener("click", () => window.print());
  }

  /* ------------------------------------------------------------------------
     3. HET HOTEL — Interactieve Pixel-Lobby (Kantine 6x5) + Minigame
        Centraal gemaakt na onze Sprint 1 Review feedback ("focus op het hotel!")
     ------------------------------------------------------------------------ */
  const roomGridEl = document.getElementById("hotelRoomGrid");
  const hotelChatFeed = document.getElementById("hotelChatFeed");
  const hotelChatInput = document.getElementById("hotelChatInput");
  const hotelChatSend = document.getElementById("hotelChatSend");
  const gameProposalSelect = document.getElementById("gameProposalSelect");
  const proposeGameBtn = document.getElementById("proposeGameBtn");

  // Vaste elementen en medestudenten in de Kantine (rij 0..4, kolom 0..5)
  const kamerObjecten = {
    "0-0": { type: "plant", tekst: "Plant", icoon: "🌿" },
    "0-2": { type: "npc", tekst: "@nick_vb", icoon: "🕹️" },
    "0-5": { type: "plant", tekst: "Plant", icoon: "🌿" },
    "1-1": { type: "chair", tekst: "Tafel 1", icoon: "🪑" },
    "1-2": { type: "chair", tekst: "Tafel 1", icoon: "🪑" },
    "1-4": { type: "npc", tekst: "@bart2", icoon: "💻" },
    "2-2": { type: "rug", tekst: "Kleed", icoon: "🟦" },
    "2-3": { type: "rug", tekst: "Kleed", icoon: "🟦" },
    "3-1": { type: "npc", tekst: "@marvin_a", icoon: "🎧" },
    "3-4": { type: "chair", tekst: "Speltafel", icoon: "🎲" },
    "4-0": { type: "lamp", tekst: "Lamp", icoon: "💡" },
    "4-5": { type: "bot", tekst: "LobbyBot", icoon: "🤖" }
  };

  let mijnPositie = { r: 2, c: 1, actie: "" };

  function voegHotelBerichtToe(afzender, tekst) {
    if (!hotelChatFeed) return;
    const p = document.createElement("p");
    const sterk = document.createElement("strong");
    sterk.textContent = `${afzender}: `;
    p.appendChild(sterk);
    p.appendChild(document.createTextNode(tekst));
    hotelChatFeed.appendChild(p);
    hotelChatFeed.scrollTop = hotelChatFeed.scrollHeight;
  }

  function tekenHotelKamer() {
    if (!roomGridEl) return;
    roomGridEl.innerHTML = "";

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const sleutel = `${r}-${c}`;
        const obj = kamerObjecten[sleutel];
        const isIk = mijnPositie.r === r && mijnPositie.c === c;

        const tegel = document.createElement("button");
        tegel.type = "button";
        let extraKlas = "";
        if (obj && obj.type === "rug") extraKlas = " rug";
        if (obj && obj.type === "chair") extraKlas = " chair";
        if (isIk) extraKlas += " has-me";

        tegel.className = `room-tile${extraKlas}`;
        tegel.setAttribute(
          "aria-label",
          `Kantine tegel rij ${r + 1} kolom ${c + 1}${obj ? " met " + obj.tekst : ""}`
        );

        if (isIk && obj && obj.type === "npc") {
          // Grappige knipoog naar de oranje post-it op onze Expo: samen op/naast een plek zitten!
          tegel.innerHTML = `<span class="avatar-sprite">🧑🤝${obj.icoon}</span><span>Samen!</span>`;
        } else if (isIk) {
          const icoon = mijnPositie.actie === "zwaai" ? "👋" : mijnPositie.actie === "dans" ? "🕺" : "🧑";
          tegel.innerHTML = `<span class="avatar-sprite">${icoon}</span><span>${profielState.roepnaam}</span>`;
        } else if (obj) {
          tegel.innerHTML = `<span class="avatar-sprite">${obj.icoon}</span><span>${obj.tekst}</span>`;
        } else {
          tegel.innerHTML = `<span>&middot;</span>`;
        }

        tegel.addEventListener("click", () => {
          mijnPositie = { r, c, actie: "" };
          tekenHotelKamer();
          if (obj && obj.type === "npc") {
            voegHotelBerichtToe("Systeem", `Je bent gezellig naast ${obj.tekst} gaan zitten! Start gerust een gesprek.`);
          } else if (obj && obj.type === "chair") {
            voegHotelBerichtToe("Systeem", `${profielState.roepnaam} nam plaats bij ${obj.tekst}.`);
          }
        });

        roomGridEl.appendChild(tegel);
      }
    }
  }

  tekenHotelKamer();

  document.querySelectorAll("[data-avatar-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-avatar-action") || "";
      mijnPositie.actie = act;
      tekenHotelKamer();
      if (act === "zwaai") {
        voegHotelBerichtToe(profielState.roepnaam, "zwaait naar iedereen in de Kantine! 👋");
      } else if (act === "dans") {
        voegHotelBerichtToe(profielState.roepnaam, "doet een korte pixel-dance op het kleed! 🕺");
      }
    });
  });

  function verstuurKamerChat() {
    if (!hotelChatInput) return;
    const tekst = hotelChatInput.value.trim();
    if (!tekst) return;
    voegHotelBerichtToe(profielState.roepnaam, tekst);
    hotelChatInput.value = "";
  }

  if (hotelChatSend) hotelChatSend.addEventListener("click", verstuurKamerChat);
  if (hotelChatInput) {
    hotelChatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        verstuurKamerChat();
      }
    });
  }

  if (proposeGameBtn && gameProposalSelect) {
    proposeGameBtn.addEventListener("click", () => {
      const spel = gameProposalSelect.value;
      voegHotelBerichtToe(
        profielState.roepnaam,
        `stelt voor om samen '${spel}' te spelen aan de Speltafel! Wie doet mee?`
      );
    });
  }

  /* --- Minigame in de Lobby: Boter-Kaas-en-Eieren tegen LobbyBot --- */
  const tttBoardEl = document.getElementById("tttBoard");
  const tttStatusEl = document.getElementById("tttStatus");
  const tttResetBtn = document.getElementById("tttResetBtn");
  let bord = Array(9).fill("");
  let spelKlaar = false;

  const winLijnen = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function checkWinnaar(b) {
    for (const [a, c, d] of winLijnen) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return b.every((v) => v !== "") ? "gelijk" : null;
  }

  function tekenTtt() {
    if (!tttBoardEl) return;
    tttBoardEl.innerHTML = "";
    bord.forEach((waarde, idx) => {
      const cel = document.createElement("button");
      cel.type = "button";
      cel.className = "ttt-cell";
      cel.textContent = waarde;
      cel.setAttribute("aria-label", `Vakje ${idx + 1}: ${waarde || "leeg"}`);
      cel.addEventListener("click", () => speelZet(idx));
      tttBoardEl.appendChild(cel);
    });
  }

  function speelZet(idx) {
    if (spelKlaar || bord[idx] !== "") return;
    bord[idx] = "X";
    let status = checkWinnaar(bord);
    if (status) {
      rondTttAf(status);
      tekenTtt();
      return;
    }

    // Eenvoudige AI-bot zet (kiest midden als vrij, anders een vrij vakje)
    const vrij = bord.map((v, i) => (v === "" ? i : -1)).filter((i) => i !== -1);
    if (vrij.length > 0) {
      const botKeuze = vrij.includes(4) ? 4 : vrij[0];
      bord[botKeuze] = "O";
    }
    status = checkWinnaar(bord);
    if (status) rondTttAf(status);
    tekenTtt();
  }

  function rondTttAf(uitkomst) {
    spelKlaar = true;
    if (!tttStatusEl) return;
    if (uitkomst === "X") {
      tttStatusEl.textContent = "Gewonnen! Jij versloeg de LobbyBot (X wint).";
    } else if (uitkomst === "O") {
      tttStatusEl.textContent = "LobbyBot wint deze ronde (O). Daag een medestudent uit!";
    } else {
      tttStatusEl.textContent = "Gelijkspel! Klik op Nieuw potje voor een revanche.";
    }
  }

  if (tttResetBtn) {
    tttResetBtn.addEventListener("click", () => {
      bord = Array(9).fill("");
      spelKlaar = false;
      if (tttStatusEl) tttStatusEl.textContent = "Jij speelt met X tegen LobbyBot (O). Klik op een vakje!";
      tekenTtt();
    });
  }
  tekenTtt();

  /* ------------------------------------------------------------------------
     4. ONTMOETEN HUB: IJsbreker ("Gespreks-Ui") & Open Brief Prikbord
     ------------------------------------------------------------------------ */
  const ijsbrekerVragen = {
    laag1: [
      "Welke plek in het HU-gebouw vind jij tot nu toe het fijnst om te werken?",
      "Koffie, thee of energiedrank om een vroege tribe-ochtend door te komen?",
      "Met welke trein- of buslijn reis jij meestal naar Utrecht Science Park?"
    ],
    laag2: [
      "Welke game, serie of hobby kan jij uren achter elkaar doen zonder de tijd te merken?",
      "Als onze tribe volgende week één groepsuitje doet (bowlen, karten, bordspelavond), waar stem jij op?",
      "Welk onderdeel van ICT vind je tot nu toe stiekem het leukst: design, frontend, backend of security?"
    ],
    laag3: [
      "Wat is een grappig weetje of 'persoonlijke lore' over jou dat bijna niemand in de tribe nog weet?",
      "Waar was je op de eerste schooldag van Open-ICT het meest zenuwachtig voor, en hoe kijk je daar nu op terug?",
      "Als je over vier jaar je HBO-diploma haalt, wat hoop je dan gebouwd of bereikt te hebben?"
    ]
  };

  let vorigeVraag = "";
  const layerSelect = document.getElementById("onionLayerSelect");
  const drawCardBtn = document.getElementById("drawIcebreakerBtn");
  const copyCardBtn = document.getElementById("copyIcebreakerBtn");
  const cardBox = document.getElementById("icebreakerCard");
  const cardText = document.getElementById("icebreakerText");
  const copyStatus = document.getElementById("copyStatus");

  if (drawCardBtn && layerSelect && cardText && cardBox) {
    drawCardBtn.addEventListener("click", () => {
      const laag = layerSelect.value || "laag2";
      const lijst = ijsbrekerVragen[laag] || ijsbrekerVragen.laag2;
      // Kwaliteitscriterium uit mijn User Story: nooit twee keer achter elkaar dezelfde vraag!
      const kandidaten = lijst.filter((v) => v !== vorigeVraag);
      const gekozen = kandidaten[Math.floor(Math.random() * kandidaten.length)];
      vorigeVraag = gekozen;

      cardBox.classList.add("is-flipped");
      setTimeout(() => cardBox.classList.remove("is-flipped"), 180);
      cardText.textContent = gekozen;
      if (copyStatus) copyStatus.textContent = "";
    });
  }

  if (copyCardBtn && cardText) {
    copyCardBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cardText.textContent || "");
        if (copyStatus) copyStatus.textContent = "Vraag gekopieerd naar klembord!";
      } catch {
        if (copyStatus) copyStatus.textContent = "Selecteer de tekst hierboven om te kopiëren.";
      }
    });
  }

  /* --- Open Brief Prikbord (US: Ontmoeten: Open brief) --- */
  let openBrieven = leesOpslag("tribelink_brieven", [
    {
      auteur: "@kagan_s1",
      tekst: "Lijkt het iemand leuk om donderdag na het tribe-moment nog een uurtje Codenames of Minecraft te spelen?",
      reacties: 2
    },
    {
      auteur: "@isabel_hu",
      tekst: "Ik zoek nog een rustige studiegenoot om samen Laravel-routes en Git branches door te nemen zonder haast!",
      reacties: 1
    }
  ]);

  const lettersListEl = document.getElementById("openLettersList");
  const letterInput = document.getElementById("openLetterInput");
  const postLetterBtn = document.getElementById("postLetterBtn");

  function tekenOpenBrieven() {
    if (!lettersListEl) return;
    lettersListEl.innerHTML = "";
    openBrieven.forEach((brief, idx) => {
      const div = document.createElement("div");
      div.className = "hangout-card";
      div.innerHTML = `
        <strong>${brief.auteur}</strong>
        <p style="margin: 0.3rem 0 0.5rem 0; font-size: 0.86rem;"></p>
        <button type="button" class="btn-util" data-reply-idx="${idx}">
          Start chat / Beantwoord brief (${brief.reacties})
        </button>
      `;
      div.querySelector("p").textContent = brief.tekst;
      div.querySelector("button").addEventListener("click", () => {
        openBrieven[idx].reacties += 1;
        schrijfOpslag("tribelink_brieven", openBrieven);
        voegHotelBerichtToe(
          "Open Brief",
          `${profielState.roepnaam} opende een chat naar aanleiding van de brief van ${brief.auteur}!`
        );
        tekenOpenBrieven();
      });
      lettersListEl.appendChild(div);
    });
  }
  tekenOpenBrieven();

  if (postLetterBtn && letterInput) {
    postLetterBtn.addEventListener("click", () => {
      const val = letterInput.value.trim();
      if (val.length < 5) return;
      openBrieven.unshift({ auteur: profielState.handle, tekst: val, reacties: 0 });
      schrijfOpslag("tribelink_brieven", openBrieven);
      letterInput.value = "";
      tekenOpenBrieven();
    });
  }

  /* ------------------------------------------------------------------------
     5. TRIBE-LEDEN MATCHER & HANGOUT DATUMPRIKKER
     ------------------------------------------------------------------------ */
  const tribeLeden = [
    { naam: "Nick (ScrumGPT)", rol: "Student · Game & Frontend", tags: ["Gaming", "React & Web", "Bordspellen"] },
    { naam: "Bart (ScrumGPT)", rol: "Student · Infra & Laravel", tags: ["Cybersecurity", "Python", "Koffie & Thee"] },
    { naam: "Marvin (ScrumGPT)", rol: "Student · UI & Fullstack", tags: ["React & Web", "Muziek", "Bowlen"] },
    { naam: "Harsha (ScrumGPT)", rol: "Student · AI, Web & Laravel", tags: ["Python", "AI & Data", "React & Web", "Gaming"] },
    { naam: "Nathalie (Tribe B)", rol: "Student · Sociale Verbinder", tags: ["Bowlen", "Koffie & Thee", "Muziek"] },
    { naam: "Kees (Tribe A)", rol: "Student · Rustige Gamer", tags: ["Gaming", "Bordspellen", "Python"] },
    { naam: "Sander (Coach)", rol: "Open-ICT Coach", tags: ["Koffie & Thee", "AI & Data", "Bordspellen"] }
  ];

  const memberSearchInput = document.getElementById("memberSearchInput");
  const memberFilterSelect = document.getElementById("memberFilterSelect");
  const memberGridEl = document.getElementById("memberGrid");
  const memberEmptyMsg = document.getElementById("memberEmptyMsg");

  function tekenLedenGrid() {
    if (!memberGridEl) return;
    const zoek = (memberSearchInput ? memberSearchInput.value : "").trim().toLowerCase();
    const tagFilter = memberFilterSelect ? memberFilterSelect.value : "alle";

    const gefilterd = tribeLeden.filter((lid) => {
      const tekstMatch =
        !zoek ||
        lid.naam.toLowerCase().includes(zoek) ||
        lid.rol.toLowerCase().includes(zoek) ||
        lid.tags.some((t) => t.toLowerCase().includes(zoek));
      const tagMatch = tagFilter === "alle" || lid.tags.includes(tagFilter);
      return tekstMatch && tagMatch;
    });

    memberGridEl.innerHTML = "";
    if (memberEmptyMsg) {
      memberEmptyMsg.hidden = gefilterd.length > 0;
    }

    gefilterd.forEach((lid) => {
      const card = document.createElement("article");
      card.className = "member-card";
      card.innerHTML = `
        <h4 style="margin-bottom: 0.2rem;">${lid.naam}</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.45rem;">${lid.rol}</p>
        <div class="tag-cloud">${lid.tags.map((t) => `<span class="pill">${t}</span>`).join("")}</div>
      `;
      memberGridEl.appendChild(card);
    });
  }

  if (memberSearchInput) memberSearchInput.addEventListener("input", tekenLedenGrid);
  if (memberFilterSelect) memberFilterSelect.addEventListener("change", tekenLedenGrid);
  tekenLedenGrid();

  /* --- Hangouts & Datumprikker ("Best Passend" label automatisch berekend) --- */
  let hangouts = leesOpslag("tribelink_hangouts", [
    {
      titel: "Tribe Bowlingavond Utrecht",
      categorie: "Uitje",
      locatie: "Bison Bowling Utrecht",
      max: 16,
      organisator: "Marvin & Nathalie",
      datums: [
        { label: "Do 12 nov · 18:30", stemmen: 7 },
        { label: "Vr 13 nov · 19:00", stemmen: 5 }
      ]
    },
    {
      titel: "Koffie & Bordspellen na de sprint",
      categorie: "Koffie & Spel",
      locatie: "HU Padualaan 99 · Foodcourt",
      max: 10,
      organisator: "Harsha & Nick",
      datums: [
        { label: "Di 10 nov · 15:30", stemmen: 4 },
        { label: "Wo 11 nov · 16:00", stemmen: 6 }
      ]
    }
  ]);

  const hangoutListEl = document.getElementById("hangoutList");
  const hoTitle = document.getElementById("hoTitle");
  const hoCat = document.getElementById("hoCat");
  const hoLoc = document.getElementById("hoLoc");
  const hoMax = document.getElementById("hoMax");
  const addHangoutBtn = document.getElementById("addHangoutBtn");
  const hoError = document.getElementById("hoError");

  function tekenHangouts() {
    if (!hangoutListEl) return;
    hangoutListEl.innerHTML = "";

    hangouts.forEach((h, hIdx) => {
      const hoogsteStem = Math.max(...h.datums.map((d) => d.stemmen));
      const blok = document.createElement("div");
      blok.className = "hangout-card";

      const titelEl = document.createElement("div");
      titelEl.innerHTML = `<strong></strong> <span class="pill"></span>`;
      titelEl.querySelector("strong").textContent = h.titel;
      titelEl.querySelector(".pill").textContent = `${h.categorie} · Max ${h.max}`;
      blok.appendChild(titelEl);

      const metaP = document.createElement("p");
      metaP.style.fontSize = "0.82rem";
      metaP.style.margin = "0.25rem 0 0.45rem 0";
      metaP.textContent = `Locatie: ${h.locatie} · Organisator: ${h.organisator}`;
      blok.appendChild(metaP);

      h.datums.forEach((d, dIdx) => {
        const rij = document.createElement("div");
        rij.className = "date-vote-row";
        const isBeste = d.stemmen === hoogsteStem && d.stemmen > 0;
        rij.innerHTML = `
          <span>${d.label} &mdash; <strong>${d.stemmen} ja-stemmen</strong> ${
          isBeste ? '<span class="best-badge">Best Passend</span>' : ""
        }</span>
          <button type="button" class="btn-util">Stem Ja (+1)</button>
        `;
        rij.querySelector("button").addEventListener("click", () => {
          hangouts[hIdx].datums[dIdx].stemmen += 1;
          schrijfOpslag("tribelink_hangouts", hangouts);
          tekenHangouts();
        });
        blok.appendChild(rij);
      });

      hangoutListEl.appendChild(blok);
    });
  }
  tekenHangouts();

  if (addHangoutBtn) {
    addHangoutBtn.addEventListener("click", () => {
      const t = (hoTitle ? hoTitle.value : "").trim();
      const l = (hoLoc ? hoLoc.value : "").trim();
      const m = Number(hoMax ? hoMax.value : 0);
      if (hoTitle) hoTitle.classList.remove("is-invalid");
      if (hoLoc) hoLoc.classList.remove("is-invalid");

      if (!t || !l || m < 2) {
        if (!t && hoTitle) hoTitle.classList.add("is-invalid");
        if (!l && hoLoc) hoLoc.classList.add("is-invalid");
        if (hoError) {
          hoError.hidden = false;
          hoError.textContent = "Vul een titel, locatie en geldig maximum aantal deelnemers (>= 2) in.";
        }
        return;
      }

      if (hoError) hoError.hidden = true;
      hangouts.unshift({
        titel: t,
        categorie: hoCat ? hoCat.value : "Koffie",
        locatie: l,
        max: m,
        organisator: profielState.roepnaam,
        datums: [
          { label: "Optie 1: Dinsdag 16:00", stemmen: 1 },
          { label: "Optie 2: Donderdag 16:30", stemmen: 0 }
        ]
      });
      schrijfOpslag("tribelink_hangouts", hangouts);
      if (hoTitle) hoTitle.value = "";
      if (hoLoc) hoLoc.value = "";
      tekenHangouts();
    });
  }

  /* ------------------------------------------------------------------------
     6. Toegankelijke Proces-Tabbladen (Design Sprint, Sprint 1 & 2, DevOps/Server)
     ------------------------------------------------------------------------ */
  const tabBtns = Array.from(document.querySelectorAll(".tab-btn"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

  function wisselTab(gekozen, focus = false) {
    const doel = gekozen.getAttribute("aria-controls");
    tabBtns.forEach((b) => {
      const sel = b === gekozen;
      b.setAttribute("aria-selected", String(sel));
      b.setAttribute("tabindex", sel ? "0" : "-1");
    });
    tabPanels.forEach((p) => {
      p.hidden = p.id !== doel;
    });
    if (focus) gekozen.focus();
  }

  tabBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => wisselTab(btn, false));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        wisselTab(tabBtns[(i + 1) % tabBtns.length], true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        wisselTab(tabBtns[(i - 1 + tabBtns.length) % tabBtns.length], true);
      }
    });
  });
});
