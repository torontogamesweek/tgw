const scripts = [
    // 'https://cdn.rawgit.com/mrdoob/three.js/r129/build/three.min.js',
    'playableBackground.js',
    // 'vertexShader.js',
    // 'script4.js'
  ];
  
  if ('connection' in navigator) {
    const connectionSpeed = navigator.connection.downlink;
    if (connectionSpeed > 1) {
      scripts.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        document.head.appendChild(script);
      });
    }
  } else {
    scripts.forEach(url => {
      const script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
    });
  }


