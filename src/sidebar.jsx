import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { AudioVisualizer } from "react-audio-visualize";
import { useEffect } from "react";
import { calculateDecibel, convertToWav } from "./utils/audioFunction";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Sidebar = () => {
  const visualizerRef = useRef(null);
  const [record_or_file, setRecordFile] = useState("record");
  const [audioBlob, setAudioBlob] = useState(null);
  const [db, setDb] = useState(0);
  const [recordedaudioBlob, setrecordedAudioBlob] = useState(null);
  const [predicted, setPredicted] = useState(null);
  const [feature, setFeature] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [pitch, setPitch] = useState(null);

  const data = {
    labels: Array.from({ length: 180 }, (_, i) => i), // Assuming each data point represents a time point
    datasets: [
      {
        label: "Data",
        data: energy,
        backgroundColor: "red",
        fill: false,
        borderColor: "pink",
        tension: 0.1,
      },
    ],
  };

  const pitch_data = {
    labels: Array.from({ length: 180 }, (_, i) => i), // Assuming each data point represents a time point
    datasets: [
      {
        label: "Data",
        data: pitch,
        fill: false,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const energy_options = {
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // Animation duration in milliseconds
      delay: 500, // Delay before animation starts in milliseconds
      easing: "easeInOutQuart", // Easing function for smooth animation
    },

    aspectRatio: 2,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Energy Plot",
      },
    },
  };

  const pitch_options = {
    maintainAspectRatio: false, // Set to false to allow custom aspect ratio
    aspectRatio: 2,
    animation: {
      duration: 1000, // Animation duration in milliseconds
      delay: 500, // Delay before animation starts in milliseconds
      easing: "easeInOutQuart", // Easing function for smooth animation
    },

    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Pitch Plot",
      },
    },
  };

  const handleClear = () => {
    console.log("Claeered");
  };

  const stopRecording = async () => {
    setRecordFile("record");
    console.log("Recording Stopped");
    const formData = new FormData();
    const wavBlob = await convertToWav(recordedBlob);

    if (wavBlob) {
      calculateDecibel(wavBlob, setDb);
      console.log("Here it is", typeof wavBlob);
      formData.append("file", wavBlob, "recorded_audio1.wav");
      console.log(formData);
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/analyse",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(response.data.message);
        setPredicted(response.data.message);

        const features = await axios.post(
          "http://127.0.0.1:8000/extract",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        //  console.log("features",features.data.features)
        setFeature(JSON.parse(JSON.stringify(features.data.features)));
        setEnergy(features.data.features.energy_plot);
        setPitch(features.data.features.pitch_plot);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const recorderControls = useVoiceVisualizer();
  const {
    // ... (Extracted controls and states, if necessary)
    recordedBlob,
    error,
    audioRef,
  } = recorderControls;

  // Get the recorded audio blob
  useEffect(() => {
    if (!recordedBlob) return;
    setrecordedAudioBlob(recordedBlob);
    console.log(recordedBlob);
    if (recordedBlob) {
      stopRecording();
    }
  }, [recordedBlob, error]);

  // Get the error when it occurs
  useEffect(() => {
    if (!error) return;

    console.error(error);
  }, [error]);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setRecordFile("file");
      const reader = new FileReader();
      reader.onload = async () => {
        const blob = new Blob([reader.result], { type: file.type });
        setAudioBlob(blob);
        calculateDecibel(blob, setDb);
      };
      reader.readAsArrayBuffer(file);
      console.log("File Uploaded");
      toast.success("File Uploaded");
      console.log(file);
      console.log("File has been recieved");
      const formData = new FormData();

      if (file) {
        console.log("Here it is", typeof file);
        formData.append("file", file, "out_audio.wav");
        console.log(formData);
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/analyse",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log(response.data.message);
          setPredicted(response.data.message);

          const features = await axios.post(
            "http://127.0.0.1:8000/extract",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          //  console.log("features",features.data.features)
          setFeature(JSON.parse(JSON.stringify(features.data.features)));
          setEnergy(features.data.features.energy_plot);
          setPitch(features.data.features.pitch_plot);
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      console.log("not working");
      toast.error("File Not Uploaded");
    }
  };

  React.useEffect(() => {
    if (!audioBlob) {
      console.error("No audio recorded");
      return;
    }
    if (audioBlob) {
      console.log("Audio recorded");
    }
  }, [audioBlob]);

  let wid = window.screen.width;

  return (
    <div>
      <div className="flex">
        <aside
          id="default-sidebar"
          class=" hidden md:block  w-full h-full mb-8 "
          aria-label="Sidebar"
        >
          <div class="h-full px-3 py-4  overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul class="space-y-8 font-medium ">
              <li>
                <a
                  href="#"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span class="ms-3">Articulatory</span>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span class="ms-3">Phonotation</span>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span class="ms-3">Prosody</span>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span class="ms-3">Glottal</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <div class="p-4 w-full h-full">
          <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div class="flex items-center  justify-center flex-col gap-4  rounded bg-gray-50 dark:bg-gray-800">
                {/* <AudioRecorder
             onRecordingComplete={addAudioElement}
             audioTrackConstraints={{
               noiseSuppression: true,
               echoCancellation: true,
             }}
             onNotAllowedOrFound={(err) => console.table(err)}
             downloadOnSavePress={false}
             downloadFileExtension="webm"
             mediaRecorderOptions={{
               audioBitsPerSecond: 128000,
             }}
      /> */}
                {/* <h1 className='font-bold text-xl text-blue-600'>Record</h1> */}
              </div>
              <div class="flex items-center justify-center  rounded bg-gray-50 dark:bg-gray-800">
                <div class="flex items-center justify-center w-full h-full">
                  <label
                    for="dropzone-file"
                    class="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div class="flex flex-col items-center justify-center pt-2 pb-4">
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p class="mb-2 text-md text-center text-gray-500 dark:text-gray-400">
                        Click
                        <span class="font-semibold text-center text-sm md:text-lg">
                          {" "}
                          <br></br> to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p class="md:text-sm text-[10px] text-gray-500 dark:text-gray-400">
                        .WAV & .MP3
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      class="hidden"
                      onChange={handleFile}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class="flex items-center overflow-x-auto scroll-smooth justify-center h-64 mb-4 rounded bg-gray-50 dark:bg-gray-800">
              {record_or_file == "file" && (
                <div className="overflow-scroll flex flex-col gap-x-4">
                  <h1 className="font-medium text-xl text-center">
                    Audio Waveform
                  </h1>
                  <AudioVisualizer
                    ref={visualizerRef}
                    blob={audioBlob}
                    width={wid - 250}
                    height={175}
                    barWidth={1}
                    gap={0}
                    barColor={"#f76565"}
                  />
                </div>
              )}
              {record_or_file == "record" && (
                <div className="overflow-x-auto w-full">
                  <VoiceVisualizer
                    ref={audioRef}
                    controls={recorderControls}
                    height={50}
                    width={wid - 250}
                    mainBarColor="#000000"
                    onStopRecording={stopRecording}
                    onEndAudioPlayback={handleClear}
                    onClearCanvas={handleClear}
                    clearCanvas={handleClear}
                  />
                </div>
              )}
            </div>

            <div class="grid grid-cols-4 gap-4 mb-4 rounded-lg">
              <div
                className={`flex items-center justify-center ${
                  predicted == 2
                    ? "!bg-gradient-to-r from-[#003aa7] to-blue-500 transition-colors ease-in-out duration-2000"
                    : " "
                } rounded bg-gray-50 h-28 dark:bg-gray-800`}
              >
                <p
                  className={`text-2xl text-gray-400 ${
                    predicted == 2
                      ? "!text-white transition-colors ease-in-out"
                      : " "
                  } dark:text-gray-500`}
                >
                  Normal
                </p>
              </div>
              <div
                className={`flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800 ${
                  predicted == 0
                    ? "!bg-gradient-to-r from-[#003aa7] to-blue-500 transition-colors ease-in-out duration-2000"
                    : " "
                }`}
              >
                <p
                  className={`text-2xl text-gray-400 ${
                    predicted == 0
                      ? "!text-white transition-colors ease-in-out"
                      : " "
                  } dark:text-gray-500`}
                >
                  Mild
                </p>
              </div>
              <div
                className={`flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800 ${
                  predicted == 1
                    ? "!bg-gradient-to-r from-[#003aa7] to-blue-500 transition-colors ease-in-out duration-2000"
                    : " "
                }`}
              >
                <p
                  className={`text-2xl text-gray-400 ${
                    predicted == 1
                      ? "!text-white transition-colors ease-in-out"
                      : " "
                  } dark:text-gray-500`}
                >
                  Moderate
                </p>
              </div>
              <div
                className={`flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800 ${
                  predicted == 3
                    ? "!bg-gradient-to-r from-[#003aa7] to-blue-500 transition-colors ease-in-out duration-2000"
                    : " "
                }`}
              >
                <p
                  className={`text-2xl text-gray-400 ${
                    predicted == 3
                      ? "!text-white transition-colors ease-in-out"
                      : " "
                  } dark:text-gray-500`}
                >
                  Severe
                </p>
              </div>
            </div>

            <div class="flex items-center justify-center h-full pt-8 pb-8 mb-4 rounded bg-gray-50 dark:bg-gray-800">
              {feature ? (
                <div class="relative overflow-x-auto w-full  flex justify-center flex-col items-center">
                  <table class=" flex justify-center  flex-col items-center text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                    <tbody className="flex justify-between rounded-lg flex-col bg-gray-300">
                      <tr class=" flex justify-between items-center ml-4 mr-16 border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Feature
                        </th>
                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Value
                        </td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average DFO
                        </th>
                        <td class="px-6 py-4">{feature.avg_DF0}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average DDFO
                        </th>
                        <td class="px-6 py-4">{feature.avg_DDF0}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average Jitter
                        </th>
                        <td class="px-6 py-4">{feature.avg_Jitter}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average Shimmer
                        </th>
                        <td class="px-6 py-4">{feature.avg_Shimmer}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average APQ
                        </th>
                        <td class="px-6 py-4">{feature.avg_apq}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average PPQ
                        </th>
                        <td class="px-6 py-4">{feature.avg_ppq}</td>
                      </tr>

                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          Average LogE
                        </th>
                        <td class="px-6 py-4">{feature.avg_logE}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </div>
              )}{" "}
            </div>

            {/* This is where the chart starts */}
            <div className=" ">
              <div class="grid grid-cols-1 gap-4 mb-4 rounded-lg">
                {energy ? (
                  // <div className='flex grid-row-2 gap-4'>
                  // <Line
                  //   options={options}
                  //   data={data}

                  // />

                  // <Scatter
                  // options={options}
                  // data={pitch_data}/>
                  // </div>
                  <div class="grid grid-cols-2 justify-stretch items-stretch gap-4  rounded-lg">
                    <div
                      className={`flex items-center justify-center rounded bg-gray-50 h-64 dark:bg-gray-800`}
                    >
                      <Line options={energy_options} data={data} />
                    </div>
                    <div
                      className={`flex items-center justify-center rounded bg-gray-50 h-64 dark:bg-gray-800`}
                    >
                      <Scatter options={pitch_options} data={pitch_data} />
                    </div>
                  </div>
                ) : (
                  <div
                    role="status"
                    className="flex justify-center rounded-lg items-center pt-8 pb-8 bg-gray-50"
                  >
                    <svg
                      aria-hidden="true"
                      class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-300"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span class="sr-only">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
