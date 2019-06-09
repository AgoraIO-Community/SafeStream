import React from "react"

import { Auth } from "aws-amplify"

import AccountCircleIcon from "@material-ui/icons/AccountCircle"

import { IconButton, MenuItem, Menu } from "@material-ui/core"

export default class LogOutMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null
    }
  }

  handleClickMenu = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    return (
      <div>
        <IconButton
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={this.handleClickMenu}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          <MenuItem
            onClick={() => {
              Auth.signOut()
                .then(data => console.log(data))
                .catch(err => console.log(err))
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    )
  }
}
