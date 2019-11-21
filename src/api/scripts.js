// Adapted from https://github.com/elongineer/react-gmail-client
const mountScripts = () => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    script.onload = () => { };
    resolve();
  };
  script.onreadystatechange = () => {
    if (script.readyState === 'complete') script.onload();
  };
  document.body.appendChild(script);
});

export { mountScripts as default };
