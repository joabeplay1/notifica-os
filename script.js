const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const quickStopBtn = document.getElementById('quick-stop');
const overlayBg = document.getElementById('central-alert-frame');
let agendamentosAtivos = [];
let somAtivo = null;

// ====== REGISTRO DO SERVICE WORKER EM SEGUNDO PLANO ======
let serviceWorkerReg = null;

if ('serviceWorker' in navigator && 'Notification' in window) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                serviceWorkerReg = registration;
                console.log('Service Worker ativo com sucesso!');
                
                // Solicita permissão para notificações nativas no PC
                if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            console.log('Permissão de notificações concedida.');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao registrar o Service Worker:', error);
            });
    });
}

// ====== LÓGICA DE INSTALAÇÃO DO APLICATIVO (PWA) ======
let eventoInstalacao = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalacao = e;
    console.log('Jesus Reina pronto para ser instalado no sistema!');
});

window.addEventListener('appinstalled', () => {
    console.log('Obrigado por instalar o Jesus Reina!');
    eventoInstalacao = null;
});

// ====== CANVAS DOS SININHOS ======
const canvas = document.getElementById('notification-canvas');
const ctx = canvas.getContext('2d');
let bellsList = [];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

class FloatingBellParticle {
    constructor() { this.reset(); this.y = Math.random() * canvas.height; }
    reset() {
        this.x = Math.random() * canvas.width; this.y = canvas.height + 80;
        this.size = Math.random() * 20 + 20; this.speedY = Math.random() * 0.5 + 0.3;
        this.opacity = Math.random() * 0.15 + 0.05; this.swing = Math.random() * 0.02;
    }
    update() { this.y -= this.speedY; this.x += Math.sin(this.y * this.swing) * 0.5; if (this.y < -80) this.reset(); }
    draw() {
        ctx.save(); ctx.font = `${this.size}px "Font Awesome 6 Free"`; ctx.fontWeight = "900";
        ctx.fillStyle = `rgba(0, 210, 255, ${this.opacity})`; ctx.fillText('\uf0f3', this.x, this.y); ctx.restore();
    }
}
function initCanvasBells() { for (let i = 0; i < 45; i++) bellsList.push(new FloatingBellParticle()); }
function animateCanvasBells() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bellsList.forEach(b => { b.update(); b.draw(); }); requestAnimationFrame(animateCanvasBells);
}
initCanvasBells(); animateCanvasBells();

// ====== LETREIROS BÍBLICOS NEON INTEGRADOS ======
const listVersesNeon = [
    'AMAI-VOS UNS AOS OUTROS', 'EU SOU O CAMINHO', 'TEREIS AFLIÇÕES, MAS TENDE BOM ÂNIMO',
    'BUSCAI PRIMEIRO O REINO DE DEUS', 'TUDO É POSSÍVEL AO QUE CRÊ', 'A MINHA PAZ VOS DOU',
    'VENHAM A MIM', 'NÃO TEMAS, CRÊ SOMENTE', 'EU SOU A LUZ DO MUNDO', 'SEJA FEITA A TUA VONTADE',
    'TUDO POSSO NAQUELA QUE ME FORTALECE.', 'O SENHOR É O MEU PASTOR; NADA ME FALTARÁ.',
    'ENTREGA O TEU CAMINHO AO SENHOR; CONFIA NELE, E ELE TUDO FARÁ.',
    'PORQUE DEUS AMOU O MUNDO DE TAL MANEIRA QUE DEU O SEU FILHO UNIGÊNITO.',
    'SE DEUS É POR NÓS, QUEM SERÁ CONTRA NÓS?', 'O CHORO PODE DURAR UMA NOITE, MAS A ALEGRIA VEM PELA MANHÃ.',
    'A FÉ REMOVE MONTANHAS.', 'NÃO TEMAS, PORQUE EU SOU CONTIGO.',
    'O AMOR TUDO SOFRE, TUDO CRÊ, TUDO ESPERA, TUDO SUPORTA.', 'BEM-AVENTURADOS OS QUE PROMOVEM A PAZ.',
    'A MINHA GRAÇA TE BASTA.', 'CONFIA NO SENHOR DE TODO O TEU CORAÇÃO.',
    'O SENHER LUTARÁ POR VOCÊS.', 'EM DEUS FAREMOS PROEZAS.', 'TUDO TEM O SEU TEMPO DETERMINADO.',
    'SEDE FORTES E CORAJOSOS.', 'PEDI, E DAR-SE-VOS-Á.', 'ALEGRAI-VOS NA ESPERANÇA.',
    'O SENHOR É A MINHA LUZ E A MINHA SALVAÇÃO.'
];
const neonColorsClasses = ['neon-cyan', 'neon-gold', 'neon-green', 'neon-purple'];

