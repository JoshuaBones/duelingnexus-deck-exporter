  function showMessage(txtMessage = 'Success!', success = true, seconds = 1) {
    const message = document.createElement('div');
    message.innerText = txtMessage;
    message.style.position = 'fixed';
    message.style.top = '10px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = success ? 'green' : 'red';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    document.body.appendChild(message);
    setTimeout(() => {
        document.body.removeChild(message);
    }, seconds * 1000);
  }