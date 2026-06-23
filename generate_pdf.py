from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import os

output_path = r"C:\Users\muham\.gemini\antigravity\brain\aeeb6ee6-e266-4704-a632-e1b2d6433155\Panduan_CheckIn_GaulGym.pdf"
# Reduced margins to fit 1 page
doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=40, bottomMargin=30)
styles = getSampleStyleSheet()

# Create custom styles with slightly smaller fonts
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=16,
    spaceAfter=10,
    alignment=TA_CENTER,
    textColor="#1F2937"
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=12,
    spaceBefore=10,
    spaceAfter=6,
    textColor="#2563EB"
)

normal_style = styles['Normal']
normal_style.fontSize = 10
normal_style.leading = 14
normal_style.textColor = "#374151"

story = []

# Title
story.append(Paragraph("Panduan Sistem Check-In Baru Gaul Gym", title_style))
story.append(Paragraph("Halo Ko Patrick, ada kabar baik!", ParagraphStyle('BoldText', parent=normal_style, fontName='Helvetica-Bold', fontSize=11)))
story.append(Spacer(1, 6))
story.append(Paragraph("Sistem Check-In kita sekarang sudah di-upgrade jadi jauh lebih canggih dan fleksibel. Kalau ada member yang malas atau lupa bawa barcode/QR Code, admin sekarang bisa melakukan Check-In dengan sangat cepat lewat menu <b>Input Manual</b>.", normal_style))

# Section 1
story.append(Paragraph("1. Pencarian Cerdas Pakai Nama", heading_style))
story.append(Paragraph("Admin tidak perlu mengetik nama lengkap member. Cukup ketik nama panggilannya saja.", normal_style))
story.append(Spacer(1, 4))
story.append(Paragraph("<b>Contoh:</b> Ada member bernama 'Budi Santoso Wijaya'. Admin cukup ketik <b>'budi'</b> atau <b>'santoso'</b>, lalu klik tombol cari. Sistem akan langsung menemukan member tersebut.", normal_style))

# Section 2
story.append(Paragraph("2. Pencarian Kilat Pakai Nomor HP (Paling Cepat)", heading_style))
story.append(Paragraph("Ini cara yang <b>paling direkomendasikan</b>. Admin tidak perlu mengetik panjang-panjang nomor HP dari awal sampai akhir.", normal_style))
story.append(Spacer(1, 4))
bullet_points_2 = [
    Paragraph("<b>Tips Rahasia:</b> Cukup ketik <b>4 Angka Paling Belakang (Ekor)</b> dari nomor HP member.", normal_style),
    Paragraph("<b>Contoh:</b> Nomor HP member adalah 0812-3456-<b>7890</b>. Admin cukup ketik <b>'7890'</b> saja di kolom pencarian.", normal_style),
    Paragraph("<i>Kenapa pakai 4 angka belakang?</i> Karena kalau pakai awalan (seperti 0812), sistem akan memunculkan ratusan orang. Tapi kalau pakai 4 angka belakang, itu sangat unik dan pasti langsung ketemu orang yang pas!", normal_style)
]
story.append(ListFlowable([ListItem(p) for p in bullet_points_2], bulletType='bullet'))

# Section 3
story.append(Paragraph("3. Anti Salah Pilih Orang (Sistem Pilihan Otomatis)", heading_style))
story.append(Paragraph("Bagaimana kalau ternyata ada 2 orang bernama 'Budi', atau ada 2 orang yang kebetulan 4 angka belakang nomor HP-nya sama-sama '7890'?", normal_style))
story.append(Spacer(1, 4))
bullet_points_3 = [
    Paragraph("Ko Patrick tidak perlu khawatir sistem akan salah check-in!", normal_style),
    Paragraph("Kalau sistem menemukan ada orang yang kembar/mirip pencariannya, sistem <b>tidak akan langsung check-in</b>. Sistem akan memunculkan daftar pilihan (lengkap dengan nama dan sisa nomor HP-nya).", normal_style),
    Paragraph("Admin tinggal melihat daftarnya, lalu <b>klik nama orang yang benar</b> yang sedang berdiri di depan meja admin.", normal_style)
]
story.append(ListFlowable([ListItem(p) for p in bullet_points_3], bulletType='bullet'))

# Summary
story.append(Paragraph("Ringkasan Cara Pakai di Lapangan:", heading_style))
steps = [
    Paragraph("Member datang tanpa buka HP.", normal_style),
    Paragraph("Admin tanya: <i>'Atas nama siapa Kak?'</i> atau <i>'Boleh sebutkan 4 angka belakang nomor HP-nya?'</i>", normal_style),
    Paragraph("Admin ketik di menu 'Input Manual' -> Klik Cari.", normal_style),
    Paragraph("Check-in berhasil dalam hitungan detik!", normal_style)
]
story.append(ListFlowable([ListItem(p) for p in steps], bulletType='1'))
story.append(Spacer(1, 10))
story.append(Paragraph("Silakan minta admin untuk me-refresh halaman webnya dan langsung dicoba ya. Fiturnya sudah aktif 100%!", ParagraphStyle('Footer', parent=normal_style, fontName='Helvetica-Oblique')))

doc.build(story)
print(f"PDF successfully generated at: {output_path}")
