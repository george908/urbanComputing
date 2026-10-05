let readings = [];
let recording = false;
let startTime = null;
let sessionId = null;

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const downloadButton = document.getElementById("downloadButton");

const statusText = document.getElementById("status");
const countText = document.getElementById("count");

const xText = document.getElementById("x");
const yText = document.getElementById("y");
const zText = document.getElementById("z");


startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
downloadButton.addEventListener("click", downloadCSV);


async function startRecording() {

    // Some phones, particularly iPhones, require
    // explicit permission to access motion sensors.
    if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        const permission = await DeviceMotionEvent.requestPermission();

        if (permission !== "granted") {
            statusText.textContent = "Motion sensor permission denied.";
            return;
        }
    }

    readings = [];

    sessionId = "journey_" + Date.now();

    startTime = performance.now();
    recording = true;

    window.addEventListener("devicemotion", recordMotion);

    startButton.disabled = true;
    stopButton.disabled = false;
    downloadButton.disabled = true;

    statusText.textContent = "Recording...";
}


function recordMotion(event) {

    if (!recording) {
        return;
    }

    // Raw accelerometer values including gravity
    const acceleration = event.accelerationIncludingGravity;

    if (!acceleration) {
        return;
    }

    const elapsedTime = performance.now() - startTime;

    const reading = {
        session_id: sessionId,
        journey: document.getElementById("journey").value,
        timestamp: new Date().toISOString(),
        elapsed_ms: elapsedTime,
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z,
        sensor_interval_ms: event.interval
    };

    readings.push(reading);

    countText.textContent = readings.length;

    xText.textContent = acceleration.x?.toFixed(3);
    yText.textContent = acceleration.y?.toFixed(3);
    zText.textContent = acceleration.z?.toFixed(3);
}


function stopRecording() {

    recording = false;

    window.removeEventListener("devicemotion", recordMotion);

    startButton.disabled = false;
    stopButton.disabled = true;
    downloadButton.disabled = false;

    statusText.textContent =
        "Recording stopped. " + readings.length + " readings collected.";
}


function downloadCSV() {

    if (readings.length === 0) {
        return;
    }

    const headings = [
        "session_id",
        "journey",
        "timestamp",
        "elapsed_ms",
        "acceleration_x",
        "acceleration_y",
        "acceleration_z",
        "sensor_interval_ms"
    ];

    const rows = readings.map(reading => [
        reading.session_id,
        reading.journey,
        reading.timestamp,
        reading.elapsed_ms,
        reading.x,
        reading.y,
        reading.z,
        reading.sensor_interval_ms
    ]);

    let csv = headings.join(",") + "\n";

    for (const row of rows) {
        csv += row.join(",") + "\n";
    }

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = sessionId + ".csv";

    link.click();

    URL.revokeObjectURL(url);
}