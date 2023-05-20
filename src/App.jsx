import { useRef, useEffect } from 'react'
import * as faceapi from "face-api.js"
import './App.css'

function App() {

  const videoRef = useRef();
  const canvasRef = useRef();
  const desRef = useRef();

  //OPEN YOUR FACE CAM
  const startVideo = () =>{
    navigator.mediaDevices.getUserMedia({video: true})
    .then((currentStream) => {
      videoRef.current.srcObject = currentStream
    })
    .catch((err) => {
      console.log(err);
    })
  }

  //LOAD MODALS
  const loadModals = () => {
    Promise.all([
      // FACE DETECTOR
      faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
      faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/weights")
    ]).then(() => {
      detectMyFace()
    })
  }

  const detectMyFace = () => {
    setInterval(async () => {
      const detection = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const personData = await faceapi.detectSingleFace(videoRef.current);
      

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      desRef.current.innerHtml = JSON.stringify(personData.descriptor)
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650
      })
      const resized = faceapi.resizeResults(detection, {
        width: 940,
        height: 650
      })

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 1000)
  }

  useEffect(()=>{
    startVideo()
    videoRef && loadModals()
  },[])

  return (
    <div>
      <h1>Face Detection</h1>
      <div className="appVid">
          <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
      </div>
      <canvas ref={canvasRef} width={940} height={650} className='appcanvas' ></canvas>
      <div ref={desRef}></div>
    </div>
  )
}

export default App
