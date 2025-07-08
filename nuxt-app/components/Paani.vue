<template>
  <canvas ref="canvas" class="sand-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps } from 'vue';

const props = defineProps({
  progress: { type: Number, default: 0 },
  flushing: { type: Boolean, default: false },
  isRunning: { type: Boolean, default: false },
  remainingMinutes: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 }
});

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number;

const particleCount = 250;
const particles: { x: number; y: number; length: number; speed: number }[] = [];
let canvasHeight = 0;
let waveOffset = 0;
let animatedProgress = 0;
let lightningFlash = 0;
let thunderTimer = 0;

function resizeCanvas() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    canvasHeight = window.innerHeight;
    // Ensure canvas covers full viewport
    canvas.value.style.width = '100vw';
    canvas.value.style.height = '100vh';
  }
}

function initParticles() {
  particles.length = 0;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 8 + 4, // raindrop length
      speed: Math.random() * 2 + 0.8 // drizzle speed
    });
  }
}

function resetParticles() {
  particles.length = 0;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 8 + 4, // raindrop length
      speed: Math.random() * 2 + 0.8 // drizzle speed
    });
  }
}

function drawPuddle(waterLevel: number) {
  if (!ctx || !canvas.value) return;
  
  // Ensure waterLevel is valid
  if (isNaN(waterLevel) || waterLevel < 0) {
    waterLevel = canvas.value.height * 0.1; // fallback to 10% from bottom
  }
  
  // Draw multiple layers for depth effect
  const layers = [
    { opacity: 0.3, waveOffset: waveOffset * 0.5, amplitude: 8 },
    { opacity: 0.5, waveOffset: waveOffset * 0.8, amplitude: 12 },
    { opacity: 0.7, waveOffset: waveOffset, amplitude: 10 }
  ];
  
  for (const layer of layers) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-10, waterLevel);
    const frequency = 0.015;
    for (let x = -10; x <= canvas.value.width + 10; x += 2) {
      const y = waterLevel + Math.sin(x * frequency + layer.waveOffset) * layer.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.value.width + 10, canvas.value.height);
    ctx.lineTo(-10, canvas.value.height);
    ctx.closePath();
    ctx.fillStyle = `rgba(66, 184, 255, ${layer.opacity})`;
    ctx.shadowColor = `rgba(66, 184, 255, ${layer.opacity * 0.4})`;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles() {
  if (!ctx || !canvas.value) return;
  
  // Clear the canvas first
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  
  // Weather phases based on progress percentage
  const isPhase1 = props.progressPercentage >= 0.3 && props.progressPercentage < 0.5; // 30-50%
  const isPhase2 = props.progressPercentage >= 0.5 && props.progressPercentage < 0.7; // 50-70%
  const isPhase3 = props.progressPercentage >= 0.7 && props.progressPercentage < 0.8; // 70-80%
  const isPhase4 = props.progressPercentage >= 0.8 && props.progressPercentage < 0.95; // 80-95%
  const isFinalPhase = props.progressPercentage >= 0.95 && props.progressPercentage < 1; // 95-100%
  
  // Background darkening effects
  if (isPhase1 || isPhase2 || isPhase3 || isPhase4 || isFinalPhase) {
    let stormIntensity = 0;
    if (isPhase1) {
      stormIntensity = (props.progressPercentage - 0.3) / 0.2; // 0 to 1 over phase 1
    } else if (isPhase2) {
      stormIntensity = 1 + (props.progressPercentage - 0.5) / 0.2; // 1 to 2 over phase 2
    } else if (isPhase3) {
      stormIntensity = 2 + (props.progressPercentage - 0.7) / 0.1; // 2 to 3 over phase 3
    } else if (isPhase4) {
      stormIntensity = 3 + (props.progressPercentage - 0.8) / 0.15; // 3 to 4 over phase 4
    } else if (isFinalPhase) {
      stormIntensity = 4; // Maintain maximum intensity in final phase
    }
    
    ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * stormIntensity})`;
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
    
    // Lightning flash (after 70%)
    if ((isPhase3 || isPhase4) && lightningFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 200, ${lightningFlash * 0.4})`;
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      lightningFlash -= 0.1;
    }
  }
  
  const waterLevel = canvas.value.height - canvas.value.height * animatedProgress;
  
  // Only draw particles if timer hasn't ended (progress < 1)
  if (props.progress < 1) {
    // Rain intensity based on phases
    let rainIntensity = 1;
    let rainOpacity = 0.5;
    let rainWidth = 1.2;
    
    if (isPhase1) {
      rainIntensity = 1.3;
      rainOpacity = 0.55;
      rainWidth = 1.3;
    } else if (isPhase2) {
      rainIntensity = 1.6;
      rainOpacity = 0.6;
      rainWidth = 1.4;
    } else if (isPhase3) {
      rainIntensity = 2;
      rainOpacity = 0.7;
      rainWidth = 1.6;
    } else if (isPhase4) {
      rainIntensity = 2.5;
      rainOpacity = 0.8;
      rainWidth = 2;
    } else if (isFinalPhase) {
      rainIntensity = 2.5;
      rainOpacity = 0.8;
      rainWidth = 2;
    }
    
    ctx.strokeStyle = `rgba(66, 184, 255, ${rainOpacity})`;
    ctx.lineWidth = rainWidth;
    
    for (let i = 0; i < particles.length * rainIntensity; i++) {
      const p = particles[i % particles.length];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.length);
      ctx.stroke();
    }
  }
  
  // Always draw the puddle
  drawPuddle(waterLevel);
}

function updateParticles() {
  const waterLevel = canvasHeight - canvasHeight * animatedProgress;
  const speedMultiplier = props.isRunning ? 2.5 : 0.4;
  for (const p of particles) {
    p.y += p.speed * speedMultiplier;
    // If raindrop hits the puddle, respawn at the top
    if (p.y + p.length >= waterLevel) {
      p.y = 0;
      p.x = Math.random() * window.innerWidth;
    }
    // If particle is out of bounds at the bottom, respawn at the top
    if (p.y > canvasHeight) {
      p.y = 0;
      p.x = Math.random() * window.innerWidth;
    }
  }
}

function animate() {
  waveOffset += props.isRunning ? 0.08 : 0.01;
  
  // Lightning effects (after 70%)
  const isThunderPhase = props.progressPercentage >= 0.7 && props.progressPercentage < 0.95;
  
  if (isThunderPhase) {
    thunderTimer++;
    if (thunderTimer > 120 && Math.random() < 0.02) { // Random lightning every ~2 seconds
      lightningFlash = 1;
      thunderTimer = 0;
    }
  }
  
  // Smoothly interpolate animatedProgress toward props.progress or 0 if flushing
  if (props.flushing) {
    animatedProgress += (0 - animatedProgress) * 0.15;
    // Reset particles when flushing starts
    if (animatedProgress < 0.1) {
      resetParticles();
    }
  } else {
    animatedProgress += (props.progress - animatedProgress) * 0.08;
  }
  drawParticles();
  updateParticles();
  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  resizeCanvas();
  initParticles();
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
  }
  animate();
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
});

// Redraw when progress changes
watch(() => props.progress, () => {
  drawParticles();
});
</script>

<style scoped>
.sand-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style> 