const flashBtn = document.getElementById('flash__button');
const sound = document.getElementById('sound');
let stream = null; // Global variable to hold the stream
let track = null;  // Global variable to hold the video track

flashBtn.addEventListener('click', async () => {
    flashBtn.classList.add('pressed');
    sound.play();

    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        alert('Flashlight control is not supported on this device or browser.');
        return;
    }

    try {
        // Request access to the camera with a preference for the rear camera
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        track = stream.getVideoTracks()[0];

        if ('torch' in track.getSettings()) {
            // Turn on the flashlight
            await track.applyConstraints({ advanced: [{ torch: true }] });

            // Turn off the flashlight after 1 second
            setTimeout(async () => {
                await track.applyConstraints({ advanced: [{ torch: false }] });
                track.stop(); // Stop using the camera
            }, 250);
        } else {
            alert('Flashlight control is not supported on this device or browser.');
        }
    } catch (error) {
        console.error('Error accessing the flashlight:', error);
        alert('Failed to access the flashlight. Please check permissions or device compatibility.');
    }
});

sound.addEventListener('ended', () => {
    flashBtn.classList.remove('pressed');
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.min.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
}