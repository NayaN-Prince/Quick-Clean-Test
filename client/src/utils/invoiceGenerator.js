import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (request) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Branding Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QUICK CLEAN', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Garbage Management Solutions', 20, 32);

    // 2. Invoice Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${request.request_id.toUpperCase()}`, 20, 62);
    doc.text(`DATE: ${new Date(request.created_at).toLocaleDateString()}`, 20, 67);

    // 3. Customer & Service Details
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(request.users?.name || 'Valued Customer', 20, 85);
    doc.text(request.users?.email || 'N/A', 20, 90);
    doc.text(request.users?.phone || 'N/A', 20, 95);

    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE DETAILS:', 120, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Waste Type: ${request.garbage_type.toUpperCase()}`, 120, 85);
    doc.text(`Status: ${request.status.toUpperCase()}`, 120, 90);
    doc.text(`Worker ID: ${request.worker_id || 'N/A'}`, 120, 95);

    // 4. Pricing Table
    const basePrice = parseFloat(request.price) || 0;
    const gstRate = 0.18;
    const gstAmount = basePrice * gstRate;
    const totalAmount = basePrice + gstAmount;

    doc.autoTable({
        startY: 110,
        head: [['Description', 'Weight', 'Unit Price', 'Total']],
        body: [
            [
                `Garbage Collection Service (${request.garbage_type})`,
                `${request.weight} kg`,
                `₹${(basePrice / request.weight).toFixed(2)}`,
                `₹${basePrice.toFixed(2)}`
            ]
        ],
        headStyles: { fillColor: [79, 70, 229] },
        theme: 'striped'
    });

    // 5. Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, finalY);
    doc.text(`₹${basePrice.toFixed(2)}`, 180, finalY, { align: 'right' });

    doc.text('GST (18%):', 140, finalY + 7);
    doc.text(`₹${gstAmount.toFixed(2)}`, 180, finalY + 7, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(140, finalY + 10, 190, finalY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GRAND TOTAL:', 140, finalY + 18);
    doc.text(`₹${totalAmount.toFixed(2)}`, 180, finalY + 18, { align: 'right' });

    // 6. Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing QuickClean. Stay Green!', pageWidth / 2, 280, { align: 'center' });

    doc.save(`Invoice_${request.request_id.slice(0, 8)}.pdf`);
};
