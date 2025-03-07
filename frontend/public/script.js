fetch('/api')
  .then(response => response.text())
  .then(data => {
    document.getElementById('api-response').innerText = `Backend says: ${data}`;
  });