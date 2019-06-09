import React from "react"
import * as Cookies from "js-cookie"

import "../../assets/fonts/css/icons.css"
import Validator from "../../utils/Validator"
import { RESOLUTION_ARR } from "../../utils/Settings"
import "./index.css"
import {
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent
} from "@material-ui/core"
import { withStyles } from "@material-ui/styles"
import LogOutMenu from "../../components/LogOutMenu/LogOutMenu"

const styles = theme => {
  console.log(theme)
  return {
    header: {
      backgroundColor: theme.palette.primary.main
    },
    loginWrapper: {
      padding: theme.spacing(2),
      height: "250px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "stretch"
    }
  }
}
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      joinBtn: false,
      channel: "",
      baseMode: "avc",
      transcode: "interop",
      attendeeMode: "video",
      videoProfile: "480p_4"
    }
  }

  componentDidMount() {
    window.addEventListener("keypress", e => {
      e.keyCode === 13 && this.handleJoin()
    })
  }

  /**
   *
   * @param {String} val 0-9 a-z A-Z _ only
   * @param {Boolean} state
   */
  handleChannel = (val, state) => {
    this.setState({
      channel: val,
      joinBtn: state
    })
  }

  handleJoin = () => {
    if (!this.state.joinBtn) {
      return
    }
    console.log(this.state)
    Cookies.set("channel", this.state.channel)
    Cookies.set("baseMode", this.state.baseMode)
    Cookies.set("transcode", this.state.transcode)
    Cookies.set("attendeeMode", this.state.attendeeMode)
    Cookies.set("videoProfile", this.state.videoProfile)
    window.location.hash = "meeting"
  }

  render() {
    return (
      <div className="wrapper index">
        <div className="logOutMenuHome">
          <LogOutMenu />
        </div>
        <div className="ag-header" />
        <div className="ag-main">
          <section className="login-wrapper">
            <Card>
              <CardContent className={this.props.classes.header}>
                <div className="login-header">
                  <img
                    src={require("../../assets/images/ag-logo.png")}
                    alt=""
                  />
                  <p className="login-title">Agora Content Filters</p>
                  <p className="login-subtitle">
                    Content filters for real time communication
                  </p>
                </div>
              </CardContent>
              <CardContent>
                <div className={this.props.classes.loginWrapper}>
                  <InputChannel
                    onChange={this.handleChannel}
                    placeholder="Room name"
                  />

                  <RadioGroup
                    aria-label="Channel"
                    name="channels"
                    value={this.state.attendeeMode}
                    onChange={e =>
                      this.setState({ attendeeMode: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="video"
                      control={<Radio />}
                      label="Join as Host"
                      onChange={e =>
                        this.setState({ attendeeMode: e.target.value })
                      }
                      disabled={this.state.channel === ""}
                    />
                    <FormControlLabel
                      value="audience"
                      control={<Radio />}
                      label="Join as Audience"
                      onChange={e =>
                        this.setState({ attendeeMode: e.target.value })
                      }
                      disabled={this.state.channel === ""}
                    />
                  </RadioGroup>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={this.handleJoin}
                    disabled={!this.state.joinBtn}
                  >
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
        <div className="ag-footer">
          <a className="ag-href" href="https://www.agora.io">
            <span>Powered By Agora</span>
          </a>
          <div>
            <span>Designed at AngelHack 2019 in NYC</span>
          </div>
        </div>
      </div>
    )
  }
}

class InputChannel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorMsg: "",
      state: ""
    }
  }

  validate = val => {
    this.setState({
      state: "",
      errorMsg: ""
    })
    if (Validator.isNonEmpty(val.trim())) {
      this.setState({
        errorMsg: "Cannot be empty!",
        state: "is-danger"
      })
      return false
    } else if (Validator.minLength(val.trim(), 1)) {
      this.setState({
        errorMsg: "No shorter than 1!",
        state: "is-danger"
      })
      return false
    } else if (Validator.maxLength(val.trim(), 16)) {
      this.setState({
        errorMsg: "No longer than 16!",
        state: "is-danger"
      })
      return false
    } else if (Validator.validChar(val.trim())) {
      this.setState({
        state: "is-danger",
        errorMsg:
          'Only capital or lower-case letter, number and "_" are permitted!'
      })
      return false
    } else {
      this.setState({
        state: "is-success"
      })
      return true
    }
  }

  handleChange = e => {
    let state = this.validate(e.target.value)
    this.props.onChange(e.target.value, state)
  }

  render() {
    let validateIcon = ""
    switch (this.state.state) {
      default:
      case "":
        validateIcon = ""
        break
      case "is-success":
        validateIcon = <i className="ag-icon ag-icon-valid" />
        break
      case "is-danger":
        validateIcon = <i className="ag-icon ag-icon-invalid" />
        break
    }

    return (
      <>
        <TextField
          onInput={this.handleChange}
          type="text"
          placeholder={this.props.placeholder}
        />
        <span className="validate-icon">{validateIcon}</span>
        <div className="validate-msg">{this.state.errorMsg}</div>
      </>
    )
  }
}

