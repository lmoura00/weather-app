const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const fileNames = [
  'sunny.json', 'cloudy.json', 'rain.json', 'snow.json', 'storm.json',
  'day-clear-sky.json', 'night-clear-sky-dark.json',
  'day-few-clouds.json', 'night-few-clouds-dark.json',
  'day-rain.json', 'night-rain.json',
  'day-shower-rains.json', 'night-shower-rains.json',
  'day-thunderstorm.json', 'night-thunderstorm.json',
  'day-snow.json', 'night-snow.json',
  'day-mist.json', 'night-mist.json',
  'astronaut-floating.json',
  'paperplane.json'
];

const placeholderLottie = JSON.stringify({
  "v": "5.5.7", "fr": 60, "ip": 0, "op": 60, "w": 100, "h": 100, "nm": "Placeholder", "ddd": 0, "assets": [],
  "layers": [{"ddd": 0, "ind": 1, "ty": 4, "nm": "Sun", "sr": 1, "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0}, "p": {"a": 0, "k": [50, 50, 0]}, "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}}, "ao": 0, "shapes": [{"ty": "el", "d": 1, "s": {"a": 0, "k": [80, 80]}, "p": {"a": 0, "k": [0, 0]}, "nm": "Ellipse Path 1", "mn": "ADBE Vector Shape - Ellipse", "hd": false}, {"ty": "fl", "c": {"a": 0, "k": [1, 0.8, 0, 1]}, "o": {"a": 0, "k": 100}, "r": 1, "bm": 0, "nm": "Fill 1", "mn": "ADBE Vector Graphic - Fill", "hd": false}], "ip": 0, "op": 60, "st": 0, "bm": 0}]
});

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  console.log('📁 Pasta "assets" criada.');
}

console.log('Gerando arquivos de placeholder...');

fileNames.forEach(name => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, placeholderLottie);
    console.log(`✅ Criado: assets/${name}`);
  } else {
    console.log(`ℹ️ Já existe: assets/${name}`);
  }
});

console.log('\n🎉 Tudo pronto! Agora você pode rodar o app (npx expo start -c).');
console.log('👉 Futuramente, baixe animações reais no LottieFiles e substitua esses arquivos.');