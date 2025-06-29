document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("radar");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.min(centerX, centerY) - 10;

  let currentAngle = 0;
  let mockDistance = 50;
  let buzzerActive = false;
  let lastBuzzTime = 0;
  const buzzCooldown = 1000;
  let animationId = null;
  let radarPaused = false;

  const distanceElement = document.getElementById("distance");
  const warningElement = document.getElementById("warning");
  const buzzerSound = document.getElementById("buzzerSound");
  const buzzerStatus = document.getElementById("buzzerStatus");

  buzzerSound.load();

  function drawRadar(angle, distance) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
    for (let r = maxRadius / 4; r <= maxRadius; r += maxRadius / 4) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    const rad = (angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + maxRadius * Math.cos(rad),
      centerY + maxRadius * Math.sin(rad)
    );
    ctx.strokeStyle = "#0f0";
    ctx.stroke();

    const dotRadius = (Math.min(distance, 100) / 100) * maxRadius;
    ctx.beginPath();
    ctx.arc(
      centerX + dotRadius * Math.cos(rad),
      centerY + dotRadius * Math.sin(rad),
      6,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = buzzerActive ? "#ff0000" : "#f00";
    ctx.fill();
  }

  function updateBuzzer(shouldBuzz) {
    const now = Date.now();

    if (shouldBuzz && !buzzerActive && now - lastBuzzTime > buzzCooldown) {
      activateBuzzer();
      pauseRadar(); // <== Stop radar here
    } else if (!shouldBuzz && buzzerActive) {
      stopBuzzer();
    }
  }

  function activateBuzzer() {
    buzzerActive = true;
    lastBuzzTime = Date.now();

    warningElement.textContent = "WARNING! Object too close!";
    warningElement.style.color = "#ff0000";
    warningElement.style.fontWeight = "bold";

    buzzerSound.loop = true;
    const playPromise = buzzerSound.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Autoplay prevented - needs user interaction");
        buzzerStatus.textContent = "Click to enable sound";
        document.addEventListener("click", enableSoundOnce, { once: true });
      });
    }

    buzzerStatus.textContent = "Status: ON (Too Close)";
  }

  function stopBuzzer() {
    buzzerActive = false;
    warningElement.textContent = "";
    buzzerSound.pause();
    buzzerSound.currentTime = 0;
    buzzerStatus.textContent = "Status: OFF";

    resumeRadar(); // <== Resume radar after stopping buzzer
  }

  function enableSoundOnce() {
    buzzerSound
      .play()
      .then(() => {
        buzzerStatus.textContent = "Status: ON";
      })
      .catch((error) => {
        console.error("Audio playback failed:", error);
      });
  }

  function animateRadar() {
    if (radarPaused) return;

    const time = Date.now() / 1000;
    mockDistance = 15 + Math.abs(Math.sin(time) * Math.cos(time * 0.7) * 85);
    currentAngle = (currentAngle + 1.5) % 360;

    drawRadar(currentAngle, mockDistance);
    distanceElement.textContent = `Distance: ${mockDistance.toFixed(1)} cm`;

    updateBuzzer(mockDistance <= 20);

    animationId = requestAnimationFrame(animateRadar);
  }

  function pauseRadar() {
    radarPaused = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function resumeRadar() {
    if (!radarPaused) return;
    radarPaused = false;
    animateRadar();
  }

  // Start radar on load
  animateRadar();

  // Clean up on unload
  window.addEventListener("beforeunload", () => {
    pauseRadar();
    stopBuzzer();
  });

  // Expose control functions globally
  window.activateBuzzer = activateBuzzer;
  window.stopBuzzer = stopBuzzer;
  window.resumeRadar = resumeRadar;
});
