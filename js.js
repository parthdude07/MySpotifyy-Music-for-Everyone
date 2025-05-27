let songduration = 0;
let currentTime = 0;
let currentSong = null;
let audioElement = null;
let currentfoldername = "favourite"; // Change this to your folder name
let isPlaying = false;

function formatTime(seconds, totalSeconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}/${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(Math.floor(totalSeconds % 60)).padStart(2, '0')}`;
}
async function getFolderName() {
    let response = await fetch('http://127.0.0.1:3000/songs');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    let data = await response.text();

    // Create a virtual DOM to parse the HTML
    let div = document.createElement("div");
    div.innerHTML = data;

    // Extract folder names from anchor tags
    let links = div.querySelectorAll("a");
    let folderNames = [];

    links.forEach(link => {
        let href = link.getAttribute("href");
        if (href && href !== "../") {
            // Remove trailing slash
            href = href.replace(/\/$/, '');
            // Get the final segment (last part of the path)
            let segments = href.split('/');
            let finalFolderName = segments[segments.length - 1];
            let parts = finalFolderName.split('\\');
            folderNames.push(parts[parts.length - 1]); // Use the last part after any backslashes
        }
    });
    console.log(folderNames);
    return folderNames;
}
async function getCoverImage(folderName) {
    try {
        let response = await fetch(`http://127.0.0.1:3000/songs/${folderName}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let links = div.querySelectorAll("a");

        for (let link of links) {
            let href = link.getAttribute("href");
            if (href && (href.endsWith(".jpeg") || href.endsWith(".png") || href.endsWith(".jpg"))) {
                let sanitizedFolder = folderName.replace(/\\/g, "/");
                let sanitizedhref = href.replace(/\\/g, "/");

                let imageUrl = `http://127.0.0.1:3000${sanitizedhref}`;

                return imageUrl;
            }
        }

        return "defaultcover.png"; // fallback
    } catch (err) {
        console.error(`Error fetching cover for ${folderName}:`, err);
        return "defaultcover.png"; // fallback
    }
}

async function getSongs() {
    let a = await fetch(`http://127.0.0.1:3000/songs/${currentfoldername}`);

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
        
    }
    return songs;
}

async function main() {
    let songs = await getSongs();
    //console.log(songs);

    let container = document.querySelector('.songlist');
    container.innerHTML = ""; // clear old song list before appending new ones
    if (songs.length === 0) {
        container.innerHTML = "<p>No songs found in this folder.</p>";
        return;
    }
    audioElement = document.getElementById("myAudio");
    currentSong = audioElement;

    // Add timeupdate listener
    audioElement.addEventListener("timeupdate", () => {
        songduration = currentSong.duration;
        currentTime = currentSong.currentTime;
        let progressBar = document.querySelector('.progressbar');
        if (songduration > 0) {
            let progress = (currentTime / songduration) * 100;
            progressBar.style.width = `${progress}%`;
        }
        document.querySelector('.showtime').innerText = formatTime(currentTime, songduration);

    });

    songs.forEach(song => {
        let div = document.createElement('div');
        div.innerHTML = `
          <div class="songcard box2" data-src="${song}"> 
            <div>
                🎵
            </div>
            <div>
                <div class="songname">${decodeURIComponent(song.split('/').pop())}</div>
                <div class="artist">prth</div>
            </div>
          </div>
        `;
        div.querySelector('.songcard').addEventListener('click', () => {
            audioElement.src = song;
            if(isPlaying){
              audioElement.play();
            }else{
                audioElement.pause();
            }
            
            document.querySelector('.currentsongname').innerHTML = `<h4>${decodeURIComponent(song.split('/').pop())}</h4>`;
        });

        container.appendChild(div);
    });
    const volumeSlider = document.getElementById('volumeControl');
    volumeSlider.addEventListener('input', function () {
        if (audioElement) {
            audioElement.volume = this.value / 100;
        }
    });
    //for folderr names to create each album
    let folderNames = await getFolderName();
    let folderContainer = document.querySelector('.playlist');
    folderContainer.innerHTML = ""; // Clears old songs before adding new ones


    for (let folder of folderNames) {
    let foldercover = await getCoverImage(folder); // Await the actual image fetch
    let folderDiv = document.createElement('div');
    console.log(foldercover);


    folderDiv.innerHTML = `
       <div class="card box">
            <div><img src="${foldercover}" alt="cover image" /></div>
            <div><h3>${folder}</h3></div>
            <div><p>Hits to boost your mood and fill you with...</p></div>
            <div class="play"><svg width="80px" height="80px" viewBox="0 0 24.00 24.00" fill="none"
                            xmlns="http://www.w3.org/2000/svg" stroke="#29bc01" transform="rotate(0)"
                            stroke-width="1.32">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"
                                stroke="#00520e" stroke-width="1.584">
                                <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    fill="#00020a"></path>
                                <path
                                    d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z"
                                    fill="#00020a"></path>
                            </g>
                            <g id="SVGRepo_iconCarrier">
                                <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    fill="#00020a"></path>
                                <path
                                    d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z"
                                    fill="#00020a"></path>
                            </g>
                        </svg></div>
       </div>
    `;

    folderDiv.addEventListener('click', () => {
        currentfoldername = decodeURIComponent(folder);
        main();
    });

    folderContainer.appendChild(folderDiv);
}


    // Set initial song name display
    if (audioElement.src) {
        document.querySelector('.currentsongname').innerHTML = `<h4>${decodeURIComponent(audioElement.src.split('/').pop())}</h4>`;
    }



}




