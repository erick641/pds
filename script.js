const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const file =document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const canvas5 = document.getElementById('spectrumCanvas');
canvas5.width = window.innerWidth;
canvas5.height = window.innerHeight;
const ctx2 = canvas5.getContext('2d');
let audioSource;
let analyser;



container.addEventListener('click',function(){
    const audio1 = document.getElementById('audio1');
    const audioContext = new AudioContext();
   

    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize=1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width/bufferLength;
    let barHeight;
    let x;

    let audioBuffer;
    let originalSource = null;

    document.getElementById('fileupload').addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }
    });

    
    visualize(analyser)
    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        GraficadorDeEspectro(bufferLength, x, barWidth, barHeight, dataArray)
        requestAnimationFrame(animate);
    }    
    animate();

    document.getElementById('filterButton').addEventListener('click', function() {
        if (audioBuffer) {
       
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
    
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000; // Frecuencia de corte en Hz
    
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 4096;
            const bufferLength2 = analyser.frequencyBinCount;
            const dataArray2 = new Uint8Array(bufferLength2);
            const timeDomainArray = new Uint8Array(bufferLength2);
    
            source.connect(filter);
            filter.connect(analyser);
            analyser.connect(audioContext.destination);
    
            source.start();

    
            function draw() {
                requestAnimationFrame(draw);
    
                analyser.getByteFrequencyData(dataArray2);
                analyser.getByteTimeDomainData(timeDomainArray);
    
                visualize1(analyser);
                visualizeSpectrum(dataArray2, 'spectrumCanvas');
            }
    
            draw();
        }
    });
});

file.addEventListener('change', function(){
    const files= this.files;
    const audio1 = document.getElementById('audio1');
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize=1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width/bufferLength;
    let barHeight;
    let x;

    let audioBuffer;

    document.getElementById('fileupload').addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }
    });



    visualize(analyser);
    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        GraficadorDeEspectro(bufferLength, x, barWidth, barHeight, dataArray)
        requestAnimationFrame(animate);
    } 
    animate();

    document.getElementById('filterButton').addEventListener('click', function() {
        if (audioBuffer) {

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
    
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000; // Frecuencia de corte en Hz
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 4096;
            const bufferLength2 = analyser.frequencyBinCount;
            const dataArray2 = new Uint8Array(bufferLength2);
            const timeDomainArray = new Uint8Array(bufferLength2);
            
            source.connect(filter);
            filter.connect(analyser);
            analyser.connect(audioContext.destination);
    
            source.start();

    
            function draw() {
                requestAnimationFrame(draw);
    
                analyser.getByteFrequencyData(dataArray2);
                analyser.getByteTimeDomainData(timeDomainArray);
    
                visualize1(analyser);
                function animate1(){
                    x = 0;
                    ctx.clearRect(0, 0, canvas5.width, canvas5.height);
                    GraficadorDeEspectro1(bufferLength2, x, barWidth, barHeight, dataArray2)
                    requestAnimationFrame(animate1);
                } 
                animate1();
            }
    
            draw();
        }
    });
});

function GraficadorDeEspectro(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i];
        const red = i*barHeight/50;
        const green = i*2;
        const blue = barHeight/3
        ctx.fillStyle = 'rgb(' + red+ ',' + green +',' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}


function visualize(analyser) {
    const canvas1 = document.getElementById('osciloscopio');
    const canvasCtx = canvas1.getContext('2d');
    const bufferLength1 = analyser.fftSize;
    const dataArray1 = new Uint8Array(bufferLength1);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray1);

        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, canvas1.width, canvas1.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'white';

        canvasCtx.beginPath();

        const sliceWidth = canvas1.width * 1.0 / bufferLength1;
        let x = 0;

        for (let i = 0; i < bufferLength1; i++) {
            const v = dataArray1[i] / 128.0;
            const y = v * canvas1.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas1.width, canvas1.height / 2);
        canvasCtx.stroke();
    }

    draw();
}


function visualize1(analyser) {
    const canvas1 = document.getElementById('waveformCanvas');
    const canvasCtx = canvas1.getContext('2d');
    const bufferLength1 = analyser.fftSize;
    const dataArray1 = new Uint8Array(bufferLength1);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray1);

        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, canvas1.width, canvas1.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'white';

        canvasCtx.beginPath();

        const sliceWidth = canvas1.width * 1.0 / bufferLength1;
        let x = 0;

        for (let i = 0; i < bufferLength1; i++) {
            const v = dataArray1[i] / 128.0;
            const y = v * canvas1.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas1.width, canvas1.height / 2);
        canvasCtx.stroke();
    }

    draw();
}

function visualizeSpectrum(dataArray, canvasId) {
    const canvas2 = document.getElementById(canvasId);
    const context = canvas2.getContext('2d');
    context.clearRect(0, 0, canvas2.width, canvas2.height);

    const barWidth = (canvas2.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];

        context.fillStyle = 'rgb(' + i*barHeight/50+ ',' + i*2 +',' + barHeight/3 + ')';
        context.fillRect(x, canvas2.height - barHeight / 2, barWidth, barHeight /2);

        x += barWidth + 1;
    }
}

function GraficadorDeEspectro1(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i];
        const red = i*barHeight/50;
        const green = i*2;
        const blue = barHeight/3
        ctx.fillStyle = 'rgb(' + red+ ',' + green +',' + blue + ')';
        ctx.fillRect(x, canvas5.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}
