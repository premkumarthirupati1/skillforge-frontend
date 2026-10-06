import { useEffect, useState, useRef } from "react";
import api from "../api";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavBar from "../components/NavBar";
import { ChevronLeft, PlayCircle, FileText, CheckCircle, Circle, Loader2, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, PanelRightClose, PanelRightOpen } from "lucide-react";

function LessonViewer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const urlCourseId = searchParams.get("courseId");

    const [lesson, setLesson] = useState(null);
    const [derivedCourseId, setDerivedCourseId] = useState(null);
    const [sidebarModules, setSidebarModules] = useState([]);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [expandedModuleId, setExpandedModuleId] = useState(null);

    const [loading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(null);

    // Custom Video Player State
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const controlsTimeout = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    // UI Polish States
    const [actionRipple, setActionRipple] = useState(null); // 'play' or 'pause'
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverX, setHoverX] = useState(0);
    const [isTheaterMode, setIsTheaterMode] = useState(false);

    const handleProgressMouseMove = (e) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        setHoverX(x);
        setHoverTime(percentage * duration);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                triggerRipple('pause');
            } else {
                videoRef.current.play();
                triggerRipple('play');
            }
            setIsPlaying(!isPlaying);
        }
    };

    const triggerRipple = (type) => {
        setActionRipple(type);
        setTimeout(() => setActionRipple(null), 600);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const skipTime = (amount) => {
        if (videoRef.current) videoRef.current.currentTime += amount;
    };

    const handleVolumeChange = (e) => {
        const val = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setVolume(val);
            setIsMuted(val === 0);
            videoRef.current.muted = val === 0;
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const nextMute = !isMuted;
            videoRef.current.muted = nextMute;
            setIsMuted(nextMute);
            if (!nextMute && volume === 0) {
                setVolume(0.5);
                videoRef.current.volume = 0.5;
            }
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 2500);
    };

    const handleMouseLeave = () => {
        if (isPlaying) setShowControls(false);
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- Ambient Glow Engine ---
    const glowCanvasRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const renderGlow = () => {
            if (videoRef.current && glowCanvasRef.current && isPlaying) {
                const video = videoRef.current;
                const canvas = glowCanvasRef.current;
                const ctx = canvas.getContext('2d');
                
                // Only draw if video has valid dimensions and is ready
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    // Reduce resolution for extreme performance
                    if (canvas.width !== 64) {
                        canvas.width = 64;
                        canvas.height = 36;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            }
            animationFrameId = requestAnimationFrame(renderGlow);
        };

        if (isPlaying) {
            renderGlow();
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying]);
    // ---------------------------

    const normalizeCompletedIds = (completedList) => {
        if (!completedList) return [];
        return completedList.map(item => typeof item === 'object' && item !== null ? (item._id || item.toString()) : item.toString());
    };

    useEffect(() => {
        const loadScreenData = async () => {
            setIsLoading(true);
            try {
                const lessonRes = await api.get(`/lessons/get-lesson/${lessonId}`);
                const lessonData = lessonRes.data;
                setLesson(lessonData);

                let finalCourseId = urlCourseId && urlCourseId !== 'undefined' ? urlCourseId : null;

                if (!finalCourseId && lessonData.moduleId) {
                    const moduleRes = await api.get(`/modules/${lessonData.moduleId}`);
                    const moduleObj = moduleRes.data.module || moduleRes.data;
                    finalCourseId = moduleObj.courseId || moduleObj.course || moduleObj.course_id;
                }

                setDerivedCourseId(finalCourseId);

                if (finalCourseId) {
                    const progressRes = await api.get(`/enrollments/${finalCourseId}/progress`);
                    const normalizedIds = normalizeCompletedIds(progressRes.data.completedLessons);
                    setCompletedLessonIds(normalizedIds);
                    setProgressPercentage(progressRes.data.progress || 0);

                    const fullCourseRes = await api.get(`/course/${finalCourseId}/full`);
                    const loadedModules = fullCourseRes.data.modules || [];
                    setSidebarModules(loadedModules);
                    
                    // Auto-expand the module containing the current lesson
                    const currentModule = loadedModules.find(m => m.lessons?.some(l => l._id.toString() === lessonId.toString()));
                    if (currentModule) {
                        setExpandedModuleId(currentModule._id);
                    }
                }
            } catch (err) {
                console.error("Screen initialization sequence error:", err);
                toast.error("Error setting up data frames.");
            } finally {
                setIsLoading(false);
            }
        };

        loadScreenData();
    }, [lessonId, urlCourseId]);

    const handleToggleComplete = async (idToToggle) => {
        if (!derivedCourseId) {
            return toast.error("Course context verification error: tracking parameter missing.");
        }

        setIsToggling(idToToggle);
        try {
            const res = await api.patch(`/enrollments/${derivedCourseId}/toggle-lesson`, { lessonId: idToToggle });
            const normalizedIds = normalizeCompletedIds(res.data.completedLessons);
            setCompletedLessonIds(normalizedIds);
            setProgressPercentage(res.data.progress || 0);
        } catch (err) {
            console.error("Toggle request execution error exception:", err);
            toast.error("Failed to update status.");
        } finally {
            setIsToggling(null);
        }
    };

    const getNextLessonId = (currentId) => {
        let foundCurrent = false;
        for (const module of sidebarModules) {
            const sortedLessons = [...(module.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
            for (const l of sortedLessons) {
                if (foundCurrent) return l._id;
                if (l._id.toString() === currentId.toString()) foundCurrent = true;
            }
        }
        return null;
    };

    const navigateToNextLesson = () => {
        const nextId = getNextLessonId(lessonId);
        if (nextId) {
            navigate(`/lesson/${nextId}?courseId=${derivedCourseId}`);
        } else {
            toast.success("You have completed all lessons in this course!");
        }
    };

    const handleVideoEnded = async () => {
        const alreadyCompleted = completedLessonIds.includes(lessonId.toString());
        if (!alreadyCompleted) {
            await handleToggleComplete(lessonId);
            toast.success("Lesson finished! Progress saved.");
        }
        // Auto-play next lesson
        setTimeout(() => {
            navigateToNextLesson();
        }, 1500); // Wait 1.5s before jumping so they see the toast
    };

    if (loading) {
        return (
            <div className="bg-brand-bg min-h-screen flex items-center justify-center text-brand-subtle">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    <p className="text-sm font-medium tracking-widest uppercase">Buffering Media Canvas...</p>
                </div>
            </div>
        );
    }

    if (!lesson) return <div className="p-20 text-center text-brand-muted bg-brand-bg min-h-screen">Lesson missing.</div>;

    const isCurrentLessonDone = completedLessonIds.includes(lessonId.toString());

    return (
        <div className="bg-brand-bg min-h-screen font-sans flex flex-col overflow-hidden">
            <NavBar />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:h-[calc(100vh-64px)] relative">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

                {/* LEFT BLOCK: Media Canvas Player */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6 relative z-10 custom-scrollbar flex flex-col">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-brand-muted hover:text-brand-text font-medium flex items-center gap-1.5 transition-colors text-sm w-fit"
                    >
                        <ChevronLeft size={16} /> Return to Dashboard
                    </button>

                    <div className={`w-full ${isTheaterMode ? 'max-w-none mx-auto lg:px-12 xl:px-24' : 'max-w-[1400px]'} flex-1 flex flex-col relative transition-all duration-500`}>
                        
                        {/* AMBIENT GLOW */}
                        {lesson.contentType === "video" && (
                            <canvas
                                ref={glowCanvasRef}
                                className={`absolute top-0 left-0 w-full aspect-video max-h-[75vh] blur-[80px] md:blur-[120px] pointer-events-none z-0 transform scale-105 transition-opacity duration-1000 ${
                                    isPlaying ? 'opacity-50 dark:opacity-40' : 'opacity-10 dark:opacity-10'
                                }`}
                            />
                        )}

                        <div className="bg-brand-surface rounded-2xl overflow-hidden shadow-2xl border border-brand-border group relative mb-6 z-10">
                            {lesson.contentType === "video" ? (
                                <div 
                                    ref={playerContainerRef}
                                    className="relative w-full aspect-video max-h-[75vh] bg-black flex flex-col justify-end group/player overflow-hidden mx-auto"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <video
                                        ref={videoRef}
                                        onClick={togglePlay}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onEnded={handleVideoEnded}
                                        className="absolute inset-0 w-full h-full focus:outline-none cursor-pointer object-contain"
                                        src={`http://localhost:3000/${lesson.content}`}
                                    />
                                    
                                    {/* Play Overlay (Initial Big Play Button) */}
                                    {!isPlaying && currentTime === 0 && (
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity"
                                            onClick={togglePlay}
                                        >
                                            <div className="w-16 h-16 bg-brand-primary/90 rounded-full flex items-center justify-center text-white backdrop-blur shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 transition-transform">
                                                <Play size={32} className="ml-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Animated Action Ripple */}
                                    {actionRipple && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                            <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white animate-ripple">
                                                {actionRipple === 'play' ? <Play size={36} className="ml-1" /> : <Pause size={36} />}
                                            </div>
                                        </div>
                                    )}

                                    {/* Glassmorphism Controls Bar */}
                                    <div className={`absolute bottom-4 left-4 right-4 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-500 z-10 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                        
                                        {/* Progress Bar */}
                                        <div 
                                            className="flex items-center gap-2 mb-3 relative cursor-pointer group/progress"
                                            onMouseMove={handleProgressMouseMove}
                                            onMouseLeave={() => setHoverTime(null)}
                                        >
                                            {/* Hover Tooltip */}
                                            {hoverTime !== null && (
                                                <div 
                                                    className="absolute -top-10 -translate-x-1/2 bg-brand-elevated/90 backdrop-blur-md border border-brand-border text-brand-text text-[10px] font-bold font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none transition-all duration-75"
                                                    style={{ left: `${hoverX}px` }}
                                                >
                                                    {formatTime(hoverTime)}
                                                </div>
                                            )}
                                            
                                            <input
                                                type="range"
                                                min={0}
                                                max={duration || 100}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all z-20 bg-white/20"
                                                style={{
                                                    background: `linear-gradient(to right, #6366f1 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-white">
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
                                                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                                </button>
                                                
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => skipTime(-10)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white" title="Backward 10s">
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button onClick={() => skipTime(10)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white" title="Forward 10s">
                                                        <RotateCw size={16} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 group/volume relative">
                                                    <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white">
                                                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                                    </button>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.05}
                                                        value={isMuted ? 0 : volume}
                                                        onChange={handleVolumeChange}
                                                        className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 h-1.5 appearance-none rounded-lg cursor-pointer bg-white/20"
                                                        style={{
                                                            background: `linear-gradient(to right, #fff ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume * 100}%)`
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div className="text-[11px] font-medium text-white/80 font-mono tracking-wide ml-2 bg-black/20 px-2 py-1 rounded-md">
                                                    {formatTime(currentTime)} / {formatTime(duration)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white" title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}>
                                                    {isTheaterMode ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                                                </button>
                                                <button onClick={toggleFullScreen} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white" title="Fullscreen">
                                                    <Maximize size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-brand-elevated text-brand-text p-10 leading-relaxed text-sm min-h-[500px] whitespace-pre-line border-t border-brand-primary/20">
                                    {lesson.content}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-2xl lg:text-3xl font-black text-brand-text tracking-tight">{lesson.title}</h1>
                                    <span className="px-2 py-0.5 bg-brand-elevated border border-brand-border text-brand-primary text-[10px] font-bold rounded uppercase tracking-wider">
                                        {lesson.contentType}
                                    </span>
                                </div>
                                <p className="text-brand-subtle text-sm">
                                    Expected Duration: {lesson.duration} minutes
                                </p>
                            </div>

                            <button
                                onClick={() => handleToggleComplete(lessonId)}
                                disabled={isToggling === lessonId}
                                className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm text-sm border flex items-center gap-2 shrink-0 ${isCurrentLessonDone
                                    ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                    : "bg-brand-text text-brand-bg hover:bg-brand-text/90 border-transparent"
                                    }`}
                            >
                                {isToggling === lessonId ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isCurrentLessonDone ? (
                                    <><CheckCircle size={16} /> Completed</>
                                ) : (
                                    "Mark as Completed"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT BLOCK: Interactive Sidebar (Hidden in Theater Mode) */}
                {!isTheaterMode && (
                    <div className="w-full lg:w-[420px] xl:w-[480px] bg-brand-surface border-t lg:border-t-0 lg:border-l border-brand-border flex flex-col shrink-0 relative z-20 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 border-b border-brand-border bg-brand-bg/50">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-brand-text">Course Syllabus</h3>
                                <span className="text-[11px] font-semibold text-brand-subtle uppercase tracking-wider">Live Progress</span>
                            </div>
                            <span className="text-brand-primary font-bold text-xl">{progressPercentage}%</span>
                        </div>

                        <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-primary transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                        {sidebarModules.sort((a, b) => (a.order || 0) - (b.order || 0)).map((module) => {
                            const isExpanded = expandedModuleId === module._id;
                            const sortedLessons = [...(module.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
                            
                            // Check if all lessons in module are complete
                            const totalLessons = sortedLessons.length;
                            const completedCount = sortedLessons.filter(l => completedLessonIds.includes(l._id.toString())).length;
                            const isModuleDone = totalLessons > 0 && totalLessons === completedCount;

                            return (
                                <div key={module._id} className="mb-2">
                                    <button 
                                        onClick={() => setExpandedModuleId(isExpanded ? null : module._id)}
                                        className="w-full flex items-center justify-between p-3 bg-brand-elevated border border-brand-border rounded-xl font-bold text-sm text-brand-text hover:border-brand-primary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-left pr-2">
                                            {isModuleDone ? <CheckCircle size={14} className="text-green-500 shrink-0" /> : <Circle size={14} className="text-brand-subtle shrink-0" />}
                                            <span className="truncate">{module.title}</span>
                                        </div>
                                        <ChevronLeft size={16} className={`shrink-0 text-brand-muted transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-180'}`} />
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="mt-1 space-y-1 pl-3 border-l-2 border-brand-primary/20 ml-2 py-2">
                                            {sortedLessons.length === 0 ? (
                                                <p className="text-xs text-brand-subtle p-2">No lessons available.</p>
                                            ) : (
                                                sortedLessons.map((item, index) => {
                                                    const isDone = completedLessonIds.includes(item._id.toString());
                                                    const isCurrent = item._id.toString() === lessonId.toString();

                                                    return (
                                                        <div
                                                            key={item._id}
                                                            onClick={() => navigate(`/lesson/${item._id}?courseId=${derivedCourseId}`)}
                                                            className={`p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${isCurrent
                                                                ? "bg-brand-surface border border-brand-primary/30 shadow-sm"
                                                                : "hover:bg-brand-surface border border-transparent"
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                                <button
                                                                    disabled={isToggling === item._id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleComplete(item._id);
                                                                    }}
                                                                    className={`mt-0.5 shrink-0 transition-all ${isDone
                                                                        ? "text-green-500"
                                                                        : "text-brand-subtle hover:text-brand-primary"
                                                                        }`}
                                                                >
                                                                    {isToggling === item._id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : isDone ? (
                                                                        <CheckCircle size={14} />
                                                                    ) : (
                                                                        <Circle size={14} />
                                                                    )}
                                                                </button>

                                                                <div className="min-w-0 flex-1">
                                                                    <p className={`text-xs truncate transition-colors ${isCurrent ? 'text-brand-text font-bold' : 'text-brand-muted font-medium'}`}>
                                                                        {index + 1}. {item.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-brand-subtle uppercase tracking-wider">
                                                                        <span>{item.duration}m</span>
                                                                        <span className="flex items-center gap-1">
                                                                            {item.contentType === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                                                                            {item.contentType}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #272A34; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366F1; }
            `}</style>
        </div>
    );
}

export default LessonViewer;