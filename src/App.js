import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [activeTab, setActiveTab] = useState("textSummarizer");
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

    // --- Text Summarizer Logic ---
    const handleTextChange = (e) => {
        const inputValue = e.target.value;
        setCustomText(inputValue);
        validateText(inputValue);
    };

    const handleBlur = () => {
        setIsTouched(true);
        validateText(customText);
    };

    const validateText = (text) => {
        if (text.trim() === "") {
            setError("");
        } else if (countWords(text) < 70) {
            setError("⚠️ Enter at least 70 words to summarize.");
        } else {
            setError("");
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setCustomText("");
        setYoutubeUrl("");
        setSelectedVideoFile(null);
        setTranscript("");
        setTextSummary("");
        setVideoSummary("");
        setError("");
        setIsTouched(false);
    };

    const handleCustomSummarize = async () => {
        if (activeTab === "textSummarizer") {
            if (!file && countWords(customText) < 70) {
                setError("⚠️ Enter at least 70 words to summarize.");
                return;
            }
            if (error) return;

            setCustomSummarizing(true);
            setTextSummary("");

            const formData = new FormData();
            formData.append("level", summaryLevel);

            try {
                let response;
                if (file) {
                    formData.append("file", file);
                    response = await axios.post("https://ai-transcriber-summarizer-backend.onrender.com/upload", formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    setTextSummary(response.data.text);
                } else if (customText.trim()) {
                    response = await axios.post("https://ai-transcriber-summarizer-backend.onrender.com/summarize", {
                        transcript: customText,
                        level: summaryLevel,
                    });
                    setTextSummary(response.data.text);
                }
                console.log("Summarization Response:", response ? response.data : null);
            } catch (error) {
                console.error("Error summarizing:", error);
                alert("Error summarizing text.");
            } finally {
                setCustomSummarizing(false);
                setFile(null);
            }
        } else if (activeTab === "transcriber" && transcript.trim()) {
            if (countWords(transcript) < 70) {
                alert("Transcription must have at least 70 words to summarize."); // Keep this alert for clarity
                return;
            }
            setCustomSummarizing(true);
            setVideoSummary("");

            try {
                const response = await axios.post("https://ai-transcriber-summarizer-backend.onrender.com/summarize", {
                    transcript: transcript,
                    level: summaryLevel,
                });
                setVideoSummary(response.data.text);
                console.log("Transcription Summary Response:", response.data);
            } catch (error) {
                console.error("Error summarizing transcription:", error);
                alert("Error summarizing transcription.");
            } finally {
                setCustomSummarizing(false);
            }
        }
    };

    // --- Video Transcriber Logic ---
    const handleYoutubeTranscribe = async () => {
        if (!youtubeUrl.trim()) return;
        setTranscribing(true);
        setTranscript("");
        setVideoSummary("");

        try {
            const response = await axios.post("https://ai-transcriber-summarizer-backend.onrender.com/summarize-youtube", {
                videoUrl: youtubeUrl,
            });
            console.log("YouTube Transcribe Response:", response.data);
            setTranscript(response.data.transcript);
        } catch (error) {
            console.error("Error transcribing YouTube video:", error);
            alert("Error transcribing YouTube video");
        } finally {
            setTranscribing(false);
            setYoutubeUrl("");
            setSelectedVideoFile(null);
            setFile(null);
            setCustomText("");
        }
    };

    const handleVideoFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setSelectedVideoFile(selectedFile);
        setYoutubeUrl("");
        setCustomText("");
        setFile(null);
        setTranscript("");
        setTextSummary("");
        setVideoSummary("");
        setError("");
        setIsTouched(false);
    };

    const handleVideoFileTranscribe = async () => {
        if (!selectedVideoFile) {
            alert("Please select a video file.");
            return;
        }

        setTranscribing(true);
        setTranscript("");
        setVideoSummary("");

        const formData = new FormData();
        formData.append("video", selectedVideoFile);

        try {
            const response = await axios.post(
                "https://ai-transcriber-summarizer-backend.onrender.com/transcribe-video",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
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
            setFile(null);
            setCustomText("");
        }
    };

    // --- Utility Functions ---
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

    return (
        <div className="container">
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
                            disabled={file}
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>

                    <div className="section">
                        <input type="file" accept=".pdf,.txt" onChange={handleFileChange} disabled={customText.trim().length > 0} />
                    </div>

                    <div className="section">
                        <select value={summaryLevel} onChange={(e) => setSummaryLevel(e.target.value)} className="custom-select">
                            <option value="core">Core</option>
                            <option value="concise">Concise</option>
                            <option value="bullet">Bullet Points</option>
                        </select>
                        <button
                            onClick={handleCustomSummarize}
                            disabled={(!file && countWords(customText) < 70) || !!error || customSummarizing}
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
                    {/*
                    <div className="section">
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
                                disabled={customSummarizing || !transcript || countWords(transcript) < 70} // Re-introduced the word count check
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
