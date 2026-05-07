// src/components/BehaviorMonitor.js
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import '../styles.css';

const BehaviorMonitor = ({ onWarning = () => { }, onLockExam = () => { }, onStressUpdate = () => { } }) => {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState(null);

  // Audio analysis refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // Pause duration after a warning (in milliseconds)
  const pauseDuration = 30000; // 30 seconds

  // Load face-api.js models from public/models
  useEffect(() => {
    const loadModels = async () => {
      const publicUrl = process.env.PUBLIC_URL || '';
      const pathsToTry = [
        publicUrl.endsWith('/') ? publicUrl + 'models' : publicUrl + '/models',
        '/models',
        window.location.origin + '/models'
      ];

      let lastError = null;
      for (const MODEL_URL of pathsToTry) {
        console.log('BehaviorMonitor: Attempting to load models from:', MODEL_URL);
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
          setModelsLoaded(true);
          console.log('BehaviorMonitor: All face models loaded successfully from:', MODEL_URL);
          return; // Success
        } catch (err) {
          console.warn(`BehaviorMonitor: Failed to load from ${MODEL_URL}:`, err.message);
          lastError = err;
        }
      }

      console.error('BehaviorMonitor: All face model loading paths failed:', lastError);
    };
    loadModels();
  }, []);

  // Smoothing and detection refs
  const failedFramesRef = useRef(0);
  const consecutiveFaceFails = 3; // Number of failed detections before warning

  // Set up Audio Analysis
  const setupAudio = (stream) => {
    try {
      if (audioContextRef.current) return; // Prevent multiple setups
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioIntervalRef.current = setInterval(() => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((prev, curr) => prev + curr) / bufferLength;

        // Infer stress from voice frequency/amplitude (very basic heuristic)
        const voiceStress = Math.min(100, (average / 128) * 100);
        onStressUpdateRef.current('voice', voiceStress);
      }, 1000); // Check voice every 1s
    } catch (err) {
      console.error('Audio Setup Error:', err);
    }
  };

  // Access the webcam and microphone
  useEffect(() => {
    let localStream;
    if (modelsLoaded) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((s) => {
          localStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setupAudio(s);
        })
        .catch((err) => console.error("Error accessing media devices:", err));
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [modelsLoaded]);

  // Wrap props in refs to avoid interval restarts
  const onWarningRef = useRef(onWarning);
  const onLockExamRef = useRef(onLockExam);
  const onStressUpdateRef = useRef(onStressUpdate);

  useEffect(() => {
    onWarningRef.current = onWarning;
    onLockExamRef.current = onLockExam;
    onStressUpdateRef.current = onStressUpdate;
  }, [onWarning, onLockExam, onStressUpdate]);

  // EAR (Eye Aspect Ratio) calculation
  const calculateEAR = (eye) => {
    const v1 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
    const v2 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
    const h = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));
    return (v1 + v2) / (2.0 * h);
  };

  // Periodically check the video feed and monitor behavior
  useEffect(() => {
    let interval;
    if (modelsLoaded && !isPaused) {
      interval = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          let faceValid = false;
          let visualStress = 0;
          let visibilityPercent = 0;

          if (detections.length > 0) {
            const detection = detections[0];
            const { width, height } = detection.detection.box;
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;

            visibilityPercent = (width * height / (videoWidth * videoHeight)) * 100;

            if (visibilityPercent >= 30) {
              faceValid = true;
              failedFramesRef.current = 0;
            }

            const landmarks = detection.landmarks;
            const avgEAR = (calculateEAR(landmarks.getLeftEye()) + calculateEAR(landmarks.getRightEye())) / 2;

            if (avgEAR < 0.2) visualStress += 40;
            else if (avgEAR < 0.25) visualStress += 15;

            const nosePoint = landmarks.getNose()[6];
            const jaw = landmarks.getJawOutline();
            const dLeft = Math.abs(nosePoint.x - jaw[0].x);
            const dRight = Math.abs(nosePoint.x - jaw[16].x);
            const symmetry = Math.abs(dLeft - dRight) / Math.max(dLeft, dRight);
            if (symmetry > 0.5) visualStress += 20;

            visualStress = Math.min(100, visualStress + 5 + Math.random() * 10);
          } else {
            failedFramesRef.current++;
            console.log(`Face missing. Fails: ${failedFramesRef.current}`);
          }

          onStressUpdateRef.current('visual', visualStress);

          if (!faceValid && failedFramesRef.current >= consecutiveFaceFails) {
            failedFramesRef.current = 0;
            const newCount = warningCount + 1;
            setWarningCount(newCount);
            if (newCount <= 3) onWarningRef.current(newCount);
            if (newCount >= 3) {
              onLockExamRef.current(true);
            } else {
              setIsPaused(true);
              setTimeout(() => { setIsPaused(false); }, pauseDuration);
            }
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, isPaused]); // No longer depends on handlers

  return (
    <div className="monitor-container">
      <video ref={videoRef} autoPlay muted className="monitor-video" />
      <div className="stats-overlay">
        <div className="stat-item">
          <span className="stat-label">Warnings</span>
          <span className={`stat-value ${warningCount > 0 ? 'warning' : ''}`}>
            {warningCount}/3
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">System Status</span>
          <span className="stat-value">NOMINAL</span>
        </div>
      </div>
    </div>
  );
};

export default BehaviorMonitor;