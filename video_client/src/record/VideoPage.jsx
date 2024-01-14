import React, { useState } from "react";
import ReactPlayer from "react-player";
//import axios from 'axios';
import { FiCamera, FiCameraOff } from "react-icons/fi";
import { BsFillMicMuteFill, BsFillMicFill } from "react-icons/bs";
import { BsCameraVideo } from "react-icons/bs";

const VideoPage = () => {
  const [myStream, setMyStream] = useState();
  const [videoTrack, setVideoTrack] = useState();
  const [audioTrack, setAudioTrack] = useState();
  const [videoStatus, setVideoStatus] = useState(true);
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  let durationInSeconds = 0;
  let videoBlob = null;

  const handleStartStream = async() => {  
    let startTime = 0;
    let chunks = [];
   
    try {   
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      setMyStream(stream);
      setVideoTrack(stream.getTracks().find(track => track.kind === 'video'))
      setAudioTrack(stream.getTracks().find(track => track.kind === 'audio'))    

      mediaRecorder.onstart = () => {
        console.log('Record Start!');
        startTime = Date.now();
      };
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async() => {
        console.log('Record Stop!');      
        videoBlob = new Blob(chunks, { type: 'video/webm' });
        const endTime = Date.now()
        if (startTime !== null) {
          durationInSeconds = endTime - startTime;
            console.log('Record Time:', durationInSeconds, 'second')
        }
        sendVideo()
      };      

      mediaRecorder.start();

    } catch (error) {
      console.error('getUserMedia veya MediaRecorder hatası:', error);
    }
  };

  const HandleStopStream = () => { 
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      myStream.getTracks().forEach(track => track.stop());
      setMyStream();
      setVideoTrack();
      console.log('Kayıt durduruldu');
    } else {
      console.log('Kayıt durdurulamadı: mediaRecorder null veya durumu inactive');
    }
  }

  const handleCamera = () => {
    if(videoTrack.enabled){
        videoTrack.enabled = false
        setVideoStatus(false)
    }else{
        videoTrack.enabled = true
        setVideoStatus(true)
    }
  }

  const handleMic = () => {
    if(audioTrack.enabled){
        audioTrack.enabled = false
        setAudioStatus(false)
    }else{
        audioTrack.enabled = true
        setAudioStatus(true)
    }
  }

  const sendVideo = async() => {
    const data = { fileDuration: durationInSeconds }

    const fd = new FormData()
    fd.append('file', videoBlob, 'video.mp4')
    fd.append('candidateAnswerDTO', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    setVideoUrl(URL.createObjectURL(videoBlob));
    /*await axios
        .post('http://localhost:8000/start-job/VIDEO', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .catch(reason => console.log(reason))*/
  }

  return ( 
    <div style={{display:'flex', alignItems:'center', flexDirection:'column'}}>
      <div style={{display:"flex", justifyContent:'center', marginTop:'100px'}}>
        <div>
          {myStream && videoTrack ? 
          <ReactPlayer
                playing
                muted
                height="400px"
                width="500px"
                url={myStream}
              />
          :   <div style={{height:"400px", width:"500px", backgroundColor:'black', display:'flex', justifyContent:'center', alignItems:'center'}}>
          <BsCameraVideo color="gray" size={150}/> 
        </div>
          }
        </div> 
      </div>
      <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
        <div onClick={()=>handleCamera()}  style={{borderRadius:'50%', padding:'15px', backgroundColor:'black'}}>
        {videoStatus ? <FiCamera color="white" size={25}/> : <FiCameraOff color="white" size={25}/>} 
          </div>
        <div onClick={()=>handleMic()} style={{borderRadius:'50%', padding:'15px', backgroundColor:'black'}}>
        {audioStatus ? <BsFillMicFill color="white" size={25}/> : <BsFillMicMuteFill color="white" size={25}/>} 
        </div>
        <button onClick={()=>handleStartStream()}>Start Record</button>
        <button onClick={()=>HandleStopStream()}>Stop Record</button>
      </div>
      <ReactPlayer
                playing                
                height="200px"
                width="300px"
                url={videoUrl}
                style={{marginTop:'10px'}}
              />
    </div>
  );
};

export default VideoPage;