document.addEventListener('DOMContentLoaded', () => {
    main();


    // Make progress bar responsive
    const progressBarContainer = document.querySelector('.seekbar');
    const progressBar = document.querySelector('.progressbar');
    if (progressBarContainer && progressBar) {
        progressBarContainer.addEventListener('click', function (e) {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percent = clickX / width;
            if (audioElement && audioElement.duration) {
                audioElement.currentTime = percent * audioElement.duration;
            }
        });
    }

});

const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

document.getElementById("nextsong").addEventListener("click", () => {
    if (audioElement) {
        let songCards = Array.from(document.querySelectorAll('.songcard'));
        let currentIndex = songCards.findIndex(card => card.getAttribute('data-src') === audioElement.src);
        let nextIndex = (currentIndex + 1) % songCards.length;
        let nextCard = songCards[nextIndex];

        // Update audio source
        audioElement.src = nextCard.getAttribute('data-src');
        if (!isPlaying) {
            audioElement.pause();

        } else {
            audioElement.play();

        }


        // Update current song name display
        document.querySelector('.currentsongname').innerHTML = `<h4>${nextCard.querySelector('.songname').innerText}</h4>`;
    }
});
document.getElementById("prevsong").addEventListener("click", () => {
    if (audioElement) {
        let songCards = Array.from(document.querySelectorAll('.songcard'));
        let currentIndex = songCards.findIndex(card => card.getAttribute('data-src') === audioElement.src);
        let nextIndex = (currentIndex - 1 + songCards.length) % songCards.length;

        let nextCard = songCards[nextIndex];

        // Update audio source
        audioElement.src = nextCard.getAttribute('data-src');

        if (!isPlaying) {
            audioElement.pause();

        } else {
            audioElement.play();

        }
        // Update current song name display
        document.querySelector('.currentsongname').innerHTML = `<h4>${nextCard.querySelector('.songname').innerText}</h4>`;
    }
});




function togglePlay() {
    if (!audioElement) return;

    if (audioElement.paused || audioElement.ended) {
        audioElement.play();
        isPlaying = true;
        playIcon.style.display = "none";
        pauseIcon.style.display = "inline";
    } else {
        audioElement.pause();
        isPlaying = false;
        playIcon.style.display = "inline";
        pauseIcon.style.display = "none";
    }

    // Update current song name
    if (audioElement.src) {
        document.querySelector('.currentsongname').innerHTML = `
            <h4>${decodeURIComponent(audioElement.src.split('/').pop())}</h4>
        `;
    }
}
