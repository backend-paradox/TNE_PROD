import './Loading.css';

export default function Loading({ fullScreen = false, size = 'medium' }) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`spinner spinner-primary spinner-${size}`}></div>
    </div>
  );
}
