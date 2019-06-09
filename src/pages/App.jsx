import React, { Component } from "react"
import { HashRouter as Router, Route } from "react-router-dom"
import CssBaseline from "@material-ui/core/CssBaseline"
import { AppBar, Toolbar } from "@material-ui/core"

import "bulma/css/bulma.css"

import "./App.css"
import Index from "./index"
import Meeting from "./meeting"
import { createMuiTheme } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"

// import Amplify from "aws-amplify"
// import awsconfig from "../aws-exports.js"
// import { withAuthenticator } from "aws-amplify-react"

// Amplify.configure(awsconfig)

const theme = createMuiTheme({})

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="full">
            <Route exact path="/" component={Index} />
            <Route path="/meeting" component={Meeting} />
          </div>
        </Router>
      </ThemeProvider>
    )
  }
}

// export default withAuthenticator(App)
export default App
