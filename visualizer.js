const fftSize = 1024;
const barResolution = 1;
const barSpacing = 1;
const barColorBase = [100, 50, 50];

const audioFileInput = document.getElementById('audioFile');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

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
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * barResolution;
        let x = 0;
        const maxBarHeight = canvas.height * 0.9;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = mapRange(dataArray[i], 0, 255, 0, maxBarHeight);
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
