"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Apa itu Memoright?",
    answer:
      "Memoright adalah aplikasi kesehatan kognitif berbasis AI yang membantu skrining demensia dan menyediakan terapi kognitif untuk meningkatkan fungsi otak dan kualitas hidup.",
  },
  {
    question: "Bagaimana cara kerja tes MMSE AI?",
    answer:
      "Tes MMSE AI menggunakan algoritma kecerdasan buatan untuk mengevaluasi fungsi kognitif melalui serangkaian pertanyaan dan tugas interaktif. Hasil tes akan memberikan skor dan rekomendasi personal.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Ya, kami memprioritaskan keamanan data. Semua informasi kesehatan dilindungi dengan enkripsi tingkat tinggi dan kami mematuhi standar keamanan data kesehatan internasional.",
  },
  {
    question: "Siapa yang dapat mengakses dashboard pengasuh?",
    answer:
      "Dashboard pengasuh hanya dapat diakses oleh individu yang telah diberi izin oleh pengguna utama. Ini bisa termasuk anggota keluarga, pengasuh profesional, atau tenaga medis.",
  },
  {
    question: "Apakah Memoright dapat menggantikan diagnosis dokter?",
    answer:
      "Tidak. Memoright dirancang sebagai alat bantu, bukan pengganti diagnosis profesional. Hasil tes dan rekomendasi sebaiknya didiskusikan dengan tenaga medis Anda.",
  },
]

export default function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

