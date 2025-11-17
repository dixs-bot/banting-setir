"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  price: number;
  city: string;
  province: string;
  mileage: number | null;
  transmission: string;
  fuelType: string;
  images: { url: string; position: string }[];
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    dealerBrand: string | null;
    isVerified: boolean;
  };
  views: number;
  createdAt: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    condition: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    city: "",
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.city) params.append("city", filters.city);

      const response = await fetch(`/api/cars?${params.toString()}`);
      const data = await response.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCars();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDealerBadge = (user: Car["user"]) => {
    if (user.role === "DEALER_OFFICIAL" && user.isVerified) {
      return (
        <div className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Dealer Resmi {user.dealerBrand}
        </div>
      );
    } else if (user.role === "DEALER_SEMI") {
      return (
        <div className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Dealer / Showroom
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace Mobil</h1>
              <p className="text-sm text-gray-600">Platform Jual Beli Mobil Terpercaya</p>
            </div>
            <div className="flex gap-4">
              {session ? (
                <>
                  <Link
                    href="/upload"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Jual Mobil
                  </Link>
                  <button
                    onClick={() => {
                      fetch("/api/auth/signout", { method: "POST" }).then(() => {
                        router.push("/login");
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Cari mobil..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kondisi</option>
              <option value="BARU">Mobil Baru</option>
              <option value="BEKAS">Mobil Bekas</option>
            </select>
            <input
              type="text"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              placeholder="Brand (Toyota, Honda, dll)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Kota"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Harga Minimum"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Harga Maximum"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Car Listings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Tidak ada mobil ditemukan</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => {
              const mainImage = car.images.find(img => img.position === "DEPAN") || car.images[0];
              return (
                <Link
                  key={car.id}
                  href={`/cars/${car.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {mainImage && (
                      <img
                        src={mainImage.url}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                      {car.condition === "BARU" ? "Mobil Baru" : "Mobil Bekas"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      {getDealerBadge(car.user)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{car.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {car.year} • {car.transmission} • {car.fuelType}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {formatPrice(car.price)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{car.city}, {car.province}</span>
                      {car.mileage && <span>{car.mileage.toLocaleString()} km</span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {car.views} views
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="font-semibold text-lg mb-2">Marketplace Mobil</p>
            <p className="text-sm">Platform jual beli mobil bekas dan baru terpercaya di Indonesia</p>
            <p className="text-xs mt-4">© 2024 Marketplace Mobil. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
