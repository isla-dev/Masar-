export interface CertificateTemplateData {
  studentName: string;
  courseTitle: string;
  teacherName: string;
  completedAt: Date;
  certificateNumber: string;
  verificationUrl: string;
  qrCodeDataUrl: string;
  /** Course language decides direction/typeface for the certificate body text. */
  language: 'en' | 'fr' | 'ar';
  platformName?: string;
  /** Base64 data URI of the platform logo, embedded so the PDF has no external file dependency. */
  logoDataUrl: string;
}

const LABELS = {
  en: {
    title: 'Certificate of Completion',
    presented: 'This certifies that',
    completed: 'has successfully completed the course',
    instructor: 'Instructor',
    date: 'Date of completion',
    certId: 'Certificate ID',
    verify: 'Verify this certificate at',
  },
  fr: {
    title: 'Certificat de réussite',
    presented: "Ceci certifie que",
    completed: 'a terminé avec succès le cours',
    instructor: 'Formatrice',
    date: "Date d'achèvement",
    certId: 'Numéro de certificat',
    verify: 'Vérifiez ce certificat sur',
  },
  ar: {
    title: 'شهادة إتمام',
    presented: 'تشهد هذه الوثيقة بأن',
    completed: 'قد أتمّت بنجاح دورة',
    instructor: 'المدرّبة',
    date: 'تاريخ الإتمام',
    certId: 'رقم الشهادة',
    verify: 'يمكن التحقق من هذه الشهادة عبر',
  },
};

function formatDate(date: Date, language: 'en' | 'fr' | 'ar') {
  const locale = language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildCertificateHtml(data: CertificateTemplateData): string {
  const labels = LABELS[data.language];
  const dir = data.language === 'ar' ? 'rtl' : 'ltr';
  const bodyFont =
    data.language === 'ar'
      ? "'Cairo', 'Noto Kufi Arabic', sans-serif"
      : "'Fraunces', Georgia, serif";
  const platformName = data.platformName ?? 'Masar+';

  return `<!doctype html>
<html lang="${data.language}" dir="${dir}">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&family=Cairo:wght@400;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 297mm;
    height: 210mm;
    font-family: 'Inter', ${bodyFont}, sans-serif;
    background: #fbf6ee;
    position: relative;
  }

  .border {
    position: absolute;
    inset: 12mm;
    border: 2px solid #7a1f3d;
    border-radius: 4px;
  }
  .border::before {
    content: '';
    position: absolute;
    inset: 4mm;
    border: 1px solid #c99a42;
  }

  .content {
    position: absolute;
    inset: 18mm 28mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .platform {
    display: flex;
    align-items: center;
    gap: 3mm;
  }
  .platform img {
    height: 12mm;
    width: 12mm;
    object-fit: contain;
  }
  .platform span {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 2px;
    color: #7a1f3d;
    text-transform: uppercase;
  }

  .title {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 34px;
    color: #2b1b1f;
    margin-top: 12mm;
  }

  .presented {
    font-size: 14px;
    color: #5a4a42;
    margin-top: 10mm;
  }

  .student-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 30px;
    color: #7a1f3d;
    margin-top: 4mm;
    border-bottom: 1px solid #c99a42;
    padding-bottom: 3mm;
    min-width: 120mm;
  }

  .completed {
    font-size: 14px;
    color: #5a4a42;
    margin-top: 8mm;
  }

  .course-title {
    font-family: ${bodyFont};
    font-weight: 600;
    font-size: 22px;
    color: #2b1b1f;
    margin-top: 3mm;
    max-width: 200mm;
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 6mm;
  }

  .footer-block {
    font-size: 11px;
    color: #9c8a72;
    text-align: ${dir === 'rtl' ? 'right' : 'left'};
  }
  .footer-block .label {
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 9px;
    color: #c9b896;
  }
  .footer-block .value {
    font-size: 13px;
    color: #2b1b1f;
    margin-top: 1mm;
    font-weight: 600;
  }

  .qr-block {
    text-align: center;
  }
  .qr-block img {
    width: 22mm;
    height: 22mm;
  }
  .qr-block .verify-text {
    font-size: 8px;
    color: #c9b896;
    margin-top: 1mm;
    max-width: 30mm;
  }
</style>
</head>
<body>
  <div class="border"></div>
  <div class="content">
    <div class="platform">
      <img src="${data.logoDataUrl}" alt="" />
      <span>${platformName}</span>
    </div>
    <div class="title">${labels.title}</div>
    <div class="presented">${labels.presented}</div>
    <div class="student-name">${escapeHtml(data.studentName)}</div>
    <div class="completed">${labels.completed}</div>
    <div class="course-title">${escapeHtml(data.courseTitle)}</div>
  </div>
  <div class="footer">
    <div class="footer-block">
      <div class="label">${labels.instructor}</div>
      <div class="value">${escapeHtml(data.teacherName)}</div>
    </div>
    <div class="qr-block">
      <img src="${data.qrCodeDataUrl}" alt="verification QR code" />
      <div class="verify-text">${labels.verify}</div>
    </div>
    <div class="footer-block">
      <div class="label">${labels.date}</div>
      <div class="value">${formatDate(data.completedAt, data.language)}</div>
      <div class="label" style="margin-top: 2mm;">${labels.certId}</div>
      <div class="value">${data.certificateNumber}</div>
    </div>
  </div>
</body>
</html>`;
}
