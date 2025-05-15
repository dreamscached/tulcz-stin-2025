const logContainer = document.getElementById("logContainer");

function scrollToBottom() {
    logContainer.scrollTop = logContainer.scrollHeight;
}

function isAtBottom(container) {
    return container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
}

function renderLog(msg) {
    const shouldScroll = isAtBottom(logContainer);
    const logEntry = document.createElement("div");

    try {
        const json = typeof msg === "string" ? JSON.parse(msg) : msg;
        const level = (json.level ?? "info").toLowerCase();
        let timestamp = json.time;
        if (typeof timestamp === "number") {
            timestamp = new Date(timestamp).toLocaleString();
        }

        const message = json.msg ?? "(no message)";
        const extra = { ...json };
        delete extra.time;
        delete extra.timestamp;
        delete extra.level;
        delete extra.msg;
        delete extra.message;

        logEntry.className = `log-entry ${level}`;
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="timestamp">${timestamp}</span>
                <span class="level">${level}</span>
            </div>
            <div class="log-message">${message}</div>
            ${Object.keys(extra).length ? `
                <button class="toggle-extra">Show details ▼</button>
                <div class="log-extra hidden">
                    <pre>${JSON.stringify(extra, null, 2)}</pre>
                </div>` : ""}
        `;
    } catch {
        logEntry.className = "log-entry error";
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="timestamp">${new Date().toISOString()}</span>
                <span class="level">invalid</span>
            </div>
            <div class="log-message">${msg}</div>
        `;
    }

    logContainer.appendChild(logEntry);
    if (shouldScroll) scrollToBottom();

    const toggle = logEntry.querySelector(".toggle-extra");
    const extra = logEntry.querySelector(".log-extra");
    if (toggle && extra) {
        toggle.addEventListener("click", () => {
            const hidden = extra.classList.toggle("hidden");
            toggle.textContent = hidden ? "Show details ▼" : "Hide details ▲";
        });
    }
}

const socket = io("/log");
socket.on("log", (msg) => renderLog(msg));
