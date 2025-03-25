"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Shield, Users, Activity, Award, Clock } from "lucide-react"
import TestimonialCarousel from "@/components/testimonial-carousel"
import FaqAccordion from "@/components/faq-accordion"
import { motion } from "framer-motion"

export default function LandingPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <main className="overflow-hidden">
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Solusi Lengkap untuk Kesehatan Kognitif
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Platform AI terintegrasi untuk skrining demensia, terapi kognitif, dan pemantauan kesehatan otak
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-teal-500" />}
              title="Tes MMSE Berbasis AI"
              description="Evaluasi kognitif komprehensif dengan analisis AI untuk deteksi dini gejala demensia"
              variants={fadeIn}
            />
            <FeatureCard
              icon={<Activity className="h-10 w-10 text-indigo-500" />}
              title="Latihan Otak Adaptif"
              description="Game dan aktivitas yang disesuaikan untuk melatih fungsi kognitif spesifik"
              variants={fadeIn}
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-500" />}
              title="Dashboard Pengasuh"
              description="Pemantauan jarak jauh dan notifikasi untuk keluarga dan pengasuh"
              variants={fadeIn}
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-emerald-500" />}
              title="Keamanan Data Medis"
              description="Perlindungan data pasien dengan enkripsi tingkat tinggi dan kepatuhan HIPAA"
              variants={fadeIn}
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 text-amber-500" />}
              title="Validasi Klinis"
              description="Dikembangkan bersama ahli saraf dan divalidasi melalui uji klinis"
              variants={fadeIn}
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-rose-500" />}
              title="Pemantauan Berkelanjutan"
              description="Pelacakan perubahan kognitif dari waktu ke waktu dengan analisis tren"
              variants={fadeIn}
            />
          </motion.div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Solusi untuk Semua Pihak
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Memoright mendukung seluruh ekosistem perawatan kesehatan kognitif
            </p>
          </motion.div>

          <Tabs defaultValue="patient" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="patient" className="text-base py-3">
                Pasien
              </TabsTrigger>
              <TabsTrigger value="caregiver" className="text-base py-3">
                Pengasuh
              </TabsTrigger>
              <TabsTrigger value="doctor" className="text-base py-3">
                Dokter
              </TabsTrigger>
            </TabsList>
            <TabsContent value="patient" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Untuk Pasien</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-teal-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Latihan kognitif harian yang menyenangkan</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-teal-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Pengingat obat dan aktivitas</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-teal-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Pelacakan kemajuan kognitif</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-teal-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Rekomendasi aktivitas personal</span>
                    </li>
                  </ul>
                  <Button className="mt-6" size="lg" asChild>
                    <Link href="/register">Mulai Sekarang</Link>
                  </Button>
                </div>
                <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3"
                    alt="Elderly person using a tablet for brain training"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="caregiver" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Untuk Pengasuh</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-indigo-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Pemantauan jarak jauh kondisi pasien</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-indigo-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Notifikasi perubahan perilaku</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-indigo-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Koordinasi perawatan dengan dokter</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-indigo-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Komunitas dukungan pengasuh</span>
                    </li>
                  </ul>
                  <Button className="mt-6" size="lg" asChild>
                    <Link href="/register">Daftar Sebagai Pengasuh</Link>
                  </Button>
                </div>
                <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2037&ixlib=rb-4.0.3"
                    alt="Caregiver helping elderly person"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="doctor" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Untuk Dokter</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-purple-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Dashboard analitik pasien komprehensif</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-purple-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Prediksi risiko berbasis AI</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-purple-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Integrasi dengan sistem EHR</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-purple-100 p-1 rounded-full">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Konsultasi telemedicine terintegrasi</span>
                    </li>
                  </ul>
                  <Button className="mt-6" size="lg" asChild>
                    <Link href="/register">Daftar Sebagai Dokter</Link>
                  </Button>
                </div>
                <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3"
                    alt="Doctor reviewing patient data on tablet"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Bagaimana Memoright Bekerja
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Platform komprehensif untuk mendeteksi, memantau, dan meningkatkan kesehatan kognitif
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Skrining Kognitif</h3>
              <p className="text-slate-600">
                Lakukan tes MMSE berbasis AI untuk mengevaluasi fungsi kognitif dan mendeteksi tanda-tanda awal
                demensia.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Latihan Kognitif Personal</h3>
              <p className="text-slate-600">
                Dapatkan program latihan otak yang disesuaikan berdasarkan hasil tes dan kebutuhan spesifik Anda.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pemantauan Berkelanjutan</h3>
              <p className="text-slate-600">
                Pantau kemajuan dari waktu ke waktu dengan analisis tren dan dapatkan dukungan dari pengasuh dan dokter.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Apa Kata Pengguna Kami
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Pengalaman nyata dari pasien, pengasuh, dan dokter yang menggunakan Memoright
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Pertanyaan Umum
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Jawaban untuk pertanyaan yang sering diajukan tentang Memoright
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Mulai Perjalanan Kesehatan Kognitif Anda
              </h2>
              <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
                Deteksi dini, perawatan personal, dan dukungan berkelanjutan untuk kesehatan otak yang lebih baik
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-teal-700 hover:bg-white/90" asChild>
                  <Link href="/register">Daftar Sekarang</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/contact">Hubungi Kami</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description, variants }) {
  return (
    <motion.div variants={variants}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4">{icon}</div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

