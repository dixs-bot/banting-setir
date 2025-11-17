import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      brand,
      model,
      year,
      description,
      condition,
      price,
      address,
      city,
      province,
      mileage,
      transmission,
      fuelType,
      color,
      taxStatus,
      taxYear,
      stnkStatus,
      images,
    } = body;

    // Validasi kategori harus mobil
    const vehicleKeywords = ['mobil', 'car', 'sedan', 'suv', 'mpv', 'hatchback', 'truck', 'pickup'];
    const isVehicle = vehicleKeywords.some(keyword => 
      name.toLowerCase().includes(keyword) || 
      brand.toLowerCase().includes(keyword) ||
      model.toLowerCase().includes(keyword)
    );

    if (!isVehicle) {
      return NextResponse.json(
        { error: "ERROR: Barang yang Anda jual bukan kendaraan / mobil. Marketplace ini khusus untuk penjualan mobil." },
        { status: 400 }
      );
    }

    // Validasi 6 foto wajib
    if (!images || images.length !== 6) {
      return NextResponse.json(
        { error: "Wajib upload 6 foto: Depan, Samping Kiri, Samping Kanan, Belakang, Dalam, Dashboard" },
        { status: 400 }
      );
    }

    // Validasi posisi foto
    const requiredPositions = ['DEPAN', 'SAMPING_KIRI', 'SAMPING_KANAN', 'BELAKANG', 'DALAM', 'DASHBOARD'];
    const imagePositions = images.map((img: any) => img.position);
    const missingPositions = requiredPositions.filter(pos => !imagePositions.includes(pos));

    if (missingPositions.length > 0) {
      return NextResponse.json(
        { error: `Foto berikut wajib diisi: ${missingPositions.join(', ')}` },
        { status: 400 }
      );
    }

    // Buat mobil baru
    const car = await prisma.car.create({
      data: {
        userId: session.user.id,
        name,
        brand,
        model,
        year: parseInt(year),
        description,
        condition,
        price: parseFloat(price),
        address,
        city,
        province,
        mileage: mileage ? parseInt(mileage) : null,
        transmission,
        fuelType,
        color,
        taxStatus,
        taxYear: taxYear ? parseInt(taxYear) : null,
        stnkStatus,
        images: {
          create: images.map((img: any) => ({
            url: img.url,
            position: img.position,
          })),
        },
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            dealerBrand: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Mobil berhasil ditambahkan", car },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan mobil" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const condition = searchParams.get("condition");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const where: any = {
      isActive: true,
    };

    if (condition) {
      where.condition = condition;
    }

    if (brand) {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const cars = await prisma.car.findMany({
      where,
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            dealerBrand: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ cars });
  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mobil" },
      { status: 500 }
    );
  }
}
