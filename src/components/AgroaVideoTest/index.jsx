import React from "react";
import { merge } from "lodash";
import AgoraRTC from "agora-rtc-sdk";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "../../assets/fonts/css/icons.css";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Card
} from "@material-ui/core";

import LogOutMenu from "../LogOutMenu/LogOutMenu";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import CloseIcon from "@material-ui/icons/Close";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import PictureInPictureIcon from "@material-ui/icons/PictureInPicture";
import PageviewIcon from "@material-ui/icons/Pageview";
import "./canvas.css";
import "../../assets/fonts/css/icons.css";

const tile_canvas = {
  "1": ["span 12/span 24"],
  "2": ["span 12/span 12/13/25", "span 12/span 12/13/13"],
  "3": ["span 6/span 12", "span 6/span 12", "span 6/span 12/7/19"],
  "4": [
    "span 6/span 12",
    "span 6/span 12",
    "span 6/span 12",
    "span 6/span 12/7/13"
  ],
  "5": [
    "span 3/span 4/13/9",
    "span 3/span 4/13/13",
    "span 3/span 4/13/17",
    "span 3/span 4/13/21",
    "span 9/span 16/10/21"
  ],
  "6": [
    "span 3/span 4/13/7",
    "span 3/span 4/13/11",
    "span 3/span 4/13/15",
    "span 3/span 4/13/19",
    "span 3/span 4/13/23",
    "span 9/span 16/10/21"
  ],
  "7": [
    "span 3/span 4/13/5",
    "span 3/span 4/13/9",
    "span 3/span 4/13/13",
    "span 3/span 4/13/17",
    "span 3/span 4/13/21",
    "span 3/span 4/13/25",
    "span 9/span 16/10/21"
  ]
};

/**
 * @prop appId uid
 * @prop transcode attendeeMode videoProfile channel baseMode
 */

class AgoraCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.client = {};
    this.localStream = {};
    this.shareClient = {};
    this.shareStream = {};
    this.remoteStream = {};
    this.timeout = null;
    this.videoRef = new React.createRef();
    this.state = {
      displayMode: "pip",
      readyState: false,
      mic: false,
      video: false
    };
  }

  detectFrame = async (video, model) => {
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    let predictions = await model.detect(video);
    this.renderPredictions(video, predictions);
    requestAnimationFrame(() => this.detectFrame(video, model));
  };

  renderPredictions = (video, predictions) => {
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "cell phone") {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          video.style.filter = "none";
        }, 2000);
        video.style.filter = "blur(30px)";
      }
    }
  };

  componentDidMount() {
    const {
      appId,
      channel,
      uid: propUid,
      attendeeMode,
      transcode,
      videoProfile
    } = this.props;
    this.client = AgoraRTC.createClient({
      mode: transcode
    });
    if (attendeeMode !== "audience") {
      return new Promise((resolve, reject) => {
        this.client.init(appId, () => {
          console.log("HERE", this.client);
          console.log("AgoraRTC client initialized");
          console.log(this.client.highStream);
          this.subscribeStreamEvents();
        });
        this.client.join(appId, channel, propUid, uid => {
          console.log("User " + uid + " join channel successfully");
          console.log("At " + new Date().toLocaleTimeString());
          // create local stream
          // It is not recommended to setState in function addStream
          this.localStream = this.streamInit(uid, attendeeMode, videoProfile);
          this.localStream.init(
            () => {
              console.log("STREAM:", this.localStream);
              console.log("VIDEO ELEM:", this.videoRef.current);
              this.videoRef.current.srcObject = this.localStream.stream;
              this.addStream(this.localStream, true);
              console.log("before publish", this.localStream);
              this.client.publish(this.localStream, err => {
                console.log("Publish local stream error: " + err);
                reject();
              });
              console.log("should be happening");
              resolve();
              console.log("should be happening2");
              this.setState({
                readyState: true
              });
            },
            err => {
              console.log("getUserMedia failed", err);
              this.setState({
                readyState: true
              });
              reject();
            }
          );
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.client.init(appId, () => {
          console.log("HERE", this.client);
          console.log("AgoraRTC client initialized");
          this.subscribeStreamEvents();
        });
        this.client.join(appId, channel, propUid, uid => {
          console.log("User " + uid + " join channel successfully");
          console.log("At " + new Date().toLocaleTimeString());
          // create local stream
          // It is not recommended to setState in function addStream
        });
      });
    }
  }

  streamInit = (uid, attendeeMode, videoProfile, config) => {
    let defaultConfig = {
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    };

    switch (attendeeMode) {
      case "audio-only":
        defaultConfig.video = false;
        break;
      case "audience":
        defaultConfig.video = false;
        defaultConfig.audio = false;
        break;
      default:
      case "video":
        break;
    }

    let stream = AgoraRTC.createStream(merge(defaultConfig, config));
    stream.setVideoProfile(videoProfile);
    return stream;
  };

  subscribeStreamEvents = () => {
    let rt = this;

    rt.client.on("stream-added", function(evt) {
      if (rt.props.attendeeMode === "audience") {
        let stream = evt.stream;
        console.log("New stream added: " + stream.getId());
        console.log("At " + new Date().toLocaleTimeString());
        console.log("Subscribe ", stream);
        rt.client.subscribe(stream, function(err) {
          console.log("Subscribe stream failed", err);
        });
      }
    });

    rt.client.on("peer-leave", function(evt) {
      console.log("Peer has left: " + evt.uid);
      console.log(new Date().toLocaleTimeString());
      console.log(evt);

      if (rt.remoteStream.getId && rt.remoteStream.getId() === evt.uid) {
        console.log("Redirecting to Home");
        window.location.hash = "";
      }
    });

    rt.client.on("stream-subscribed", function(evt) {
      if (rt.props.attendeeMode === "audience") {
        let stream = evt.stream;
        console.log("Got stream-subscribed event");
        console.log(new Date().toLocaleTimeString());
        console.log("Subscribe remote stream successfully: " + stream.getId());
        console.log(evt);
        rt.addStream(stream);
      }
    });

    rt.client.on("stream-removed", function(evt) {
      if (rt.props.attendeeMode === "audience") {
        let stream = evt.stream;
        console.log("Stream removed: " + stream.getId());
        console.log(new Date().toLocaleTimeString());
        console.log(evt);
      }
    });
  };

  addStream = (stream, push = false) => {
    if (
      this.remoteStream.getId &&
      this.remoteStream.getId() === stream.getId()
    ) {
      return;
    }
    this.remoteStream = stream;
    this.videoRef.current.srcObject = stream.stream;
    this.setState({ readyState: true });
    cocoSsd.load().then(value => {
      this.setState({ readyState: true });
      this.detectFrame(this.videoRef.current, value);
    });
  };

  handleCamera = e => {
    if (this.localStream.isVideoOn()) {
      this.localStream.disableVideo();
      this.setState({ video: false });
    } else {
      this.localStream.enableVideo();
      this.setState({ video: true });
    }
  };

  handleMic = e => {
    if (this.localStream.isAudioOn()) {
      this.localStream.disableAudio();
      this.setState({ mic: false });
    } else {
      this.localStream.enableAudio();
      this.setState({ mic: true });
    }
  };

  handleExit = e => {
    if (e.currentTarget.classList.contains("disabled")) {
      return;
    }
    try {
      this.client && this.client.unpublish(this.localStream);
      this.localStream && this.localStream.close();
      this.client &&
        this.client.leave(
          () => {
            console.log("Client succeed to leave.");
          },
          () => {
            console.log("Client failed to leave.");
          }
        );
    } finally {
      this.setState({ readyState: false });
      this.client = null;
      this.localStream = null;
      window.location.hash = "";
    }
  };

  render() {
    const style = {
      display: "grid",
      gridGap: "10px",
      alignItems: "center",
      justifyItems: "center",
      gridTemplateRows: "repeat(12, auto)",
      gridTemplateColumns: "repeat(24, auto)"
    };
    const videoControlBtn =
      this.props.attendeeMode === "video" ? (
        <IconButton onClick={this.handleCamera} title="Enable/Disable Video">
          {this.state.video ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      ) : (
        ""
      );

    const audioControlBtn =
      this.props.attendeeMode !== "audience" ? (
        <IconButton onClick={this.handleMic} title="Enable/Disable Audio">
          {this.state.mic ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      ) : (
        ""
      );

    const switchDisplayBtn = (
      <IconButton onClick={this.switchDisplay} title="Switch Display Mode">
        <PageviewIcon />
      </IconButton>
    );
    const hideRemoteBtn = (
      <IconButton
        disabled={!this.state.displayMode === "pip"}
        onClick={this.hideRemote}
        title="Hide Remote Stream"
      >
        <PictureInPictureIcon />
      </IconButton>
    );
    const exitBtn = (
      <IconButton onClick={this.handleExit} disabled={!this.state.readyState}>
        <CloseIcon />
      </IconButton>
    );
    let greetingMessage = `You are presenting, say hello to your viewers!`;
    if (this.props.attendeeMode === "audience") {
      greetingMessage = `You are an audience member.  Sit back and enjoy!`;
    }
    return (
      <>
        <AppBar color={this.state.readyState ? "primary" : "default"}>
          <Toolbar>
            <img
              className="header-logo"
              src={require("../../assets/images/logo.png")}
              alt=""
            />
            {this.props.channel}
            <div className="buttonsBar">
              {exitBtn}
              {videoControlBtn}
              {audioControlBtn}
              {switchDisplayBtn}
              {hideRemoteBtn}
            </div>
            <LogOutMenu />
          </Toolbar>
        </AppBar>
        {!this.state.readyState && (
          <div className="spinnerWrapper">
            <CircularProgress
              color="secondary"
              className="spinner"
              size={150}
              thickness={4}
            />
          </div>
        )}
        <div>
          <Card className="card" elevation={4}>
            <video
              autoPlay
              playsInline
              muted
              ref={this.videoRef}
              width={
                this.remoteStream.videoWidth
                  ? this.remoteStream.videoWidth
                  : "640px"
              }
              height={
                this.remoteStream.videoHeight
                  ? this.remoteStream.videoHeight
                  : "480px"
              }
            />
          </Card>
          <div className={"greetingMessage"}>{greetingMessage}</div>
        </div>
        {this.state.readyState && this.state.video && (
          <div className="liveWrapper">
            <Toolbar>
              <Typography variant="overline">LIVE</Typography>
              <FiberManualRecordIcon fontSize="small" />
            </Toolbar>
          </div>
        )}
      </>
    );
  }
}

export default AgoraCanvas;
