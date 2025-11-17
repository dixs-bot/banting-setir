"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "CONSUMER",
    dealerBrand: "",
    nameTagFile: null as File | null,
  });
  const [nameTagPreview, setNameTagPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, nameTagFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setNameTagPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if ((formData.role === "DEALER_OFFICIAL" || formData.role === "DEALER_SEMI") && !formData.nameTagFile) {
      setError("Dealer wajib upload foto name tag");
      return;
    }

    if (formData.role === "DEALER_OFFICIAL" && !formData.dealerBrand) {
      setError("Dealer resmi wajib mengisi brand dealer");
      return;
    }

    setLoading(true);

    try {
      // Simulasi upload file (dalam production, upload ke cloud storage)
      let nameTagUrl = "";
      if (formData.nameTagFile) {
        nameTagUrl = nameTagPreview; // Dalam production, upload ke cloud dan dapatkan URL
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          dealerBrand: formData.dealerBrand || null,
          nameTagUrl: nameTagUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrasi gagal");
        return;
      }

      // Redirect ke login
      router.push("/login?registered=true");
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isDealer = formData.role === "DEALER_OFFICIAL" || formData.role === "DEALER_SEMI";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun</h1>
          <p className="text-gray-600">Marketplace Mobil Terpercaya</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipe Akun */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Akun
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="CONSUMER">Konsumen</option>
              <option value="DEALER_SEMI">Dealer / Showroom</option>
              <option value="DEALER_OFFICIAL">Dealer Resmi (Toyota, Honda, dll)</option>
            </select>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Brand Dealer (hanya untuk dealer resmi) */}
          {formData.role === "DEALER_OFFICIAL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Dealer Resmi
              </label>
              <input
                type="text"
                name="dealerBrand"
                value={formData.dealerBrand}
                onChange={handleInputChange}
                placeholder="Contoh: Toyota, Honda, Suzuki"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Upload Name Tag (untuk dealer) */}
          {isDealer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Foto Name Tag
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {nameTagPreview && (
                <div className="mt-4">
                  <img
                    src={nameTagPreview}
                    alt="Preview Name Tag"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Upload foto name tag Anda untuk verifikasi
              </p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
