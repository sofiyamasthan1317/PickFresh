import {Component} from 'react'
import './index.css'
import logo from './pickfresh_logo.png' 

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    isLoginFailed: false,
    errMsg: '',
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  submitForm = event => {
  event.preventDefault()
  const {username, password} = this.state

  if (username === 'sofiya30@gmail.com' && password === 'sofiya') {
    alert("Login Successfull")
    localStorage.setItem('isLoggedIn', 'true')
    window.location.replace('/')
  } else {
    this.setState({isLoginFailed: true, errMsg: 'Invalid Username or Password'})
  }
}


  render() {
    const {username, password, isLoginFailed, errMsg} = this.state

    return (
      <div className="login-container">
        <div className='container'>
          <div className='image-container'>
            <img src="https://www.lalpathlabs.com/blog/wp-content/uploads/2019/01/Fruits-and-Vegetables.jpg" alt="login page img" className='bg-image' />
          </div>
          <div className="right-container">
           
          <form className="form" onSubmit={this.submitForm}>
             <div className="logo-container">
               <img src={logo} alt="PickFresh Logo" className="site-logo" />
              </div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="input"
              placeholder="Enter Email"
              value={username}
              onChange={this.onChangeUsername}
            />

            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input"
              placeholder="Enter Password"
              value={password}
              onChange={this.onChangePassword}
            />

            <button type="submit" className="login-button">
              Login
            </button>

            {isLoginFailed && <p className="error-msg">{errMsg}</p>}
          </form>
        </div>
        </div>
      </div>
    )
  }
}

export default LoginForm
