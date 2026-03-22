import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/index';
import BookingTicket from '../components/BookingTicket';
import { Home, Ticket, AlertCircle, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function BookingConfirmed() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const ticketRef = useRef(null);

    useEffect(() => {
        bookingService.getById(id)
            .then((r) => setBooking(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!ticketRef.current || downloading) return;
        
        try {
            setDownloading(true);
            const id = toast.loading("Generating PDF ticket...");
            
            // Capture the ticket wrapper div
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#0a0a0f', // Match app background
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // A4 dimensions at 72 PPI
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            const margin = 10;
            pdf.setFillColor(10, 10, 15); // Add dark background to match ticket
            pdf.rect(0, 0, pdfWidth, pdfHeight + (margin * 2), 'F');
            
            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - (margin * 2), pdfHeight - (margin * 2));
            pdf.save(`CineBook_Ticket_${booking?.showId?.movieId?.title?.replace(/\s+/g, '_') || 'Movie'}.pdf`);
            
            toast.success("Ticket downloaded successfully!", { id });
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to download ticket PDF");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (error || !booking) return (
        <div className="page-container" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
            <div style={{ maxWidth: 420, margin: '0 auto' }}>
                <div className="glass" style={{ borderRadius: 20, padding: '48px 32px' }}>
                    <AlertCircle size={52} color="#ef4444" style={{ marginBottom: 20 }} />
                    <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Booking Not Found</h2>
                    <p style={{ color: 'var(--color-muted)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                        We couldn't find this booking. It may have expired or been cancelled.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px' }}>
                            <Home size={16} /> Home
                        </Link>
                        <Link to="/bookings" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px' }}>
                            <Ticket size={16} /> My Bookings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ paddingTop: 48, paddingBottom: 60 }}>
            {/* The ref wrapper for html2canvas to capture */}
            <div ref={ticketRef} style={{ padding: '20px' }}>
                <BookingTicket booking={booking} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={downloading}
                    className="btn-primary" 
                    style={{ 
                        border: 'none', 
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        opacity: downloading ? 0.7 : 1,
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #10b981, #059669)', // Green gradient for download
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                    }}
                >
                    {downloading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                    {downloading ? 'Generating PDF...' : 'Download Ticket'}
                </button>
                    
                <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px' }}>
                    <Home size={16} /> Back to Home
                </Link>
            </div>
        </div>
    );
}
