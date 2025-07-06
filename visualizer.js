const fftSize = 1024;
const barSpacing = 0;
const barColorBase = [100, 50, 50];

const audioFileInput = document.getElementById('audioFile');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const barCountSlider = document.getElementById('barCountSlider');

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Fix for high-DPI (Retina) displays
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

// Set the actual drawing buffer size
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

// Scale the context so your drawings are crisp
ctx.scale(dpr, dpr);


function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

audioFileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const reader = new FileReader();

  reader.onload = function (event) {
    audioContext.decodeAudioData(event.target.result, function (buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      const bufferLength = analyser.frequencyBinCount; // 512
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      // Current barCount from slider
      let barCount = parseInt(barCountSlider.value);

      // Update barCount on slider change
      barCountSlider.oninput = () => {
        barCount = parseInt(barCountSlider.value);
      };

      function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate barWidth based on barCount
        const barWidth = (canvas.width / barCount) - barSpacing;
        let x = 0;
        const maxBarHeight = canvas.height * 0.9;

        for (let i = 0; i < barCount; i++) {
          // Map i-th bar to frequency bin index
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const barHeight = mapRange(dataArray[dataIndex], 0, 255, 0, maxBarHeight);
          const red = Math.min(barHeight + barColorBase[0], 255);
          const green = barColorBase[1];
          const blue = barColorBase[2];

          ctx.fillStyle = `rgb(${red},${green},${blue})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + barSpacing;
        }
      }

      draw();
    });
  };

  reader.readAsArrayBuffer(file);
});
