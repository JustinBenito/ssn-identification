export const convertToWav = (webmBlob) => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const fileReader = new FileReader();
  
      fileReader.onload = function () {
        audioContext.decodeAudioData(fileReader.result, function (decodedData) {
          const wavBuffer = encodeWav(decodedData);
          const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
          resolve(wavBlob);
        });
      };
  
      fileReader.onerror = function (error) {
        reject(error);
      };
  
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };
  
  const encodeWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitDepth = 16;
  
    const buffer = new ArrayBuffer(44 + audioBuffer.length * numChannels * 2);
    const view = new DataView(buffer);
  
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + audioBuffer.length * numChannels * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true);
    view.setUint16(32, (numChannels * bitDepth) / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, audioBuffer.length * numChannels * 2, true);
  
    floatTo16BitPCM(view, 44, audioBuffer.getChannelData(0));
  
    if (numChannels === 2) {
      floatTo16BitPCM(
        view,
        44 + audioBuffer.length * 2,
        audioBuffer.getChannelData(1)
      );
    }
  
    return view;
  };
  
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };
  