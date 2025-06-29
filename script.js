async function fetchTemp() {
  try {
    const location = document.getElementById("location").value.toLowerCase();

    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=c77d1ac57a1f47018d763143252004&q=${location}&aqi=yes`
    );

    if (!response.ok) {
      throw new Error("could'nt fetch data");
    }
    const data = await response.json();
    const weatherImg = document.getElementById("weatherImg");
    const condition = document.querySelector(".condition");
    const temperature = document.querySelector(".temp");
    const region = document.querySelector(".region");
    const country = document.querySelector(".country");

    weatherImg.src = data.current.condition.icon;
    condition.textContent = data.current.condition.text;
    temperature.textContent = `Temp: ${data.current.temp_c}`;
    region.textContent = data.location.name;
    country.textContent = data.location.country;
    // console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// TOGGLE BUTTON FUNCTIONALITY
const toggleSwitch = document.getElementById("toggleSwitch");
const toggleStatus = document.getElementById("toggleStatus");

toggleSwitch.addEventListener("click", () => {
  toggleSwitch.classList.toggle("on");
  const isOn = toggleSwitch.classList.contains("on");
  toggleStatus.textContent = isOn ? "ON" : "OFF";
});

// VOICE CONTROL FUNCTIONALITY
const micBtn = document.getElementById("micBtn");

let isListening = false;

micBtn.addEventListener("click", () => {
  if (!isListening) {
    recognition.start();
    micBtn.classList.add("active");
    isListening = true;
  } else {
    recognition.stop();
    micBtn.classList.remove("active");
    isListening = false;
  }
});

const voiceBtn = document.getElementById("voiceControlBtn");

let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase().trim();
    console.log("Voice command:", command);

    // List of possible 'on' variations
    const onWords = ["on", "own", "awn", "an", "orn", "one"];
    const offWords = ["off", "of", "af", "opf", "orph", "uff"];

    const isOnCommand = onWords.some((word) => command.includes(word));
    const isOffCommand = offWords.some((word) => command.includes(word));

    if (isOnCommand && !toggleSwitch.classList.contains("on")) {
      toggleSwitch.click();
    } else if (isOffCommand && toggleSwitch.classList.contains("on")) {
      toggleSwitch.click();
    }

    micBtn.classList.remove("active");
    isListening = false;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.textContent = "Not Supported";
}

voiceBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
  }
});

// Simulated Sonar Network Gauge
const bars = document.querySelectorAll(".bar");
const networkStatus = document.getElementById("networkStatus");

function updateNetworkMeter(strength) {
  bars.forEach((bar, index) => {
    if (index < strength) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });

  const labels = [
    "No Signal",
    "Poor",
    "Fair",
    "Good",
    "Very Good",
    "Excellent",
  ];
  networkStatus.textContent = `Signal: ${labels[strength] || "Unknown"}`;
}

// Simulate signal strength changes every 3 seconds
setInterval(() => {
  const randomStrength = Math.floor(Math.random() * 6); // 0 to 5
  updateNetworkMeter(randomStrength);
}, 3000);

// BUZZER LOGIC
const buzzerSound = document.getElementById("buzzerSound");
const buzzerStatus = document.getElementById("buzzerStatus");
const stopBuzzerBtn = document.getElementById("stopBuzzerBtn");

// Make accessible globally
window.buzzerActive = false;

// Load the audio first
buzzerSound.load();

window.activateBuzzer = function (reason) {
  if (!window.buzzerActive) {
    window.buzzerActive = true;
    buzzerSound.loop = true;
    // Handle browser autoplay policies
    const playPromise = buzzerSound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Autoplay prevented:", error);
        // Show a button to let user start audio
        alert("Please click anywhere on the page to enable sound");
        document.body.onclick = () => {
          buzzerSound.play();
          document.body.onclick = null;
        };
      });
    }

    buzzerStatus.textContent = `Status: ON (${reason})`;
  }
};

stopBuzzerBtn.addEventListener("click", () => {
  if (typeof window.stopBuzzer === "function") {
    window.stopBuzzer(); // Use the radar.js version
  }
});
