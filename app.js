async function createDevice(context, name, replaceDevice) {
  let patcher = lib[name].patcher;
  return await RNBO.createDevice({ context, patcher }, replaceDevice);
}

// Create AudioContext
const WAContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new WAContext();
//audioContext.destination.channelCount = 2;
// Create gain node and connect it to audio output
const outputNode = audioContext.createGain();
outputNode.gain.value = 0.02;
outputNode.connect(audioContext.destination);
// WebAudio requires a click to start audio:
document.body.onclick = () => {
  audioContext.resume();
};

async function setup() {
  let response, patcher;
  let patchExportURL = 'sine.export.json';
  try {
    response = await fetch(patchExportURL);
    patcher = await response.json();
    console.log('patcher', patcher);
  } catch (err) {
    const errorContext = {
      error: err,
    };
    if (response && (response.status >= 300 || response.status < 200)) {
      (errorContext.header = `Couldn't load patcher export bundle`),
        (errorContext.description =
          `Check app.js to see what file it's trying to load. Currently it's` +
          ` trying to load "${patchExportURL}". If that doesn't` +
          ` match the name of the file you exported from RNBO, modify` +
          ` patchExportURL in app.js.`);
    }
    throw err;
  }

  // Create a device
  let sine = await RNBO.createDevice({ context: audioContext, patcher });
  sine.node.connect(outputNode);

  let sine2 = await RNBO.createDevice({ context: audioContext, patcher });
  sine2.node.connect(sine.node.parameters.get('freq'));

  // lists
  // it does list the parameter "freq"
  sine.node.parameters.forEach(function (v, k) {
    console.log('param', k, v);
  });

  setInterval(() => {
    // why doesn't any of this work?
    //sine.node.freq.value = Math.random();
    //sine.node.freq = Math.random();
    sine.node.parameters.get('freq').value = Math.random();
  }, 100);
}

setup();
