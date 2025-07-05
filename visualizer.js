const audioFileInput = document.getElementById('audioFile');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

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
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      }

      draw();
    });
  };

  reader.readAsArrayBuffer(file);
});
