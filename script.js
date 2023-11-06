// Inisialisasi kamera dan canvas
let kamera = document.getElementById("video");
let outputCanvas = document.body.appendChild(document.createElement("canvas"));
let konteks = outputCanvas.getContext("2d");
let ukuranTampilan;

let lebarLayar = 1280;
let tinggiLayar = 720;

// Memulai kamera
const mulaiKamera = () => {
    console.log("----- KAMERA DIMULAI ------");
    navigator.mediaDevices.getUserMedia({
        video: { width: lebarLayar, height: tinggiLayar },
        audio: false
    }).then((aliran) => {
        kamera.srcObject = aliran;
    });
}

console.log(faceapi.nets);

console.log("----- MEMUAT MODEL ------");
Promise.all([
    faceapi.nets.ageGenderNet.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(mulaiKamera);

async function deteksiWajah() {
    const deteksi = await faceapi.detectAllFaces(kamera)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

    konteks.clearRect(0, 0, lebarLayar, tinggiLayar);
    const deteksiDiperkecil = faceapi.resizeResults(deteksi, ukuranTampilan);
    faceapi.draw.drawDetections(outputCanvas, deteksiDiperkecil);
    faceapi.draw.drawFaceLandmarks(outputCanvas, deteksiDiperkecil);
    faceapi.draw.drawFaceExpressions(outputCanvas, deteksiDiperkecil);

    console.log(deteksiDiperkecil);
    deteksiDiperkecil.forEach(hasil => {
        const { age, gender, genderProbability } = hasil;
        new faceapi.draw.DrawTextField([
            `${Math.round(age)} Tahun`, // Perbaikan di sini
            `${gender} ${Math.round(genderProbability)}`
        ],
            hasil.detection.box.bottomRight
        ).draw(outputCanvas);
    });
}

kamera.addEventListener('play', () => {
    ukuranTampilan = { width: lebarLayar, height: tinggiLayar };
    faceapi.matchDimensions(outputCanvas, ukuranTampilan);

    setInterval(deteksiWajah, 100);
})