function spawnNeonVerse() {
    const container = document.querySelector('.dynamic-verses-container');
    if (!container) return;

    if (container.children.length > 5) return;

    const span = document.createElement('span');
    const randomColor = neonColorsClasses[Math.floor(Math.random() * neonColorsClasses.length)];
    span.className = `dynamic-verse-particle ${randomColor}`;
    span.innerText = listVersesNeon[Math.floor(Math.random() * listVersesNeon.length)];
    
    span.style.left = `${Math.random() * 43 + 5}vw`;
    span.style.animationDuration = `${Math.random() * 4 + 14}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), 18000);
}
setInterval(spawnNeonVerse, 3200);

// ====== MEMÓRIA (LOCAL STORAGE) ======
function salvarDados() { localStorage.setItem('jesus_reina_vFinal_Neon_Fix', JSON.stringify(agendamentosAtivos)); }
function carregarDados() {
    const dados = localStorage.getItem('jesus_reina_vFinal_Neon_Fix');
    if (dados) {
        agendamentosAtivos = JSON.parse(dados);
        agendamentosAtivos.forEach(ev => sendNotify(ev.title, ev.time));
    }
}

function desligarAlerta() {
    if (somAtivo) { somAtivo.pause(); somAtivo.currentTime = 0; somAtivo = null; }
    quickStopBtn.classList.remove('stop-btn-active');
    overlayBg.classList.add('hidden');
}

function sendNotify(title, time) {
    const card = document.createElement('div');
    card.className = 'notification';
    card.innerHTML = `<h4>${title}</h4><p>Agendado para ${time}</p>`;
    notificationArea.prepend(card);
}

document.getElementById('open-menu').onclick = () => sideMenu.classList.add('active');
document.getElementById('close-menu').onclick = () => sideMenu.classList.remove('active');

document.getElementById('save-event').onclick = () => {
    const title = document.getElementById('event-title').value;
    const time = document.getElementById('event-time').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const soundFile = document.getElementById('event-sound').files[0];
    const imageFile = document.getElementById('event-image').files[0];
    const days = Array.from(document.querySelectorAll('.days-selector input:checked')).map(cb => parseInt(cb.value));

    if (title && time) {
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : '';
        const soundUrl = soundFile ? URL.createObjectURL(soundFile) : '';
        
        agendamentosAtivos.push({ title, time, desc, date, days, imageUrl, soundUrl, tocadoHoje: false });
        salvarDados();
        sendNotify(title, time);
        sideMenu.classList.remove('active');
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
    }
};

// ====== MONITOR EM TEMPO REAL ======
setInterval(() => {
    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const dia = agora.getDay();
    const dataH = agora.toISOString().split('T')[0];

    agendamentosAtivos.forEach(ev => {
        const eDia = ev.days.length > 0 ? ev.days.includes(dia) : (ev.date === dataH);
        if (eDia && ev.time === hora && !ev.tocadoHoje) {
            ev.tocadoHoje = true;
            
            document.getElementById('central-alert-image').src = ev.imageUrl ? ev.imageUrl : '';
            document.getElementById('central-alert-text').innerHTML = `<h3>⏰ ${ev.title}</h3><p>${ev.desc}</p>`;
            overlayBg.classList.remove('hidden');

            // DISPARO DE SINAL SEGURO PARA NOTIFICAÇÃO NATIVA DO PC (SISTEMA OPERACIONAL)
            if (Notification.permission === 'granted') {
                const tituloNotificacao = `⏰ JESUS REINA: ${ev.title}`;
                const opcoesNotificacao = {
                    body: ev.desc || 'O horário do seu alarme chegou!',
                    requireInteraction: true // Mantém o balão fixo no PC até você fechar
                };

                if (serviceWorkerReg) {
                    serviceWorkerReg.showNotification(tituloNotificacao, opcoesNotificacao);
                } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'DISPARAR_ALERTA',
                        title: tituloNotificacao,
                        desc: ev.desc
                    });
                } else {
                    new Notification(tituloNotificacao, opcoesNotificacao);
                }
            }

            // REPRODUÇÃO DO ÁUDIO SELECIONADO PELO USUÁRIO
            if (ev.soundUrl) {
                if (somAtivo) desligarAlerta();
                somAtivo = new Audio(ev.soundUrl); somAtivo.loop = true; somAtivo.play();
                quickStopBtn.classList.add('stop-btn-active');
                
                document.getElementById('central-stop-btn').onclick = desligarAlerta;
                setTimeout(desligarAlerta, 900000); // Autodesliga após 15 minutos
            }
        }
        if (hora === "00:00") ev.tocadoHoje = false;
    });
}, 1000);

document.getElementById('clear-all').onclick = () => { agendamentosAtivos = []; salvarDados(); notificationArea.innerHTML = ''; };
window.onload = carregarDados;
