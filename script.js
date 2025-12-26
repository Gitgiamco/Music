/* === Lógica preservada + mensaje fijo === */
const MSG = "FELIZ CUMPLEAÑOS"; // 16
const tubePairs = [
  ["char01","char02"], ["char11","char12"],
  ["char21","char22"], ["char31","char32"],
  ["char41","char42"], ["char51","char52"],
  ["char61","char62"], ["char71","char72"],
  ["char81","char82"], ["char91","char92"],
  ["char101","char102"], ["char111","char112"],
  ["char121","char122"], ["char131","char132"],
  ["char141","char142"], ["char151","char152"]
];
(function setMessage(){
  const chars = Array.from(MSG).map(c => c === ' ' ? '\u00A0' : c.toUpperCase());
  for (let i = 0; i < tubePairs.length; i++){
    const [a, b] = tubePairs[i];
    const ch = (i < chars.length) ? chars[i] : '\u00A0';
    const elA = document.getElementById(a);
    const elB = document.getElementById(b);
    if (elA) elA.textContent = ch;
    if (elB) elB.textContent = ch;
  }
})();

/* === 🎆 Fuegos artificiales: detrás y solo mientras el reloj está ON === */
const fwCanvas = document.getElementById('fireworks');
const fwCtx = fwCanvas.getContext('2d');
let FW_W, FW_H;
let fireworks = [];
let particles = [];
let spawnTimer = 0;         // temporizador para lanzar cohetes
let spawnEvery = 2420;       // cada N ms se lanzan cohetes
let lastT = performance.now();
let running = true;         // anima siempre el canvas; sólo spawnea si está ON

function resizeFW(){
  FW_W = fwCanvas.width = window.innerWidth;
  FW_H = fwCanvas.height = window.innerHeight;
}
resizeFW();
window.addEventListener('resize', resizeFW);

class Firework{
  constructor(x, y, targetY, color){
    this.x = x; this.y = y;
    this.tx = x; this.ty = targetY;
    this.color = color;
    this.vy = - (3 + Math.random()*2.5);
    this.vx = (Math.random()-0.5)*0.8;
    this.exploded = false;
  }
  update(dt){
    this.x += this.vx * dt*0.06;
    this.y += this.vy * dt*0.06;
    if (this.y <= this.ty){
      this.exploded = true;
      const n = 70 + Math.floor(Math.random()*40);
      for (let i=0;i<n;i++) particles.push(new Particle(this.x, this.y, this.color));
    }
  }
  draw(){
    fwCtx.beginPath();
    fwCtx.arc(this.x, this.y, 2, 0, Math.PI*2);
    fwCtx.fillStyle = this.color;
    fwCtx.fill();
  }
}

class Particle{
  constructor(x,y,color){
    this.x=x; this.y=y; this.color=color;
    const ang = Math.random()*Math.PI*2;
    const sp = 1 + Math.random()*4.5;
    this.vx = Math.cos(ang)*sp;
    this.vy = Math.sin(ang)*sp;
    this.alpha = 1;
    this.fade = 0.008 + Math.random()*0.02;
    this.gravity = 0.05;
    this.size = 1 + Math.random()*2;
  }
  update(dt){
    this.x += this.vx * dt*0.06;
    this.y += (this.vy + this.gravity) * dt*0.06;
    this.vx *= 0.992; this.vy *= 0.992;
    this.alpha -= this.fade * dt*0.06;
  }
  draw(){
    if (this.alpha<=0) return;
    fwCtx.globalAlpha = Math.max(this.alpha,0);
    fwCtx.beginPath();
    fwCtx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    fwCtx.fillStyle = this.color;
    fwCtx.fill();
    fwCtx.globalAlpha = 1;
  }
}

function randColor(){
  const colors = ['#ff6600','#ffd700','#ff2f86','#00ffff','#ff3c00','#00ff88','#ff5ee2','#8cff00'];
  return colors[(Math.random()*colors.length)|0];
}

function spawnBurst(){
  // Lanzar varios cohetes desde la parte baja hacia la mitad superior
  const count = 6 + (Math.random()*6)|0;
  for (let i=0;i<count;i++){
    const x = Math.random()*FW_W;
    const y = FW_H + Math.random()*40;
    const ty = Math.random()*(FW_H*0.45) + FW_H*0.05;
    fireworks.push(new Firework(x,y,ty,randColor()));
  }
}