class BaseOptions extends React.Component {
  constructor(props) {
    super(props)
    this._options = [
      {
        label: "Agora Video Call",
        value: "avc",
        content: "One to one and group calls"
      },
      {
        label: "Agora Live",
        value: "al",
        content:
          "Enabling real-time interactions between the host and the audience"
      }
    ]
    this.state = {
      active: false,
      message: "Agora Video Call"
    }
  }

  handleSelect = item => {
    let msg = item.label
    let val = item.value
    this.setState({
      message: msg,
      active: false
    })
    this.props.onChange(val)
  }

  render() {
    const options = this._options.map((item, index) => {
      return (
        <div
          className="dropdown-item"
          key={index}
          onClick={e => this.handleSelect(item, e)}
        >
          <p>{item.label}</p>
          <hr />
          <p>{item.content}</p>
        </div>
      )
    })

    return (
      <div className={this.state.active ? "dropdown is-active" : "dropdown"}>
        <div
          className="dropdown-trigger"
          onClick={() => this.setState({ active: !this.state.active })}
        >
          <a
            id="baseMode"
            className="ag-rounded button"
            aria-haspopup="true"
            aria-controls="baseModeOptions"
          >
            <span id="baseOptionLabel">{this.state.message}</span>
            <span className="icon is-small">
              <i className="ag-icon ag-icon-arrow-down" aria-hidden="true" />
            </span>
          </a>
        </div>
        <div className="dropdown-menu" id="baseModeOptions" role="menu">
          <div className="dropdown-content">{options}</div>
        </div>
      </div>
    )
  }
}

class AdvancedOptions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false
    }
  }

  handleRadio = e => {
    this.props.onRadioChange(e.target.value)
  }

  handleSelect = e => {
    this.props.onSelectChange(e.target.value)
  }

  render() {
    const options = Object.entries(RESOLUTION_ARR).map((item, index) => {
      return (
        <option key={index} value={item[0].split(",")[0]}>
          {item[1][0]}x {item[1][1]}, {item[1][2]}fps, {item[1][3]}kbps
        </option>
      )
    })
    return (
      <div className={this.state.active ? "dropdown is-active" : "dropdown"}>
        <div
          className="dropdown-trigger"
          onClick={() => this.setState({ active: !this.state.active })}
        >
          <a
            id="advancedProfile"
            className="ag-rounded button"
            aria-haspopup="true"
            aria-controls="advancedOptions"
          >
            <span>Advanced</span>
          </a>
        </div>
        <div className="dropdown-menu" id="advancedOptions" role="menu">
          <div className="dropdown-content">
            <div className="dropdown-item">
              <div className="control">
                <label className="radio">
                  <input
                    value=""
                    type="radio"
                    name="transcode"
                    onChange={this.handleRadio}
                  />
                  <span>VP8-only</span>
                </label>
                <label className="radio">
                  <input
                    value="interop"
                    type="radio"
                    defaultChecked
                    onChange={this.handleRadio}
                    name="transcode"
                  />
                  <span>VP8 &amp; H264</span>
                </label>
                <label className="radio">
                  <input
                    value="h264_interop"
                    type="radio"
                    onChange={this.handleRadio}
                    name="transcode"
                  />
                  <span>H264-only</span>
                </label>
              </div>
            </div>
            <div className="dropdown-item">
              <div className="select is-rounded">
                <select
                  onChange={this.handleSelect}
                  defaultValue="480p_4"
                  id="videoProfile"
                  className="ag-rounded is-clipped"
                >
                  {options}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(Index)
