import React, { Component } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import "bulma/css/bulma.css";

import "./App.css";
import Index from "./index";
import Meeting from "./meeting";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

const theme = createMuiTheme({});

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
    );
  }
}

export default App;
