import React from 'react';
import ReactDOM from 'react-dom';

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
//import './App.css';

export default class VideoDetector extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user'
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = async (video, model) => {
    let predictions = await model.detect(video);
    this.renderPredictions(predictions);
    requestAnimationFrame(() => this.detectFrame(video, model));
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = '16px sans-serif';
    ctx.font = font;
    ctx.textBaseline = 'top';
    predictions.forEach(prediction => {
      if (prediction.class === 'cell phone') {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        // ctx.strokeStyle = '#00FFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = '#000000';
        ctx.fillStyle =
          // const textWidth = ctx.measureText(prediction.class).width;
          // const textHeight = parseInt(font, 10); // base 10
          ctx.fillRect(x, y, width, height);
        // ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      }
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.

      if (prediction.class === 'cell phone') {
        ctx.fillStyle = '#000000';
        ctx.fillText('Rob', x, y);
      }
      // else ctx.fillText(prediction.class, x, y);
      console.log(prediction.class);
    });
  };

  render() {
    return (
      <div className="wrapper">
        <canvas id={'detected-canvas'} className="size1" ref={this.canvasRef} width="600" height="500" />
        <video
          className="size2"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
      </div>
    );
  }
}