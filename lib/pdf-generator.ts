import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, WrittenRubric, OralRubric, TutorRubric } from '@/types';

export const generateDetailedPDF = (
    reportData: any,
    project: Project,
    studentName: string,
    rubrics: { written: WrittenRubric | null, oral: OralRubric | null, tutor: TutorRubric | null },
    isAdmin: boolean,
    currentUserId: string | undefined
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // --- Header (Junta de Castilla y León Style) ---
    try {
        // Logo de la Junta de Castilla y León
        doc.addImage('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_de_la_Junta_de_Castilla_y_Le%C3%B3n.svg/512px-Logo_de_la_Junta_de_Castilla_y_Le%C3%B3n.svg.png', 'PNG', 20, 15, 30, 15);
    } catch (e) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Junta de Castilla y León', 20, yPos);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Junta de Castilla y León', 55, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Consejería de Educación', 55, yPos + 5);

    // Logo placeholder (simulated with a rectangle or line if no image)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 8, pageWidth - 20, yPos + 8);

    yPos += 20;

    // --- Title ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE EVALUACIÓN DETALLADA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // --- Section 1: Identification Data ---
    autoTable(doc, {
        startY: yPos,
        head: [['1.- DATOS DE IDENTIFICACIÓN']],
        body: [
            ['PROYECTO: ' + project.title],
            ['ALUMNO/A: ' + studentName],
            ['FECHA DE PRESENTACIÓN: ' + (project.presentationDate ? new Date(project.presentationDate).toLocaleDateString('es-ES') : 'No asignada')],
            ['LUGAR: ' + (project.presentationLocation || 'No asignado')],
            ['FECHA DE GENERACIÓN: ' + new Date().toLocaleDateString('es-ES')],
        ],
        theme: 'grid',
        headStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // --- Section 2: Summary of Scores ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2.- RESUMEN DE PUNTUACIONES', 20, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        head: [['Componente', 'Peso', 'Nota (Base 10)', 'Puntos Finales']],
        body: [
            ['Memoria Escrita', '50%', reportData.written.score.toFixed(2), reportData.written.final.toFixed(2)],
            ['Defensa Oral', '30%', reportData.oral.score.toFixed(2), reportData.oral.final.toFixed(2)],
            ['Seguimiento Tutoría', '20%', reportData.tutor.score.toFixed(2), reportData.tutor.final.toFixed(2)],
            [{ content: 'NOTA FINAL (Sobre 10)', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }, { content: reportData.total, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
        ],
        theme: 'grid',
        headStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Section 3: Detailed Breakdown ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3.- DESGLOSE POR EVALUADOR', 20, yPos);
    yPos += 5;

    reportData.evaluations.forEach((ev: any, index: number) => {
        const canViewDetails = isAdmin || ev.grader_id === currentUserId;

        // Check if we need a new page
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        autoTable(doc, {
            startY: yPos,
            head: [[{ content: `${index + 1}.- ${ev.graderName.toUpperCase()} (${ev.type.toUpperCase()})`, styles: { fillColor: [230, 230, 230] } }, { content: `Nota: ${ev.totalScore}/10`, styles: { halign: 'right', fillColor: [230, 230, 230] } }]],
            body: [],
            theme: 'grid',
            headStyles: { textColor: [0, 0, 0], fontStyle: 'bold' },
        });
        yPos = (doc as any).lastAutoTable.finalY;

        if (canViewDetails) {
            const details: any[][] = [];

            if (ev.type === 'written' && rubrics.written) {
                rubrics.written.contentItems.forEach((item: any) => {
                    details.push([item.label, (ev.scores.contentScores?.[item.id] || 0) + ' / 10']);
                });
                // Format items
                const formatOk = rubrics.written.formatItems.filter(i => ev.scores.formatScores?.[i.id]).length;
                details.push(['Items de Formato Correctos', `${formatOk} / ${rubrics.written.formatItems.length}`]);
            } else if (ev.type === 'oral' && rubrics.oral) {
                rubrics.oral.blocks.forEach((item: any) => {
                    details.push([item.label, (ev.scores.blockScores?.[item.id] || 0) + ' / ' + item.maxScore]);
                });
                details.push(['Puntuación por Tiempo', (ev.scores.timeScore || 0) + ' / 1.0']);
            } else if (ev.type === 'tutor' && rubrics.tutor) {
                rubrics.tutor.items.forEach((item: any) => {
                    details.push([item.label, (ev.scores.scores?.[item.id] || 0) + ' / 2']);
                });
            }

            if (ev.feedback) {
                details.push([{ content: 'OBSERVACIONES: ' + ev.feedback, colSpan: 2, styles: { fontStyle: 'italic', textColor: [100, 100, 100] } }]);
            }

            autoTable(doc, {
                startY: yPos,
                body: details,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 30, halign: 'center' } }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        } else {
            autoTable(doc, {
                startY: yPos,
                body: [['Los detalles de este evaluador solo son visibles para administradores o para el propio evaluador.']],
                theme: 'grid',
                styles: { fontSize: 9, fontStyle: 'italic', textColor: [150, 150, 150] }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        }
    });

    // Save the PDF
    doc.save(`Informe_${studentName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};
