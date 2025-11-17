import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, dealerBrand, nameTagUrl } = body;

    // Validasi input
    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi dealer harus upload name tag
    if ((role === "DEALER_OFFICIAL" || role === "DEALER_SEMI") && !nameTagUrl) {
      return NextResponse.json(
        { error: "Dealer wajib upload foto name tag" },
        { status: 400 }
      );
    }

    // Validasi dealer resmi harus isi brand
    if (role === "DEALER_OFFICIAL" && !dealerBrand) {
      return NextResponse.json(
        { error: "Dealer resmi wajib mengisi brand dealer" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        dealerBrand: role === "DEALER_OFFICIAL" ? dealerBrand : null,
        nameTagUrl: (role === "DEALER_OFFICIAL" || role === "DEALER_SEMI") ? nameTagUrl : null,
        isVerified: role === "DEALER_OFFICIAL" ? false : true, // Dealer resmi perlu verifikasi
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
