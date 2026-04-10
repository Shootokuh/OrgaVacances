import '../styles/LoginPage.css';
import googleLogo from '../assets/google-icon-logo.svg';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card" role="main">
        <div className="left-panel">
          <div className="left-inner">
            <div className="brand">PlanMyTrip</div>
            <div className="hero">
              <h1 className="hero-title">Plan your journeys. Simply.</h1>
              <p className="hero-sub">Organize your trips, track your budget,
                <br />and enjoy every moment.</p>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="form-wrapper">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-sub">Sign in to continue</p>

            <div className="fields" style={{marginTop:36}}>
              <label className="field">
                <span className="icon" aria-hidden>
                  {/* envelope icon */}
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 2.5C1 1.6716 1.6716 1 2.5 1H15.5C16.3284 1 17 1.6716 17 2.5V11.5C17 12.3284 16.3284 13 15.5 13H2.5C1.6716 13 1 12.3284 1 11.5V2.5Z" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 3L9 8L16 3" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input type="email" placeholder="Email address" className="input" />
              </label>

              <label className="field">
                <span className="icon" aria-hidden>
                  {/* lock icon */}
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="8" width="12" height="8" rx="1" stroke="#7C8398" strokeWidth="1.2"/>
                    <path d="M4 8V6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6V8" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input type="password" placeholder="Password" className="input" />
              </label>
            </div>

            <a className="forgot" href="#">Forgot password?</a>

            <button className="btn-primary" type="button">Sign In</button>

            <div className="divider">
              <span className="line" />
              <span className="or">OR</span>
              <span className="line" />
            </div>

            <button className="btn-google" type="button">
              <img src={googleLogo} alt="Google" className="g-icon" />
              <span className="g-text">Sign in with Google</span>
            </button>

            <div className="bottom-divider" />

            <p className="signup">Don't have an account? <a href="#">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