function loop(t){
  const dt = Math.min(32, t - lastT); // limitar delta para estabilidad
  lastT = t;
  requestAnimationFrame(loop);

  // rastro tenue
  fwCtx.fillStyle = "rgba(0,0,0,0.2)";
  fwCtx.fillRect(0,0,FW_W,FW_H);

  // actualizar/lápizar
  for (let i=fireworks.length-1;i>=0;i--){
    const f = fireworks[i];
    f.update(dt);
    f.draw();
    if (f.exploded) fireworks.splice(i,1);
  }
  for (let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.update(dt);
    p.draw();
    if (p.alpha<=0) particles.splice(i,1);
  }

  // si el reloj está ON, spawnear periódicamente
  const isOn = !document.querySelector('.clock').classList.contains('off');
  if (isOn){
    spawnTimer += dt;
    if (spawnTimer >= spawnEvery){
      spawnTimer = 0;
      spawnBurst();
    }
  } else {
    // cuando está OFF no spawneamos; dejamos que se disipen
    spawnTimer = 0;
  }
}
requestAnimationFrame(loop);

// detectar pulsación del botón para iniciar un estallido inmediato al pasar a ON
const btn = document.querySelector('.button');
btn.addEventListener('click', () => {
  const isOn = !document.querySelector('.clock').classList.contains('off');
  // El toggle ya ocurrió por el onclick inline, así que invertimos la lectura:
  // Después del click, .off puede haber cambiado; damos un pequeño delay para leer el estado final.
  setTimeout(()=>{
    const nowOn = !document.querySelector('.clock').classList.contains('off');
    if (nowOn){
      // estallido instantáneo al encender
      spawnBurst();
    }
  },100);
});

const titulo = document.getElementById("titulo-apagado");
const boton = document.querySelector(".button");
const reloj = document.querySelector(".clock");

// Función que actualiza visibilidad
function actualizarTitulo() {
  if (reloj.classList.contains("off")) {
    titulo.style.opacity = "1";
  } else {
    titulo.style.opacity = "0";
  }
}

// Ejecutar al inicio
actualizarTitulo();

// Cada vez que se presione el botón
boton.addEventListener("click", () => {
  setTimeout(actualizarTitulo, 10); // pequeño delay para esperar la clase
});

const clockEl = document.querySelector(".clock");
const botonLampara = document.querySelector(".button");
const botonRegalo = document.getElementById("btn-regalo");
const audio = document.getElementById("birthday-music");

let timerRegalo = null;

botonLampara.addEventListener("click", () => {
  setTimeout(() => {
    const encendido = !clockEl.classList.contains("off");

    if (encendido) {
      audio.play();
      // Espera 3s y luego muestra el botón
      timerRegalo = setTimeout(() => {
        botonRegalo.classList.add("show");
      }, 1000);
    } else {
      audio.pause();
      // Si se apaga → ocultar y cancelar temporizador
      botonRegalo.classList.remove("show");
      clearTimeout(timerRegalo);
    }
  }, 100);
});

const pantalla = document.getElementById("pantalla-mensaje");
const botonRegalo2 = document.getElementById("btn-regalo");
const contenedor = document.getElementById("texto");

const mensaje = `
🕯️ Hoy es un día especial…  
porque el mundo celebra que existes.  

Cada momento contigo ilumina la vida,  
igual que una vela en la más dulce oscuridad.  

💛 Gracias por tu luz…   
💛 Gracias por ser tú.  

✨ Hoy deseo que tus sueños brillen  
más fuerte que todas las estrellas del cielo.  
Feliz Cumpleaños 🎂 ❤️
`;

let i = 0;

// Mostrar la pantalla cuando se presione "Abrir regalo"
botonRegalo2.addEventListener("click", () => {
  pantalla.style.display = "flex";

  // ocultar todo lo demás
  document.querySelector(".clock").style.display = "none";
  document.getElementById("titulo-apagado").style.display = "none";
  botonRegalo2.style.display = "none";
lanzarLuces();  
  setTimeout(() => escribir(), 100); 
});

// efecto letra por letra
function escribir(){
  contenedor.style.opacity = "1"; // <-- ESTA LÍNEA LO SOLUCIONA
  if(i < mensaje.length){
    contenedor.innerHTML += mensaje[i] === "\n" ? "<br>" : mensaje[i];
    i++;
    setTimeout(escribir, 15);
  } 
}


// luces finales
function lanzarLuces(){
  const luces = document.getElementById("luces");
  for(let i=0;i<60;i++){
    const s = document.createElement("span");
    s.style.left = Math.random()*100+"%";
    s.style.top = Math.random()*100+"%";
    s.style.animationDuration = (1.5 + Math.random()*2)+"s";
    s.style.animationDelay = (Math.random()*2)+"s";
    luces.appendChild(s);
  }
}
