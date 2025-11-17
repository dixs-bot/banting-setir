"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  condition: string;
  price: number;
  address: string;
  city: string;
  province: string;
  mileage: number | null;
  transmission: string;
  fuelType: string;
  color: string;
  taxStatus: string;
  taxYear: number | null;
  stnkStatus: string | null;
  images: { url: string; position: string }[];
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    dealerBrand: string | null;
    isVerified: boolean;
    nameTagUrl: string | null;
  };
  views: number;
  createdAt: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      fetchCar();
    }
  }, [params.id]);

  const fetchCar = async () => {
    try {
      const response = await fetch(`/api/cars/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setCar(data.car);
        const mainImage = data.car.images.find((img: any) => img.position === "DEPAN") || data.car.images[0];
        setSelectedImage(mainImage?.url || "");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching car:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    if (!car) return;
    
    const message = encodeURIComponent(
      `Halo, saya tertarik dengan mobil:\n\n` +
      `${car.name}\n` +
      `Tahun: ${car.year}\n` +
      `Harga: ${formatPrice(car.price)}\n` +
      `Lokasi: ${car.city}, ${car.province}\n\n` +
      `Apakah masih tersedia?`
    );
    
    const phoneNumber = car.user.phone.replace(/^0/, "62").replace(/\D/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const getDealerBadge = () => {
    if (!car) return null;
    
    if (car.user.role === "DEALER_OFFICIAL" && car.user.isVerified) {
      return (
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Dealer Resmi {car.user.dealerBrand}
        </div>
      );
    } else if (car.user.role === "DEALER_SEMI") {
      return (
        <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Dealer / Showroom
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
        Penjual Perorangan
      </div>
    );
  };

  const getImageLabel = (position: string) => {
    const labels: { [key: string]: string } = {
      DEPAN: "Depan",
      SAMPING_KIRI: "Samping Kiri",
      SAMPING_KANAN: "Samping Kanan",
      BELAKANG: "Belakang",
      DALAM: "Interior",
      DASHBOARD: "Dashboard",
    };
    return labels[position] || position;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Kembali
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Mobil</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={car.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-6 gap-2">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image.url)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image.url
                          ? "border-blue-600 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={getImageLabel(image.position)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 text-center">
                        {getImageLabel(image.position)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <span className="font-semibold">{car.brand}</span>
                    <span>•</span>
                    <span>{car.model}</span>
                    <span>•</span>
                    <span>{car.year}</span>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                  {car.condition === "BARU" ? "Mobil Baru" : "Mobil Bekas"}
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatPrice(car.price)}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Transmisi</div>
                  <div className="font-semibold">{car.transmission}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Bahan Bakar</div>
                  <div className="font-semibold">{car.fuelType}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Warna</div>
                  <div className="font-semibold">{car.color}</div>
                </div>
                {car.mileage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Kilometer</div>
                    <div className="font-semibold">{car.mileage.toLocaleString()} km</div>
                  </div>
                )}
              </div>

              {/* Tax & Document Status */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Status Pajak & Dokumen</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${car.taxStatus === "AKTIF" ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-sm">
                      Pajak: <span className="font-semibold">{car.taxStatus === "AKTIF" ? "Aktif" : "Tidak Aktif"}</span>
                    </span>
                  </div>
                  {car.taxYear && (
                    <div className="text-sm">
                      Tahun Pajak: <span className="font-semibold">{car.taxYear}</span>
                    </div>
                  )}
                  {car.stnkStatus && (
                    <div className="text-sm">
                      STNK: <span className="font-semibold">{car.stnkStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Deskripsi</h3>
                  <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
                </div>
              )}

              {/* Location */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3">Lokasi</h3>
                <p className="text-gray-700">
                  <span className="font-semibold">{car.city}, {car.province}</span>
                </p>
                <p className="text-gray-600 text-sm mt-1">{car.address}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              {/* Seller Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Informasi Penjual</h3>
                <div className="space-y-3">
                  <div>
                    {getDealerBadge()}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Nama</div>
                    <div className="font-semibold">{car.user.name}</div>
                  </div>
                  {car.user.role === "DEALER_OFFICIAL" && car.user.nameTagUrl && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Name Tag Dealer</div>
                      <img
                        src={car.user.nameTagUrl}
                        alt="Name Tag"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat via WhatsApp
              </button>

              <div className="text-center text-sm text-gray-600">
                <p>{car.views} orang telah melihat mobil ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
