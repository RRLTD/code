import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Tooltip from '@mui/joy/Tooltip';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Divider from '@mui/joy/Divider';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentSection, setCurrentSection] = React.useState(0);
    const [currentLine, setCurrentLine] = React.useState(0);
    const [error, setError] = React.useState('');
    const [song, setSong] = React.useState([]);
    const [lyrics, setLyrics] = React.useState([]);
    const reset = React.useRef(false);
    const navigate = useNavigate();
    let params = useParams();

    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth/login');
        fetch('http://localhost:3010/auth/me', {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    navigate('/auth/login')
                } else {
                    if (json.user) {
                        fetch(`http://172.20.10.3:3000/song/${params.id}`, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: token,
                            },
                            method: 'GET'
                        })
                            .then(res => res.json())
                            .then(json => {
                                if (json.error) {
                                    setError('The backend returned an error, please contact a website administrator. Error: ' + json.error);
                                    setIsLoading(false);
                                } else {
                                    if (json.song) {
                                        setSong(json.song);
                                        fetch(`http://172.20.10.3:3000/${json.song._id}/lyrics.json`)
                                            .then(res => res.json())
                                            .then(json => {
                                                setLyrics(json)
                                                setIsLoading(false);
                                                setTimeout(() => {
                                                    const video = document.getElementById("video");
                                                    let requestID;
                                                    let currentLyricIndex = 0; // Keep track of the current lyric index
                                                    let currentLineIndex = 0;
                                                    let currentSectionIndex = 0;
                                                    let changeSection = false;

                                                    async function logCurrentLyric() {
                                                        const currentTimeInMs = video.currentTime * 1000;
                                                        const currentSection = json.sections[currentSectionIndex];
                                                        const currentLine = currentSection.lines[currentLineIndex];
                                                        const lyrics = currentLine.lyrics;

                                                        if (reset.current) {
                                                            currentLyricIndex = 0;
                                                            currentLineIndex = 0;
                                                            currentSectionIndex = 0;
                                                            reset.current = false
                                                        }

                                                        if (currentLyricIndex < lyrics.length) {
                                                            console.log(currentTimeInMs)
                                                            if (lyrics[currentLyricIndex].timestamp <= currentTimeInMs) {
                                                                if (changeSection) {
                                                                    setCurrentSection(currentSectionIndex);
                                                                    changeSection = false;
                                                                    await sleep(10)
                                                                }
                                                                const lyric = lyrics[currentLyricIndex];
                                                                document.getElementById(`section-${currentSectionIndex}-lyric-${currentLyricIndex}-line-${currentLineIndex}`).style.color = "#8026ff";
                                                                if (currentLyricIndex === 0 && currentLineIndex > 0) {
                                                                    const prevLine = currentLineIndex > 0 ? currentLineIndex - 1 : 0;
                                                                    const lastLyricIndex = json.sections[currentSectionIndex].lines[prevLine].lyrics.length - 1;
                                                                    document.getElementById(`section-${currentSectionIndex}-lyric-${lastLyricIndex}-line-${prevLine}`).style.color = "#d9beff";
                                                                }
                                                                if ((currentLyricIndex - 1) != -1) {
                                                                    document.getElementById(`section-${currentSectionIndex}-lyric-${currentLyricIndex - 1}-line-${currentLineIndex}`).style.color = "#d9beff";
                                                                }
                                                                console.log(`Timestamp: ${lyric.timestamp} ms, Type: ${lyric.type}`);
                                                                currentLyricIndex++;
                                                            }
                                                        } else {
                                                            console.log("end of line")
                                                            if (currentLineIndex >= currentSection.lines.length - 1) {
                                                                console.log("end of section")
                                                                // All lines in the current section have ended
                                                                if (currentSectionIndex >= json.sections.length - 1) {
                                                                    console.log("song ended")
                                                                    // Song has ended
                                                                    cancelAnimationFrame(requestID);
                                                                    return;
                                                                } else {
                                                                    console.log("changing sections")
                                                                    currentSectionIndex++;
                                                                    changeSection = true;
                                                                    currentLineIndex = 0;
                                                                    currentLyricIndex = 0;
                                                                }
                                                            } else {
                                                                currentLineIndex++;
                                                                currentLyricIndex = 0;
                                                            }
                                                        }

                                                        requestID = requestAnimationFrame(logCurrentLyric);
                                                    }

                                                    video.addEventListener("play", () => {
                                                        requestID = requestAnimationFrame(logCurrentLyric);
                                                    });

                                                    video.addEventListener("pause", () => {
                                                        cancelAnimationFrame(requestID);
                                                    });

                                                    video.addEventListener("ended", () => {
                                                        cancelAnimationFrame(requestID);
                                                        setIsPlaying(false);
                                                    });
                                                }, 10);
                                            })
                                            .catch(e => {
                                                setError("There was an error contacting the backend, please contact a website administrator");
                                                setIsLoading(false);
                                            });
                                    } else {
                                        setError('The backend did not return the song or an error, please contact a website administrator.');
                                        setIsLoading(false);
                                    }
                                }
                            })
                            .catch(e => {
                                setError("There was an error contacting the backend, please contact a website administrator");
                                setIsLoading(false);
                            })
                    } else {
                        setError('The backend did not return a user or an error, please contact a website administrator.');
                        setIsLoading(false);
                    }
                }
            })
            .catch(e => {
                setError("There was an error contacting the backend, please contact a website administrator");
                setIsLoading(false);
            })
    }, [])

    const playVideo = () => {
        document.getElementById("video").play();
        setIsPlaying(true);
    }

    const pauseVideo = () => {
        document.getElementById("video").pause();
        setIsPlaying(false);
    }

    const replayVideo = async () => {
        document.getElementById("video").currentTime = 0;
        setCurrentSection(0);
        await sleep(10)
        reset.current = true
        lyrics.sections[0].lines.forEach((line, lineIndex) => {
            line.lyrics.forEach((lyric, lyricIndex) => {
                document.getElementById(`section-0-lyric-${lyricIndex}-line-${lineIndex}`).style.color = "";
            })
        })
    }

    return (
        isLoading
            ?
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 68.5px)' }}>
                <CircularProgress />
            </Box>
            :
            error
                ?
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 68.5px)' }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
                :
                <Box>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
                            <Box>
                                <Breadcrumbs aria-label="breadcrumbs">
                                    <Box style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => navigate('/dashboard')}>
                                        <DashboardRoundedIcon />
                                        <Typography>Dashboard</Typography>
                                    </Box>
                                    <Typography style={{ color: "var(--variant-plainColor, rgba(var(--joy-palette-neutral-mainChannel) / 1))" }}>Song</Typography>
                                    <Typography style={{ color: "var(--variant-plainColor, rgba(var(--joy-palette-neutral-mainChannel) / 1))" }}>{song.name}</Typography>
                                </Breadcrumbs>
                                <Typography level="h3">
                                    {song.name}
                                </Typography>
                                <Typography level="body-md">
                                    {song.artist}
                                </Typography>
                            </Box>
                            <img height={100} src={`https://media.learnitsignit.co.uk/${song._id}/cover.jpeg`} style={{ borderRadius: '0.25rem' }} />
                        </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'row', gap: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: "center", gap: 1 }}>
                            <Tooltip title="Replay song">
                                <IconButton aria-label="replay" onClick={() => replayVideo()}>
                                    <ReplayIcon />
                                </IconButton>
                            </Tooltip>
                            {isPlaying
                                ?
                                <Tooltip title="Pause song">
                                    <IconButton aria-label="plause" onClick={() => pauseVideo()}>
                                        <PauseIcon />
                                    </IconButton>
                                </Tooltip>
                                :
                                <Tooltip title="Play song">
                                    <IconButton aria-label="play" onClick={() => playVideo()}>
                                        <PlayArrowIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                        <Box sx={{ width: "75%", height: "calc(100vh - 307px);", mt: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: "center", height: "100%", textAlign: "left" }}>
                                {lyrics.sections[currentSection].lines.map((line, lineIndex) =>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: "center", justifyContent: "center", textAlign: "left" }}>
                                        {line.lyrics.map((lyric, index) => lyric.type === "word" ?
                                            index == 0
                                                ?
                                                <Typography level="h3" id={`section-${currentSection}-lyric-${index}-line-${lineIndex}`} key={`section-${currentSection}-lyric-${index}-line-${lineIndex}`}>{lyric.word}</Typography>
                                                :
                                                <Typography level="h3" id={`section-${currentSection}-lyric-${index}-line-${lineIndex}`} key={`section-${currentSection}-lyric-${index}-line-${lineIndex}`}>&nbsp;{lyric.word}</Typography>

                                            :
                                            lyric.type === "firstpart" ?
                                                <Typography level="h3" id={`section-${currentSection}-lyric-${index}-line-${lineIndex}`} key={`section-${currentSection}-lyric-${index}-line-${lineIndex}`}>&nbsp;{lyric.part}</Typography>
                                                :
                                                lyric.type === "part" ?
                                                    <Typography level="h3" id={`section-${currentSection}-lyric-${index}-line-${lineIndex}`} key={`section-${currentSection}-lyric-${index}-line-${lineIndex}`}>{lyric.part}</Typography>
                                                    :
                                                    null
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ width: "25%", height: "calc(100vh - 307px);", mt: 4 }}>
                            <video style={{ width: "100%", height: "100%", objectFit: "contain" }} id="video">
                                <source src={`https://media.learnitsignit.co.uk/${song._id}/video.mp4`} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </Box>
                    </Box>
                </Box >
    )
}