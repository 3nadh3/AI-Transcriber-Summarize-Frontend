// App.js (React Frontend)

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [activeTab, setActiveTab] = useState("textSummarizer");
    const [summary, setSummary] = useState("");
    const [customText, setCustomText] = useState("");
    const [textSummary, setTextSummary] = useState("");
    const [customSummarizing, setCustomSummarizing] = useState(false);
    const [summaryLevel, setSummaryLevel] = useState("core");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [isTouched, setIsTouched] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoSummary, setVideoSummary] = useState("");
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [transcript, setTranscript] = useState("");
    const [transcribing, setTranscribing] = useState(false);
    const [uploadedFileContent, setUploadedFileContent] = useState("");

    const handleTextChange = (e) => {
        const inputValue = e.target.value;
        setCustomText(inputValue);

        if (inputValue.trim() === "") {
            setError("");
        } else if (countWords(inputValue) < 70) {
            setError("⚠️ Enter at least 70 words to summarize.");
        } else {
            setError("");
        }
    };

    const handleBlur = () => {
        setIsTouched(true);
        if (customText.trim() !== "" && countWords(customText) < 70) {
            setError("⚠️ Enter at least 70 words to summarize.");
        } else {
            setError("");
        }
    };

    const countWords = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const formatSummary = (text) => {
        if (summaryLevel === "bullet") {
            const bulletPoints = text.split(/[\n\r]+|\*\s+|\-\s+|\d+\.\s+/).filter(point => point.trim());
            return (
                <ul>
                    {bulletPoints.map((point, index) => (
                        <li key={index}>{point.trim()}</li>
                    ))}
                </ul>
            );
        }
        return <p>{text}</p>;
    };

    const handleFileChange = (event) => {
        console.log("File Change Event:", event);
        const selectedFile = event.target.files[0];
        console.log("Selected File:", selectedFile);
        if (!selectedFile) return;
        setFile(selectedFile);
        setCustomText("");
        setUploadedFileContent(""); // Clear any previous incorrect content
        console.log("File:", selectedFile);
        console.log("File State:", file);
    };

    useEffect(() => {
        console.log("useEffect - file:", file);
    }, [file]);

    useEffect(() => {
        console.log("useEffect - uploadedFileContent:", uploadedFileContent);
    }, [uploadedFileContent]);

    const handleCustomSummarize = async () => {
        if (!transcript && !customText.trim() && !file) return;
        setCustomSummarizing(true);

        if (activeTab === "textSummarizer" && file) {
            // Handle file upload summary using the /upload endpoint
            const formData = new FormData();
            formData.append("file", file);
            formData.append("level", summaryLevel);

            try {
                const response = await axios.post("http://localhost:5000/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log("File upload response:", response.data);
                setTextSummary(response.data.text); // Assuming the backend sends back { text: 'summary' }
            } catch (error) {
                console.error("File upload error:", error);
                alert("Error uploading and summarizing file.");
            } finally {
                setCustomSummarizing(false);
                setFile(null);
                setUploadedFileContent(""); // Clear the incorrect content
            }
            return;
        }

        // Existing logic for summarizing text entered in the textarea
        if (activeTab === "textSummarizer") {
            setTextSummary("");
        } else {
            setVideoSummary("");
        }

        try {
            const textToSummarize = transcript || customText;
            const summarizePrompt = `Provide a concise summary of the following text, ensuring the output contains only the summary and no extra introductory phrases: ${textToSummarize}`;
            const response = await axios.post("http://localhost:5000/summarize", {
                transcript: summarizePrompt,
                level: summaryLevel,
            });
            console.log("API Response:", response.data.text);

            if (activeTab === "textSummarizer") {
                setTextSummary(response.data.text);
            } else {
                setVideoSummary(response.data.text);
            }

            console.log("Custom Summary State:", activeTab === "textSummarizer" ? textSummary : videoSummary);
        } catch (error) {
            alert("Error summarizing text");
        } finally {
            setCustomSummarizing(false);
        }
    };

    const handleYoutubeTranscribe = async () => {
        if (!youtubeUrl.trim()) return;
        setTranscribing(true);
        setTranscript("");

        try {
            const response = await axios.post("http://localhost:5000/summarize-youtube", {
                videoUrl: youtubeUrl,
            });
            console.log("YouTube Transcribe Response:", response.data);
            console.log("Transcript from API:", response.data.transcript);
            setTranscript(response.data.transcript);
            console.log("Transcript State:", transcript);
        } catch (error) {
            console.error("Error transcribing YouTube video:", error);
            alert("Error transcribing YouTube video");
        } finally {
            setTranscribing(false);
            setYoutubeUrl("");
            setSelectedVideoFile(null);
            setCustomText("");
            setFile(null);
        }
    };

    const handleVideoFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/')) {
                setSelectedVideoFile(selectedFile);
            } else {
                alert('Please select a valid video or audio file.');
                event.target.value = null;
                setSelectedVideoFile(null);
            }
        }
    };

    const handleVideoFileTranscribe = async () => {
        if (!selectedVideoFile) {
            alert("Please select a video file.");
            return;
        }

        setTranscribing(true);
        setTranscript("");

        const formData = new FormData();
        formData.append("video", selectedVideoFile);

        console.log("FormData:", formData);
        console.log("File type:", selectedVideoFile.type);
        console.log("File size:", selectedVideoFile.size);

        try {
            const response = await axios.post(
                "http://localhost:5000/transcribe-video",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            console.log("Video Transcribe Response:", response.data);
            setTranscript(response.data.transcript);
        } catch (error) {
            console.error("Error transcribing video file:", error);
            if (error.response) {
                alert(`Error transcribing video file: ${error.response.data.error}`);
            } else {
                alert("Error transcribing video file");
            }
        } finally {
            setTranscribing(false);
            setSelectedVideoFile(null);
            setYoutubeUrl("");
            setCustomText("");
            setFile(null);
        }
    };

    return (
        <div className="container">
            {console.log("Component re-rendered!")}
            <h1>🎧 AI Transcriber & Summarizer</h1>

            <div className="tabs">
                <button className={activeTab === "textSummarizer" ? "active" : ""} onClick={() => setActiveTab("textSummarizer")}>
                    ✍️ Text Summarization
                </button>
                <button className={activeTab === "transcriber" ? "active" : ""} onClick={() => setActiveTab("transcriber")}>
                    🔊 Video Transcriber
                </button>
            </div>

            {activeTab === "textSummarizer" && (
                <div className="card">
                    <h2>✍️ Text Summarization</h2>
                    <div className="section">
                        <textarea
                            value={customText}
                            onChange={handleTextChange}
                            onBlur={handleBlur}
                            placeholder="Enter text to summarize..."
                            className={error ? "error-border" : ""}
                            disabled={file || youtubeUrl || selectedVideoFile}
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>

                    <div className="section">
                        <input type="file" accept=".pdf,.txt" onChange={handleFileChange} disabled={customText.trim().length > 0 || youtubeUrl || selectedVideoFile} />
                    </div>

                    <div className="section">
                        <select value={summaryLevel} onChange={(e) => setSummaryLevel(e.target.value)} className="custom-select">
                            <option value="core">Core</option>
                            <option value="concise">Concise</option>
                            <option value="bullet">Bullet Points</option>
                        </select>
                        <button
                            onClick={handleCustomSummarize}
                            disabled={
                                (!file && countWords(customText) < 70) || !!error || customSummarizing
                            }
                        >
                            {customSummarizing ? <div className="loading-spinner"></div> : "Summarize Text"}
                        </button>
                    </div>

                    {textSummary && (
                        <div className="output-box">
                            {formatSummary(textSummary)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "transcriber" && (
                <div className="card">
                    <h2>🔊 Video & Audio Transcriber</h2>
              {/*     <div className="section">
                        <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube URL" disabled={selectedVideoFile} />
                        <button onClick={handleYoutubeTranscribe} disabled={transcribing || !youtubeUrl.trim() || selectedVideoFile}>
                            {transcribing ? <div className="loading-spinner"></div> : "Transcribe YouTube"}
                        </button>
                    </div>
*/}
                    <div className="section">
                        <input type="file" accept="video/*, audio/*" onChange={handleVideoFileChange} disabled={youtubeUrl} />
                        <button
                            onClick={handleVideoFileTranscribe}
                            disabled={transcribing || !selectedVideoFile || youtubeUrl}
                        >
                            {transcribing ? <div className="loading-spinner"></div> : "Transcribe Video File"}
                        </button>
                    </div>

                    {transcript && transcript.length > 0 && (
                        <div className="section">
                            <div className="output-box">
                                {transcript}
                                <p className="word-count">Word count: {countWords(transcript)}</p>
                                {countWords(transcript) < 70 && (
                                    <p className="warning">
                                        ⚠️ Transcription must have at least 70 words.
                                    </p>
                                )}
                            </div>
                            <select value={summaryLevel} onChange={(e) => setSummaryLevel(e.target.value)} className="custom-select">
                                <option value="core">Core</option>
                                <option value="concise">Concise</option>
                                <option value="bullet">Bullet Points</option>
                            </select>
                            <button
                                onClick={handleCustomSummarize}
                                disabled={customSummarizing || !transcript}
                            >
                                {customSummarizing ? <div className="loading-spinner"></div> : "Summarize Transcription"}
                            </button>
                        </div>
                    )}

                    {videoSummary && (
                        <div className="output-box">
                            {formatSummary(videoSummary)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;