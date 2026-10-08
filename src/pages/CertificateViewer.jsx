import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { Award, Download, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

import { toPng } from 'html-to-image';
import jsPDF from "jspdf";

function CertificateViewer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [enrollment, setEnrollment] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                const userRes = await api.get('/user/profile');
                const userData = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
                setUser(userData);

                const enrollRes = await api.get(`/enrollments/${courseId}/progress`);
                const enrollData = enrollRes.data;
                
                if (enrollData.progress < 100) {
                    setError("You have not completed this course yet.");
                } else {
                    setEnrollment(enrollData);
                }
            } catch (err) {
                console.error("Failed to load certificate data", err);
                setError("Failed to load certificate data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateData();
    }, [courseId]);

    const handlePrint = async () => {
        if (!certificateRef.current) return;
        setIsGeneratingPdf(true);
        try {
            // html-to-image perfectly captures Tailwind flexbox and SVGs
            const dataUrl = await toPng(certificateRef.current, {
                quality: 1.0,
                pixelRatio: 2, // High resolution
                cacheBust: true,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    margin: '0'
                }
            });
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${course?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'course'}_certificate.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-subtle">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium tracking-widest uppercase">Generating Certificate...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-text">
                <ShieldCheck size={64} className="text-brand-muted mb-6 opacity-50" />
                <h1 className="text-2xl font-black mb-2">Access Denied</h1>
                <p className="text-brand-subtle mb-6">{error}</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-brand-surface border border-brand-border px-6 py-2 rounded-full font-bold hover:bg-brand-elevated transition-all flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        );
    }

    const course = enrollment?.courseId || {};
    const studentName = user?.name || "Student Name";
    const completionDate = new Date(enrollment?.updatedAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const certificateId = `SKF-${enrollment?._id?.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text pb-20 selection:bg-brand-primary/30 flex flex-col">
            <div className="print:hidden">
                <NavBar />
            </div>

            <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col items-center">
                
                {/* Actions Toolbar */}
                <div className="w-full max-w-5xl flex justify-between items-center mb-8 print:hidden">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-brand-subtle hover:text-brand-text flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    
                    <button 
                        onClick={handlePrint} disabled={isGeneratingPdf}
                        className="bg-brand-primary text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <Download size={18} /> {isGeneratingPdf ? "Generating PDF..." : "Download as PDF"}
                    </button>
                </div>

                {/* Certificate Container (Scalable) */}
                <div className="w-full overflow-x-auto pb-8 print:overflow-visible flex justify-center">
                    
                    {/* The Certificate UI */}
                    <div 
                        id="certificate-node" ref={certificateRef}
                        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} className="relative w-[1123px] h-[794px] shrink-0 bg-white text-slate-900 border-[16px] border-[#1e293b] print:border-none p-12 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden print:w-full print:h-screen print:p-0 print:shadow-none"
                    >
                        {/* Background Patterns */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
                        />
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                        
                        {/* Certificate Header */}
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-100">
                                <Award size={40} className="text-indigo-600" />
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                                Certificate of Completion
                            </h1>
                            <div className="w-24 h-1 bg-indigo-600 mt-6" />
                        </div>

                        {/* Certificate Body */}
                        <div className="space-y-6 mb-12 z-10">
                            <p className="text-lg text-slate-500 font-medium uppercase tracking-widest">
                                This is to proudly certify that
                            </p>
                            <h2 className="text-6xl font-black text-slate-900 capitalize tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {studentName}
                            </h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                                has successfully completed and mastered the curriculum of the professional course:
                            </p>
                            <h3 className="text-3xl font-bold text-indigo-700 max-w-3xl mx-auto mt-2">
                                {course.title}
                            </h3>
                        </div>

                        {/* Certificate Footer */}
                        <div className="flex w-full justify-between items-end px-16 mt-auto">
                            {/* Signature Line 1 */}
                            <div className="flex flex-col items-center">
                                <div className="text-2xl font-['Brush_Script_MT',cursive] text-slate-800 mb-1">
                                    {course.instructor?.name || "SkillForge Instructor"}
                                </div>
                                <div className="w-48 h-px bg-slate-300 mb-2" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Instructor</span>
                            </div>

                            {/* Badge / Seal */}
                            <div className="flex flex-col items-center relative">
                                <div className="w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                                    <CheckCircle2 size={128} />
                                </div>
                                <div className="text-center bg-white px-4">
                                    <div className="text-sm font-black text-slate-800 mb-1 tracking-widest">SKILLFORGE</div>
                                    <div className="text-xs font-medium text-slate-500">Verified Achievement</div>
                                    <div className="text-[10px] text-slate-400 mt-2 font-mono">{certificateId}</div>
                                </div>
                            </div>

                            {/* Date Line */}
                            <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-slate-700 mb-1">
                                    {completionDate}
                                </div>
                                <div className="w-48 h-px bg-slate-300 mb-2" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date of Issue</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CertificateViewer;
