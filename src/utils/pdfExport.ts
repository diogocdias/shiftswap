/**
 * PDF export utility for generating schedule PDFs.
 * Creates a black & white, printer-friendly PDF of the team schedule.
 */

import { jsPDF } from 'jspdf';
import { ShiftData, TeamMember, ShiftType } from '../types/domain';
import { getDaysInMonth, getMonthYear } from './dateUtils';

// Shift labels for PDF display
const SHIFT_LABELS: Record<ShiftType, string> = {
    M: 'M',
    A: 'A',
    N: 'N',
    R: 'R',
    D: 'D',
};

interface ExportOptions {
    year: number;
    month: number;
    shifts: ShiftData;
    teamMembers: TeamMember[];
}

/**
 * Export the team schedule to a PDF file.
 * Creates a landscape, single-page PDF with all team members and the full month.
 */
export function exportScheduleToPDF({ year, month, shifts, teamMembers }: ExportOptions): void {
    // Create PDF in landscape mode for better fit
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Get month info
    const daysInMonth = getDaysInMonth(year, month);
    const monthDate = new Date(year, month, 1);
    const monthTitle = getMonthYear(monthDate);

    // Calculate table dimensions
    const headerHeight = 12;
    const titleHeight = 10;
    const legendHeight = 8;
    const tableTop = margin + titleHeight + 4;
    const tableHeight = contentHeight - titleHeight - legendHeight - 8;

    // Calculate column widths
    const nameColumnWidth = 40;
    const dayColumnWidth = (contentWidth - nameColumnWidth) / daysInMonth;
    const rowHeight = Math.min(tableHeight / (teamMembers.length + 1), 8);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Team Schedule - ${monthTitle}`, pageWidth / 2, margin + 6, { align: 'center' });

    // Set up table styling
    doc.setFontSize(7);
    doc.setLineWidth(0.2);

    // Draw header row
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, tableTop, contentWidth, headerHeight, 'F');

    // Name column header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Name', margin + 2, tableTop + headerHeight / 2 + 2);

    // Day headers
    for (let day = 1; day <= daysInMonth; day++) {
        const x = margin + nameColumnWidth + (day - 1) * dayColumnWidth;
        const date = new Date(year, month, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // Draw cell border
        doc.rect(x, tableTop, dayColumnWidth, headerHeight);

        // Highlight weekends
        if (isWeekend) {
            doc.setFillColor(240, 240, 240);
            doc.rect(x, tableTop, dayColumnWidth, headerHeight, 'F');
            doc.rect(x, tableTop, dayColumnWidth, headerHeight);
        }

        // Day number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text(String(day), x + dayColumnWidth / 2, tableTop + 4, { align: 'center' });

        // Day name (single letter)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.text(dayName, x + dayColumnWidth / 2, tableTop + 9, { align: 'center' });
    }

    // Name column border
    doc.rect(margin, tableTop, nameColumnWidth, headerHeight);

    // Draw data rows
    teamMembers.forEach((member, rowIndex) => {
        const y = tableTop + headerHeight + rowIndex * rowHeight;

        // Alternate row colors for readability
        if (rowIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }

        // Name cell
        doc.rect(margin, y, nameColumnWidth, rowHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);

        // Truncate name if too long
        const maxNameLength = 18;
        const displayName = member.name.length > maxNameLength
            ? member.name.substring(0, maxNameLength - 2) + '..'
            : member.name;
        doc.text(displayName, margin + 2, y + rowHeight / 2 + 1.5);

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const x = margin + nameColumnWidth + (day - 1) * dayColumnWidth;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayShifts = shifts[member.id]?.[dateKey] || [];
            const date = new Date(year, month, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            // Weekend background
            if (isWeekend) {
                doc.setFillColor(245, 245, 245);
                doc.rect(x, y, dayColumnWidth, rowHeight, 'F');
            }

            // Cell border
            doc.rect(x, y, dayColumnWidth, rowHeight);

            // Shift codes
            if (dayShifts.length > 0) {
                const shiftText = dayShifts.map(s => SHIFT_LABELS[s]).join('/');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5);

                // Style rest days differently
                if (dayShifts.includes('R') || dayShifts.includes('D')) {
                    doc.setTextColor(120, 120, 120);
                } else {
                    doc.setTextColor(0, 0, 0);
                }

                doc.text(shiftText, x + dayColumnWidth / 2, y + rowHeight / 2 + 1, { align: 'center' });
                doc.setTextColor(0, 0, 0);
            }
        }
    });

    // Legend at bottom
    const legendY = tableTop + headerHeight + teamMembers.length * rowHeight + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 80);

    const legendItems = [
        'M = Morning (6:00-14:00)',
        'A = Afternoon (14:00-22:00)',
        'N = Night (22:00-6:00)',
        'R = Rest Day',
        'D = Day Off',
    ];

    const legendText = legendItems.join('    ');
    doc.text(legendText, pageWidth / 2, legendY, { align: 'center' });

    // Generated date
    doc.setFontSize(5);
    doc.text(
        `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
        pageWidth - margin,
        pageHeight - 5,
        { align: 'right' }
    );

    // Save the PDF
    const filename = `schedule-${year}-${String(month + 1).padStart(2, '0')}.pdf`;
    doc.save(filename);
}
