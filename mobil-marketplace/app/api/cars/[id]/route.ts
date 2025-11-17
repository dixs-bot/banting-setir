import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            dealerBrand: true,
            isVerified: true,
            nameTagUrl: true,
          },
        },
      },
    });

    if (!car) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Increment views
    await prisma.car.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ car });
  } catch (error) {
    console.error("Get car error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mobil" },
      { status: 500 }
    );
  }
}
